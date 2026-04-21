import { Entity, Column } from "typeorm";
import { BaseEntity } from "./Base";

abstract class SoundBase extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  path!: string | null;

  @Column({ type: "simple-json", nullable: true })
  variants!: string[] | null;

  @Column({ type: "simple-json", nullable: true })
  tags!: string[] | null;

  @Column({ type: "int", default: 80 })
  volume!: number;

  @Column({ type: "varchar", length: 3, default: "no" })
  loop!: string;

  @Column({ type: "int", name: "loop_delay", default: 0 })
  loopDelay!: number;

  @Column({ type: "float", name: "fade_in", default: 0 })
  fadeIn!: number;

  @Column({ type: "float", name: "fade_out", default: 0 })
  fadeOut!: number;

  @Column({ type: "text", nullable: true })
  notes!: string | null;
}

@Entity("sound_effects")
export class SoundEffect extends SoundBase {}

@Entity("sound_music")
export class SoundMusic extends SoundBase {}

@Entity("sound_ambient")
export class SoundAmbient extends SoundBase {}

@Entity("sound_presets")
export class SoundPreset extends BaseEntity {
  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "simple-json", nullable: true })
  tags!: string[] | null;

  @Column({ type: "float", name: "fade_in_duration", default: 2 })
  fadeInDuration!: number;

  @Column({ type: "float", name: "fade_out_duration", default: 2 })
  fadeOutDuration!: number;

  @Column({ type: "simple-json", name: "music_track", nullable: true })
  musicTrack!: Record<string, unknown> | null;

  @Column({ type: "simple-json", name: "ambient_layers", nullable: true })
  ambientLayers!: Array<Record<string, unknown>> | null;

  @Column({ type: "simple-json", name: "sound_buttons", nullable: true })
  soundButtons!: Array<Record<string, unknown>> | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;
}
