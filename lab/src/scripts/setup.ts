import "reflect-metadata";
import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { User } from "../entities";

async function main() {
  const args = process.argv.slice(2);
  const usernameIdx = args.indexOf("--dm-user");
  const passIdx = args.indexOf("--dm-pass");

  if (usernameIdx === -1 || passIdx === -1) {
    console.error("Usage: npm run setup -- --dm-user <username> --dm-pass <password>");
    process.exit(1);
  }

  const username = args[usernameIdx + 1];
  const password = args[passIdx + 1];

  if (!username || !password) {
    console.error("Both --dm-user and --dm-pass must have values");
    process.exit(1);
  }

  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);

  const existing = await userRepo.findOne({ where: { username } });
  if (existing) {
    console.log(`User "${username}" already exists. Updating password.`);
    existing.passwordHash = await bcrypt.hash(password, 12);
    existing.role = "dm";
    await userRepo.save(existing);
    console.log("Password updated.");
  } else {
    const user = userRepo.create({
      username,
      passwordHash: await bcrypt.hash(password, 12),
      displayName: username,
      role: "dm",
    });
    await userRepo.save(user);
    console.log(`DM account "${username}" created.`);
  }

  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
