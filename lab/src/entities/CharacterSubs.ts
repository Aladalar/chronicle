import { Entity, Column, ManyToOne, JoinColumn, Unique } from "typeorm";
import { BaseEntity } from "./Base";
import { Character } from "./Character";
import { RefAbility, RefKnowledge, RefTrait, RefArcaneElement, RefRank, RefItemTemplate } from "./RefTables";

// ─── Attributes (9 per character) ─────────────────────────────
@Entity("character_attributes")
@Unique(["characterId", "attribute"])
export class CharacterAttribute extends BaseEntity {
  @ManyToOne(() => Character, (c) => c.attributes, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "character_id" })
  character!: Character;

  @Column({ name: "character_id" })
  characterId!: string;

  @Column({ type: "varchar", length: 10 })
  attribute!: string; // STR, END, FOR, ...

  @Column({ type: "int", default: 0 })
  base!: number;

  @Column({ type: "int", default: 0 })
  modifier!: number;

  @Column({ type: "int", default: 0 })
  progress!: number; // 0-5
}

// ─── Abilities ────────────────────────────────────────────────
@Entity("character_abilities")
export class CharacterAbility extends BaseEntity {
  @ManyToOne(() => Character, (c) => c.abilities, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "character_id" })
  character!: Character;

  @Column({ name: "character_id" })
  characterId!: string;

  @ManyToOne(() => RefAbility, { nullable: true })
  @JoinColumn({ name: "ref_ability_id" })
  refAbility!: RefAbility | null;

  @Column({ name: "ref_ability_id", nullable: true })
  refAbilityId!: string | null;

  @Column({ type: "varchar", length: 200 })
  name!: string;

  @ManyToOne(() => RefRank, { nullable: true })
  @JoinColumn({ name: "rank_id" })
  rank!: RefRank | null;

  @Column({ name: "rank_id", nullable: true })
  rankId!: string | null;

  @Column({ type: "int", default: 0 })
  progress!: number;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ type: "int", name: "sort_order", default: 0 })
  sortOrder!: number;
}

// ─── Knowledge ────────────────────────────────────────────────
@Entity("character_knowledge")
export class CharacterKnowledge extends BaseEntity {
  @ManyToOne(() => Character, (c) => c.knowledge, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "character_id" })
  character!: Character;

  @Column({ name: "character_id" })
  characterId!: string;

  @ManyToOne(() => RefKnowledge, { nullable: true })
  @JoinColumn({ name: "ref_knowledge_id" })
  refKnowledge!: RefKnowledge | null;

  @Column({ name: "ref_knowledge_id", nullable: true })
  refKnowledgeId!: string | null;

  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "int", default: 0 })
  progress!: number;

  @ManyToOne(() => RefArcaneElement, { nullable: true })
  @JoinColumn({ name: "arcane_element_id" })
  arcaneElement!: RefArcaneElement | null;

  @Column({ name: "arcane_element_id", nullable: true })
  arcaneElementId!: string | null;

  @Column({ type: "varchar", length: 20, name: "arcane_level", nullable: true })
  arcaneLevel!: string | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ type: "int", name: "sort_order", default: 0 })
  sortOrder!: number;
}

// ─── Inventory ────────────────────────────────────────────────
@Entity("character_inventory")
export class CharacterInventory extends BaseEntity {
  @ManyToOne(() => Character, (c) => c.inventory, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "character_id" })
  character!: Character;

  @Column({ name: "character_id" })
  characterId!: string;

  @ManyToOne(() => RefItemTemplate, { nullable: true })
  @JoinColumn({ name: "ref_item_id" })
  refItem!: RefItemTemplate | null;

  @Column({ name: "ref_item_id", nullable: true })
  refItemId!: string | null;

  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  attributes!: string | null;

  @Column({ type: "varchar", length: 20, default: "Common" })
  rarity!: string;

  @Column({ type: "varchar", length: 20, name: "item_condition", default: "Ok" })
  itemCondition!: string;

  @Column({ type: "int", default: 1 })
  quantity!: number;

  @Column({ type: "int", name: "sort_order", default: 0 })
  sortOrder!: number;
}

// ─── Traits ───────────────────────────────────────────────────
@Entity("character_traits")
export class CharacterTrait extends BaseEntity {
  @ManyToOne(() => Character, (c) => c.traits, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "character_id" })
  character!: Character;

  @Column({ name: "character_id" })
  characterId!: string;

  @ManyToOne(() => RefTrait, { nullable: true })
  @JoinColumn({ name: "ref_trait_id" })
  refTrait!: RefTrait | null;

  @Column({ name: "ref_trait_id", nullable: true })
  refTraitId!: string | null;

  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "text", nullable: true })
  info!: string | null;

  @Column({ type: "simple-json", name: "attribute_mods", nullable: true })
  attributeMods!: Record<string, number> | null; // {"STR":-2}
}

// ─── Arcane affinities ────────────────────────────────────────
@Entity("character_arcane")
export class CharacterArcane extends BaseEntity {
  @ManyToOne(() => Character, (c) => c.arcane, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "character_id" })
  character!: Character;

  @Column({ name: "character_id" })
  characterId!: string;

  @ManyToOne(() => RefArcaneElement, { nullable: true })
  @JoinColumn({ name: "element_id" })
  element!: RefArcaneElement | null;

  @Column({ name: "element_id", nullable: true })
  elementId!: string | null;

  @Column({ type: "varchar", length: 100 })
  name!: string; // Denormalized for display

  @Column({ type: "varchar", length: 20, nullable: true })
  tier!: string | null;
}

// ─── Tasks / quests ───────────────────────────────────────────
@Entity("character_tasks")
export class CharacterTask extends BaseEntity {
  @ManyToOne(() => Character, (c) => c.tasks, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "character_id" })
  character!: Character;

  @Column({ name: "character_id" })
  characterId!: string;

  @Column({ type: "text" })
  text!: string;

  @Column({ type: "boolean", name: "is_done", default: false })
  isDone!: boolean;

  @Column({ type: "int", name: "sort_order", default: 0 })
  sortOrder!: number;
}
