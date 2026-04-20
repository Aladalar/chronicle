import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "./config";
import path from "path";

export const AppDataSource = new DataSource({
  type: "mariadb",
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  username: config.db.user,
  password: config.db.pass,
  charset: "utf8mb4",
  synchronize: config.nodeEnv === "development",
  logging: config.nodeEnv === "development",
  entities: [path.join(__dirname, "entities", "**", "*.{ts,js}")],
  migrations: [path.join(__dirname, "migrations", "**", "*.{ts,js}")],
});
