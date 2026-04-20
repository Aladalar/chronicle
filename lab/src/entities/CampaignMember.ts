import { Entity, Column, ManyToOne, JoinColumn, Unique } from "typeorm";
import { BaseEntity } from "./Base";
import { Campaign } from "./Campaign";
import { User } from "./User";

@Entity("campaign_members")
@Unique(["inviteCode"])
export class CampaignMember extends BaseEntity {
  @ManyToOne(() => Campaign, (c) => c.members, { nullable: false })
  @JoinColumn({ name: "campaign_id" })
  campaign!: Campaign;

  @Column({ name: "campaign_id" })
  campaignId!: string;

  @ManyToOne(() => User, (u) => u.memberships, { nullable: true })
  @JoinColumn({ name: "user_id" })
  user!: User | null;

  @Column({ name: "user_id", nullable: true })
  userId!: string | null;

  @Column({ type: "enum", enum: ["dm", "player"], default: "player" })
  role!: "dm" | "player";

  @Column({ type: "uuid", name: "invite_code" })
  inviteCode!: string;

  @Column({ type: "boolean", name: "invite_claimed", default: false })
  inviteClaimed!: boolean;
}
