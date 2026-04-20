import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { User, CampaignMember } from "../entities";
import { authenticate, requireRole, signToken, AppError } from "../middleware";

const router = Router();
const SALT_ROUNDS = 12;

// ─── LOGIN ────────────────────────────────────────────────────
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) throw new AppError(400, "Username and password required");

    const user = await AppDataSource.getRepository(User).findOne({ where: { username } });
    if (!user) throw new AppError(401, "Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, "Invalid credentials");

    const token = signToken({ userId: user.id, role: user.role });
    res.json({
      token,
      user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role },
    });
  } catch (e) { next(e); }
});

// ─── REGISTER VIA INVITE CODE ─────────────────────────────────
router.post("/register/:inviteCode", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { inviteCode } = req.params;
    const { username, password, displayName } = req.body;
    if (!username || !password) throw new AppError(400, "Username and password required");

    const memberRepo = AppDataSource.getRepository(CampaignMember);
    const member = await memberRepo.findOne({ where: { inviteCode } });
    if (!member) throw new AppError(404, "Invalid invite code");
    if (member.inviteClaimed) throw new AppError(409, "Invite already claimed");

    // Check username uniqueness
    const userRepo = AppDataSource.getRepository(User);
    const existing = await userRepo.findOne({ where: { username } });
    if (existing) throw new AppError(409, "Username already taken");

    // Create user
    const user = userRepo.create({
      username,
      passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
      displayName: displayName || username,
      role: "player",
    });
    const savedUser = await userRepo.save(user);

    // Claim invite
    member.userId = savedUser.id;
    member.inviteClaimed = true;
    await memberRepo.save(member);

    const token = signToken({ userId: savedUser.id, role: savedUser.role });
    res.status(201).json({
      token,
      user: { id: savedUser.id, username: savedUser.username, displayName: savedUser.displayName, role: savedUser.role },
      campaignId: member.campaignId,
    });
  } catch (e) { next(e); }
});

// ─── RESET PASSWORD (DM only) ─────────────────────────────────
router.post(
  "/reset-password",
  authenticate,
  requireRole("dm"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, newPassword } = req.body;
      if (!userId || !newPassword) throw new AppError(400, "userId and newPassword required");

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) throw new AppError(404, "User not found");

      user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await userRepo.save(user);

      res.json({ success: true });
    } catch (e) { next(e); }
  },
);

// ─── ME (get current user info) ───────────────────────────────
router.get("/me", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: req.auth!.userId },
    });
    if (!user) throw new AppError(404, "User not found");
    res.json({ id: user.id, username: user.username, displayName: user.displayName, role: user.role });
  } catch (e) { next(e); }
});

export default router;
