import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base";
import { User } from "./User";

@Entity("proposals")
export class Proposal extends BaseEntity {
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "author_id" })
  author!: User;

  @Column({ name: "author_id" })
  authorId!: string;

  @Column({ type: "varchar", length: 100, name: "table_name" })
  tableName!: string;

  @Column({ type: "enum", enum: ["create", "update", "delete"] })
  op!: "create" | "update" | "delete";

  @Column({ type: "uuid", name: "target_id", nullable: true })
  targetId!: string | null;

  @Column({ type: "simple-json", nullable: true })
  data!: Record<string, unknown> | null;

  @Column({ type: "enum", enum: ["pending", "approved", "rejected"], default: "pending" })
  status!: "pending" | "approved" | "rejected";

  @Column({ type: "text", nullable: true })
  reason!: string | null;
}
