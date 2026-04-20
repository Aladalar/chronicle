import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { BaseEntity } from "./Base";
import { Campaign } from "./Campaign";
import { User } from "./User";
import { RefRace } from "./RefTables";
import {
  CharacterAttribute,
  CharacterAbility,
  CharacterKnowledge,
  CharacterInventory,
  CharacterTrait,
  CharacterArcane,
  CharacterTask,
} from "./CharacterSubs";

@Entity("characters")
export class Character extends BaseEntity {
  @ManyToOne(() => Campaign, { nullable: false })
  @JoinColumn({ name: "campaign_id" })
  campaign!: Campaign;

  @Column({ name: "campaign_id" })
  campaignId!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "owner_id" })
  owner!: User;

  @Column({ name: "owner_id" })
  ownerId!: string;

  @ManyToOne(() => RefRace, { nullable: true })
  @JoinColumn({ name: "race_id" })
  race!: RefRace | null;

  @Column({ name: "race_id", nullable: true })
  raceId!: string | null;

  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "simple-json", nullable: true })
  titles!: string[] | null;

  @Column({ type: "int", name: "souls_energy", default: 0 })
  soulsEnergy!: number;

  @Column({ type: "int", name: "currency_minor", default: 0 })
  currencyMinor!: number;

  @Column({ type: "int", name: "currency_major", default: 0 })
  currencyMajor!: number;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ type: "boolean", name: "is_companion", default: false })
  isCompanion!: boolean;

  @ManyToOne(() => Character, { nullable: true })
  @JoinColumn({ name: "parent_character_id" })
  parentCharacter!: Character | null;

  @Column({ name: "parent_character_id", nullable: true })
  parentCharacterId!: string | null;

  // ─── Sub-resource relations ───
  @OneToMany(() => CharacterAttribute, (a) => a.character, { cascade: true })
  attributes!: CharacterAttribute[];

  @OneToMany(() => CharacterAbility, (a) => a.character, { cascade: true })
  abilities!: CharacterAbility[];

  @OneToMany(() => CharacterKnowledge, (k) => k.character, { cascade: true })
  knowledge!: CharacterKnowledge[];

  @OneToMany(() => CharacterInventory, (i) => i.character, { cascade: true })
  inventory!: CharacterInventory[];

  @OneToMany(() => CharacterTrait, (t) => t.character, { cascade: true })
  traits!: CharacterTrait[];

  @OneToMany(() => CharacterArcane, (a) => a.character, { cascade: true })
  arcane!: CharacterArcane[];

  @OneToMany(() => CharacterTask, (t) => t.character, { cascade: true })
  tasks!: CharacterTask[];

  @OneToMany(() => Character, (c) => c.parentCharacter)
  companions!: Character[];
}
