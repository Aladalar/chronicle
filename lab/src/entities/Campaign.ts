import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base";
import { User } from "./User";
import { CampaignMember } from "./CampaignMember";

@Entity("campaigns")
export class Campaign extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "int", name: "current_age", default: 1 })
  currentAge!: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "created_by" })
  createdBy!: User;

  @Column({ name: "created_by" })
  createdById!: string;

  @OneToMany(() => CampaignMember, (m) => m.campaign)
  members!: CampaignMember[];
}
