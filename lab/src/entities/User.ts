import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "./Base";
import { CampaignMember } from "./CampaignMember";

@Entity("users")
export class User extends BaseEntity {
  @Column({ type: "varchar", length: 50, unique: true })
  username!: string;

  @Column({ type: "varchar", length: 255, name: "password_hash" })
  passwordHash!: string;

  @Column({ type: "varchar", length: 100, name: "display_name" })
  displayName!: string;

  @Column({ type: "enum", enum: ["dm", "player"], default: "player" })
  role!: "dm" | "player";

  @OneToMany(() => CampaignMember, (m) => m.user)
  memberships!: CampaignMember[];
}
