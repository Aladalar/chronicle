import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base";
import { Campaign } from "./Campaign";
import { User } from "./User";
import { RefType, RefArcaneElement } from "./RefTables";

// ─── Journal ──────────────────────────────────────────────────
@Entity("journal_entries")
export class JournalEntry extends BaseEntity {
  @ManyToOne(() => Campaign, { nullable: false })
  @JoinColumn({ name: "campaign_id" })
  campaign!: Campaign;

  @Column({ name: "campaign_id" })
  campaignId!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "author_id" })
  author!: User;

  @Column({ name: "author_id" })
  authorId!: string;

  @Column({ type: "varchar", length: 300 })
  title!: string;

  @Column({ type: "text", nullable: true })
  content!: string | null;

  @Column({ type: "date", name: "session_date", nullable: true })
  sessionDate!: string | null;

  @Column({ type: "simple-json", nullable: true })
  tags!: string[] | null;
}

// ─── Lore ─────────────────────────────────────────────────────
@Entity("lore_entries")
export class LoreEntry extends BaseEntity {
  @ManyToOne(() => Campaign, { nullable: false })
  @JoinColumn({ name: "campaign_id" })
  campaign!: Campaign;

  @Column({ name: "campaign_id" })
  campaignId!: string;

  @Column({ type: "varchar", length: 300 })
  title!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  category!: string | null;

  @Column({ type: "text", nullable: true })
  content!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  url!: string | null;
}

// ─── Ingredients ──────────────────────────────────────────────
@Entity("ingredients")
export class Ingredient extends BaseEntity {
  @ManyToOne(() => Campaign, { nullable: false })
  @JoinColumn({ name: "campaign_id" })
  campaign!: Campaign;

  @Column({ name: "campaign_id" })
  campaignId!: string;

  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  type!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  biome!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  occurrence!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  location!: string | null;

  @OneToMany(() => IngredientPart, (p) => p.ingredient, { cascade: true, eager: true })
  parts!: IngredientPart[];
}

@Entity("ingredient_parts")
export class IngredientPart extends BaseEntity {
  @ManyToOne(() => Ingredient, (i) => i.parts, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "ingredient_id" })
  ingredient!: Ingredient;

  @Column({ name: "ingredient_id" })
  ingredientId!: string;

  @Column({ type: "varchar", length: 100 })
  part!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  effect!: string | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  power!: string | null;
}

// ─── Transmutations ──────────────────────────────────────────
@Entity("transmutations")
export class Transmutation extends BaseEntity {
  @ManyToOne(() => Campaign, { nullable: false })
  @JoinColumn({ name: "campaign_id" })
  campaign!: Campaign;

  @Column({ name: "campaign_id" })
  campaignId!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 300, nullable: true })
  notation!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  type!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  level!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  cost!: string | null;
}

// ─── Runes ────────────────────────────────────────────────────
@Entity("runes")
export class Rune extends BaseEntity {
  @ManyToOne(() => Campaign, { nullable: false })
  @JoinColumn({ name: "campaign_id" })
  campaign!: Campaign;

  @Column({ name: "campaign_id" })
  campaignId!: string;

  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  effect!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  arcane!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 20, default: "effect" })
  category!: string; // effect, logic, utility
}
