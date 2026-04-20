// All shared reference tables — one flat registry, six groups.
// Everything is global (no campaign_id). Age-tagged tables show
// known/forgotten/lost state relative to active campaign's currentAge.

export const GROUPS = {
  foundation: { label: "Foundation",      desc: "Building blocks every other table depends on" },
  mechanics:  { label: "Game Mechanics",  desc: "Rules of play — abilities, knowledge, traits, ranks" },
  world:      { label: "World",           desc: "Races, items, beasts, flora, crafting materials" },
  creatures:  { label: "Creatures & NPCs", desc: "Monsters, named characters, gods" },
  locations:  { label: "Locations",       desc: "Settlements, ruins, natural wonders, dungeons" },
  alchemy:    { label: "Alchemy & Magic", desc: "Spells, tomes, transmutations, runes" },
};

const AGE_FIELD = {
  key: "age", label: "Era of Origin", type: "number", width: "short", placeholder: "1",
  hint: "Which age this is from. Determines known/forgotten/lost vs campaign's current age.",
};

export const REF_TABLES = {

  // ═══ FOUNDATION ═══

  types: {
    group: "foundation",
    label: "Types",
    description: "Master enum. Designations control where each type appears as a category.",
    hasDedicatedPage: true,
  },

  "item-templates": {
    group: "foundation",
    label: "Item Templates",
    description: "Baseline stats, rarity, type for items. Items reference these.",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "description", label: "Description", type: "longtext" },
      { key: "attributes", label: "Attribute Bonuses", type: "text", placeholder: "STR+2, AGI+1" },
      { key: "rarityId", label: "Rarity", type: "ref", refTable: "types", filterDesignation: "rarity" },
      { key: "typeId", label: "Item Type", type: "ref", refTable: "types", filterDesignation: "item" },
    ],
    listColumns: ["name", "rarityId", "typeId"],
  },

  // ═══ GAME MECHANICS ═══

  abilities: {
    group: "mechanics",
    label: "Abilities",
    description: "Skills characters learn. Typed and linked to a primary attribute.",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "typeId", label: "Type", type: "ref", refTable: "types", filterDesignation: "ability", required: true },
      { key: "attribute", label: "Primary Attr", type: "select",
        options: ["STR","END","FOR","AGI","INT","WIS","SPI","CHA","LCK"], width: "short" },
      { key: "description", label: "Description", type: "longtext" },
    ],
    listColumns: ["name", "typeId", "attribute"],
  },

  knowledge: {
    group: "mechanics",
    label: "Knowledge",
    description: "Fields of study or lore a character can possess.",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "typeId", label: "Type", type: "ref", refTable: "types", filterDesignation: "knowledge" },
      { key: "description", label: "Description", type: "longtext" },
    ],
    listColumns: ["name", "typeId"],
  },

  traits: {
    group: "mechanics",
    label: "Traits",
    description: "Personality, physical, or supernatural traits with attribute modifiers.",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "description", label: "Description", type: "longtext" },
      { key: "defaultMods", label: "Default Modifiers", type: "attrmods" },
      { key: "typeId", label: "Category", type: "ref", refTable: "types", filterDesignation: "trait" },
    ],
    listColumns: ["name", "typeId"],
  },

  ranks: {
    group: "mechanics",
    label: "Ranks",
    description: "Progression tiers with configurable progress cap.",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "tierOrder", label: "Tier", type: "number", required: true, width: "short" },
      { key: "progressCap", label: "Progress Cap", type: "number", required: true, width: "short" },
    ],
    listColumns: ["tierOrder", "name", "progressCap"],
  },

  // ═══ WORLD ═══

  races: {
    group: "world",
    label: "Races",
    description: "Playable or NPC races.",
    hasAge: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      AGE_FIELD,
      { key: "description", label: "Description", type: "longtext" },
    ],
    listColumns: ["name", "age"],
  },

  items: {
    group: "world",
    label: "Items",
    description: "Individual known items in the world.",
    hasAge: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "templateId", label: "Template", type: "ref", refTable: "item-templates" },
      AGE_FIELD,
      { key: "description", label: "Description", type: "longtext" },
      { key: "attributes", label: "Attribute Bonuses", type: "text", placeholder: "STR+2" },
      { key: "rarityId", label: "Rarity", type: "ref", refTable: "types", filterDesignation: "rarity" },
      { key: "typeId", label: "Type", type: "ref", refTable: "types", filterDesignation: "item" },
    ],
    listColumns: ["name", "rarityId", "typeId", "age"],
  },

  beasts: {
    group: "world",
    label: "Beasts",
    description: "Natural fauna — wolves, bears, eagles. Not magical.",
    hasAge: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      AGE_FIELD,
      { key: "habitat", label: "Habitat", type: "text", placeholder: "Forest, Plains..." },
      { key: "threatLevel", label: "Threat Level", type: "select",
        options: ["Harmless", "Low", "Moderate", "High", "Lethal"] },
      { key: "description", label: "Description", type: "longtext" },
    ],
    listColumns: ["name", "threatLevel", "habitat", "age"],
  },

  flora: {
    group: "world",
    label: "Flora",
    description: "Plants, trees, fungi.",
    hasAge: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      AGE_FIELD,
      { key: "biome", label: "Biome", type: "text" },
      { key: "description", label: "Description", type: "longtext" },
    ],
    listColumns: ["name", "biome", "age"],
  },

  materials: {
    group: "world",
    label: "Materials",
    description: "Alchemical & crafting materials with effect-bearing parts.",
    hasAge: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      AGE_FIELD,
      { key: "typeId", label: "Type", type: "ref", refTable: "types", filterDesignation: "material" },
      { key: "biome", label: "Biome", type: "text" },
      { key: "occurrence", label: "Occurrence", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "parts", label: "Parts", type: "ingredient-parts" },
    ],
    listColumns: ["name", "typeId", "biome", "age"],
  },

  // ═══ CREATURES & NPCs ═══

  monsters: {
    group: "creatures",
    label: "Monsters",
    description: "Supernatural or aberrant creatures — demons, undead, shadows.",
    hasAge: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      AGE_FIELD,
      { key: "typeId", label: "Kind", type: "ref", refTable: "types", filterDesignation: "monster" },
      { key: "threatLevel", label: "Threat Level", type: "select",
        options: ["Low", "Moderate", "High", "Deadly", "Apocalyptic"] },
      { key: "description", label: "Description", type: "longtext" },
    ],
    listColumns: ["name", "typeId", "threatLevel", "age"],
  },

  "npc-important": {
    group: "creatures",
    label: "Important NPCs",
    description: "Named characters central to the story — rulers, antagonists, allies.",
    hasAge: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      AGE_FIELD,
      { key: "raceId", label: "Race", type: "ref", refTable: "races" },
      { key: "role", label: "Role", type: "text", placeholder: "King, Merchant, Assassin..." },
      { key: "affiliation", label: "Affiliation", type: "text" },
      { key: "description", label: "Description", type: "longtext" },
    ],
    listColumns: ["name", "raceId", "role", "age"],
  },

  gods: {
    group: "creatures",
    label: "Gods",
    description: "Deities and divine beings. Old ones may be forgotten.",
    hasAge: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      AGE_FIELD,
      { key: "domain", label: "Domain", type: "text", placeholder: "Shadow, Fire, Wisdom..." },
      { key: "typeId", label: "Category", type: "ref", refTable: "types", filterDesignation: "god" },
      { key: "description", label: "Description", type: "longtext" },
    ],
    listColumns: ["name", "domain", "typeId", "age"],
  },

  "npc-other": {
    group: "creatures",
    label: "Other NPCs",
    description: "Supporting cast — innkeepers, guards, merchants.",
    hasAge: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      AGE_FIELD,
      { key: "raceId", label: "Race", type: "ref", refTable: "races" },
      { key: "role", label: "Role", type: "text" },
      { key: "notes", label: "Notes", type: "longtext" },
    ],
    listColumns: ["name", "raceId", "role", "age"],
  },

  // ═══ LOCATIONS ═══

  settlements: {
    group: "locations",
    label: "Settlements",
    description: "Cities, towns, villages, outposts.",
    hasAge: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      AGE_FIELD,
      { key: "population", label: "Population", type: "number", width: "short" },
      { key: "governance", label: "Governance", type: "text", placeholder: "Kingdom, Free City..." },
      { key: "description", label: "Description", type: "longtext" },
    ],
    listColumns: ["name", "population", "governance", "age"],
  },

  wonders: {
    group: "locations",
    label: "Natural Wonders",
    description: "Mountains, seas, forests of renown.",
    hasAge: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      AGE_FIELD,
      { key: "kind", label: "Kind", type: "text", placeholder: "Mountain, Forest, Sea..." },
      { key: "description", label: "Description", type: "longtext" },
    ],
    listColumns: ["name", "kind", "age"],
  },

  ruins: {
    group: "locations",
    label: "Ruins",
    description: "Abandoned or destroyed places of former civilizations.",
    hasAge: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      AGE_FIELD,
      { key: "origin", label: "Origin", type: "text", placeholder: "Fallen empire..." },
      { key: "description", label: "Description", type: "longtext" },
    ],
    listColumns: ["name", "origin", "age"],
  },

  dungeons: {
    group: "locations",
    label: "Dungeons & Lairs",
    description: "Caves, catacombs, hideouts — deliberately hidden or hostile.",
    hasAge: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      AGE_FIELD,
      { key: "inhabitant", label: "Inhabitant", type: "text" },
      { key: "description", label: "Description", type: "longtext" },
    ],
    listColumns: ["name", "inhabitant", "age"],
  },

  // ═══ ALCHEMY & MAGIC ═══

  spells: {
    group: "alchemy",
    label: "Spells",
    description: "Modern spells — learnable through study and practice.",
    hasAge: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      AGE_FIELD,
      { key: "typeId", label: "Type", type: "ref", refTable: "types", filterDesignation: "spell" },
      { key: "arcaneId", label: "Arcane Element", type: "ref", refTable: "types", filterDesignation: "arcane" },
      { key: "level", label: "Level", type: "text", width: "short" },
      { key: "cost", label: "Cost", type: "text", width: "short" },
      { key: "description", label: "Description", type: "longtext" },
    ],
    listColumns: ["name", "typeId", "arcaneId", "level", "age"],
  },

  tomes: {
    group: "alchemy",
    label: "Tomes",
    description: "Ancient spells and divine prayers — granted by gods or lost to time.",
    hasAge: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      AGE_FIELD,
      { key: "source", label: "Source", type: "text", placeholder: "God of Shadow, Lost Scripture..." },
      { key: "typeId", label: "Type", type: "ref", refTable: "types", filterDesignation: "tome" },
      { key: "description", label: "Description", type: "longtext" },
    ],
    listColumns: ["name", "source", "age"],
  },

  transmutations: {
    group: "alchemy",
    label: "Transmutations",
    description: "Function-notation transmutation circles.",
    hasAge: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      AGE_FIELD,
      { key: "notation", label: "Notation", type: "text", mono: true },
      { key: "description", label: "Description", type: "longtext" },
      { key: "type", label: "Type", type: "select", options: ["Mainframe", "Funkce", "Objekt"], width: "short" },
      { key: "level", label: "Level", type: "text", width: "short" },
      { key: "cost", label: "Cost", type: "text", width: "short" },
    ],
    listColumns: ["name", "notation", "type", "age"],
  },

  runes: {
    group: "alchemy",
    label: "Runes",
    description: "Cyclic circuit components. Energy must escape or rune explodes.",
    hasAge: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      AGE_FIELD,
      { key: "effect", label: "Effect", type: "text" },
      { key: "arcane", label: "Arcane", type: "text", width: "short" },
      { key: "category", label: "Category", type: "select",
        options: ["effect", "logic", "utility"], required: true, width: "short" },
      { key: "description", label: "Description", type: "longtext" },
    ],
    listColumns: ["name", "category", "effect", "age"],
  },
};

export function tablesByGroup() {
  const grouped = {};
  for (const [key, def] of Object.entries(REF_TABLES)) {
    if (!grouped[def.group]) grouped[def.group] = [];
    grouped[def.group].push({ key, ...def });
  }
  return grouped;
}
