import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base";

/**
 * GLOBAL reference tables — shared across all campaigns.
 * DM manages; players read.
 * No campaign_id on any of these.
 */

// ─── Master type enum ─────────────────────────────────────────
@Entity("ref_types")
export class RefType extends BaseEntity {
  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 15, nullable: true })
  icon!: string | null;

  @Column({ type: "varchar", length: 7, nullable: true })
  color!: string | null;

  @Column({ type: "simple-json", nullable: true })
  designations!: string[] | null;

  @Column({ type: "int", name: "sort_order", default: 0 })
  sortOrder!: number;
}

// ─── Ability catalog ──────────────────────────────────────────
@Entity("ref_abilities")
export class RefAbility extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @ManyToOne(() => RefType, { nullable: true })
  @JoinColumn({ name: "type_id" })
  type!: RefType | null;

  @Column({ name: "type_id", nullable: true })
  typeId!: string | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  attribute!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}

// ─── Knowledge catalog ────────────────────────────────────────
@Entity("ref_knowledge")
export class RefKnowledge extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @ManyToOne(() => RefType, { nullable: true })
  @JoinColumn({ name: "type_id" })
  type!: RefType | null;

  @Column({ name: "type_id", nullable: true })
  typeId!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}

// ─── Trait catalog ────────────────────────────────────────────
@Entity("ref_traits")
export class RefTrait extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "simple-json", name: "default_mods", nullable: true })
  defaultMods!: Record<string, number> | null;

  @ManyToOne(() => RefType, { nullable: true })
  @JoinColumn({ name: "type_id" })
  type!: RefType | null;

  @Column({ name: "type_id", nullable: true })
  typeId!: string | null;
}

// ─── Arcane elements catalog ──────────────────────────────────
@Entity("ref_arcane_elements")
export class RefArcaneElement extends BaseEntity {
  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "int", name: "sort_order", default: 0 })
  sortOrder!: number;
}

// ─── Rank catalog ─────────────────────────────────────────────
@Entity("ref_ranks")
export class RefRank extends BaseEntity {
  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "int", name: "tier_order", default: 0 })
  tierOrder!: number;

  @Column({ type: "int", name: "progress_cap", default: 10 })
  progressCap!: number;
}

// ─── Race catalog ─────────────────────────────────────────────
@Entity("ref_races")
export class RefRace extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "int", nullable: true })
  age!: number | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}

// ─── Item template catalog ────────────────────────────────────
@Entity("ref_item_templates")
export class RefItemTemplate extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  attributes!: string | null;

  @ManyToOne(() => RefType, { nullable: true })
  @JoinColumn({ name: "rarity_id" })
  rarity!: RefType | null;

  @Column({ name: "rarity_id", nullable: true })
  rarityId!: string | null;

  @ManyToOne(() => RefType, { nullable: true })
  @JoinColumn({ name: "type_id" })
  type!: RefType | null;

  @Column({ name: "type_id", nullable: true })
  typeId!: string | null;
}

// ─── Items ────────────────────────────────────────────────────
@Entity("ref_items")
export class RefItem extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @ManyToOne(() => RefItemTemplate, { nullable: true })
  @JoinColumn({ name: "template_id" })
  template!: RefItemTemplate | null;

  @Column({ name: "template_id", nullable: true })
  templateId!: string | null;

  @Column({ type: "int", nullable: true })
  age!: number | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  attributes!: string | null;

  @ManyToOne(() => RefType, { nullable: true })
  @JoinColumn({ name: "rarity_id" })
  rarity!: RefType | null;

  @Column({ name: "rarity_id", nullable: true })
  rarityId!: string | null;

  @ManyToOne(() => RefType, { nullable: true })
  @JoinColumn({ name: "type_id" })
  type!: RefType | null;

  @Column({ name: "type_id", nullable: true })
  typeId!: string | null;
}

// ─── Beasts ───────────────────────────────────────────────────
@Entity("ref_beasts")
export class RefBeast extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "int", nullable: true })
  age!: number | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  habitat!: string | null;

  @Column({ type: "varchar", length: 50, name: "threat_level", nullable: true })
  threatLevel!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}

// ─── Flora ────────────────────────────────────────────────────
@Entity("ref_flora")
export class RefFlora extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "int", nullable: true })
  age!: number | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  biome!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}

// ─── Materials ────────────────────────────────────────────────
@Entity("ref_materials")
export class RefMaterial extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "int", nullable: true })
  age!: number | null;

  @ManyToOne(() => RefType, { nullable: true })
  @JoinColumn({ name: "type_id" })
  type!: RefType | null;

  @Column({ name: "type_id", nullable: true })
  typeId!: string | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  biome!: string | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  occurrence!: string | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  location!: string | null;

  @Column({ type: "simple-json", nullable: true })
  parts!: Array<{ part: string; effect: string; power: string }> | null;
}

// ─── Monsters ─────────────────────────────────────────────────
@Entity("ref_monsters")
export class RefMonster extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "int", nullable: true })
  age!: number | null;

  @ManyToOne(() => RefType, { nullable: true })
  @JoinColumn({ name: "type_id" })
  type!: RefType | null;

  @Column({ name: "type_id", nullable: true })
  typeId!: string | null;

  @Column({ type: "varchar", length: 50, name: "threat_level", nullable: true })
  threatLevel!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}

// ─── NPC Important ────────────────────────────────────────────
@Entity("ref_npc_important")
export class RefNpcImportant extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "int", nullable: true })
  age!: number | null;

  @ManyToOne(() => RefRace, { nullable: true })
  @JoinColumn({ name: "race_id" })
  race!: RefRace | null;

  @Column({ name: "race_id", nullable: true })
  raceId!: string | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  role!: string | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  affiliation!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}

// ─── Gods ─────────────────────────────────────────────────────
@Entity("ref_gods")
export class RefGod extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "int", nullable: true })
  age!: number | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  domain!: string | null;

  @ManyToOne(() => RefType, { nullable: true })
  @JoinColumn({ name: "type_id" })
  type!: RefType | null;

  @Column({ name: "type_id", nullable: true })
  typeId!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}

// ─── NPC Other ────────────────────────────────────────────────
@Entity("ref_npc_other")
export class RefNpcOther extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "int", nullable: true })
  age!: number | null;

  @ManyToOne(() => RefRace, { nullable: true })
  @JoinColumn({ name: "race_id" })
  race!: RefRace | null;

  @Column({ name: "race_id", nullable: true })
  raceId!: string | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  role!: string | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;
}

// ─── Settlements ──────────────────────────────────────────────
@Entity("ref_settlements")
export class RefSettlement extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "int", nullable: true })
  age!: number | null;

  @Column({ type: "int", nullable: true })
  population!: number | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  governance!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}

// ─── Wonders ──────────────────────────────────────────────────
@Entity("ref_wonders")
export class RefWonder extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "int", nullable: true })
  age!: number | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  kind!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}

// ─── Ruins ────────────────────────────────────────────────────
@Entity("ref_ruins")
export class RefRuin extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "int", nullable: true })
  age!: number | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  origin!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}

// ─── Dungeons ─────────────────────────────────────────────────
@Entity("ref_dungeons")
export class RefDungeon extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "int", nullable: true })
  age!: number | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  inhabitant!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}

// ─── Spells ───────────────────────────────────────────────────
@Entity("ref_spells")
export class RefSpell extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "int", nullable: true })
  age!: number | null;

  @ManyToOne(() => RefType, { nullable: true })
  @JoinColumn({ name: "type_id" })
  type!: RefType | null;

  @Column({ name: "type_id", nullable: true })
  typeId!: string | null;

  @ManyToOne(() => RefType, { nullable: true })
  @JoinColumn({ name: "arcane_id" })
  arcaneType!: RefType | null;

  @Column({ name: "arcane_id", nullable: true })
  arcaneId!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  level!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  cost!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}

// ─── Tomes ────────────────────────────────────────────────────
@Entity("ref_tomes")
export class RefTome extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "int", nullable: true })
  age!: number | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  source!: string | null;

  @ManyToOne(() => RefType, { nullable: true })
  @JoinColumn({ name: "type_id" })
  type!: RefType | null;

  @Column({ name: "type_id", nullable: true })
  typeId!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}

// ─── Transmutations (global) ──────────────────────────────────
@Entity("ref_transmutations")
export class RefTransmutation extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "int", nullable: true })
  age!: number | null;

  @Column({ type: "varchar", length: 300, nullable: true })
  notation!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  type!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  level!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  cost!: string | null;
}

// ─── Runes (global) ──────────────────────────────────────────
@Entity("ref_runes")
export class RefRune extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "int", nullable: true })
  age!: number | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  effect!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  arcane!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  category!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}
