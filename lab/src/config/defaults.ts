/**
 * Default game-system constants.
 * These are SEED DEFAULTS only — the live system reads from ref tables in the DB.
 * Each campaign can override via its own ref_types / ref_ranks rows.
 */

export const DEFAULTS = {
  attributes: ["STR", "END", "FOR", "AGI", "INT", "WIS", "SPI", "CHA", "LCK"],

  attributeProgressCap: 5,

  ranks: [
    { name: "Novice", tier: 1, progressCap: 10 },
    { name: "Apprentice", tier: 2, progressCap: 10 },
    { name: "Journeyman", tier: 3, progressCap: 10 },
    { name: "Expert", tier: 4, progressCap: 10 },
    { name: "Master", tier: 5, progressCap: 10 },
    { name: "Grandmaster", tier: 6, progressCap: 10 },
  ],

  abilityTypes: [
    { name: "Fight", icon: "⚔", color: "#c04040", designations: ["ability", "knowledge"] },
    { name: "Craft", icon: "⚒", color: "#b08030", designations: ["ability", "knowledge"] },
    { name: "Social", icon: "☺", color: "#50a050", designations: ["ability", "knowledge"] },
    { name: "Exploration", icon: "⚑", color: "#4080b0", designations: ["ability", "knowledge"] },
    { name: "Magic", icon: "✳", color: "#9060c0", designations: ["ability", "knowledge"] },
    { name: "Misc", icon: "✦", color: "#808080", designations: ["ability", "knowledge"] },
    { name: "Speciality", icon: "★", color: "#c0a020", designations: ["ability", "knowledge"] },
    { name: "Spell", icon: "⚡", color: "#6060d0", designations: ["knowledge"] },
    { name: "Language", icon: "✍", color: "#60a0a0", designations: ["ability"] },
  ],

  races: ["Uraaki", "Child of Water", "Child of Forest", "Human", "Highlander", "Sea People", "Seirei", "Scorpion"],

  rarities: ["Common", "Uncommon", "Rare", "Epic", "Unique"],

  conditions: ["Terrible", "Poor", "Ok", "Good", "Excellent"],

  runeCategories: ["effect", "logic", "utility"],
} as const;
