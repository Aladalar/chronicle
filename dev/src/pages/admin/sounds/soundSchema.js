// ─── LIBRARY CATEGORIES ───
// Each entry is metadata + file path. Playback engine uses these.
// Every track: loop, loopDelay (s), fadeIn (s), fadeOut (s), volume (0-100)

export const LIBRARY_CATEGORIES = {
  sounds:  { label: "Sound Effects", desc: "Short SFX — sword clash, door creak, thunder. Can loop with delay." },
  music:   { label: "Music",         desc: "Background tracks. Only one plays at a time — crossfades on switch." },
  ambient: { label: "Ambient",       desc: "Long loops without rhythm — rain, wind, campfire. Multiple can layer." },
};

// Shared track fields: every item in every library gets these
const TRACK_FIELDS = [
  { key: "name",      label: "Name",           type: "text", required: true },
  { key: "path",      label: "File Path",      type: "text", placeholder: "/sounds/sfx/door-creak.mp3" },
  { key: "tags",      label: "Tags",           type: "tags", options: [] },
  { key: "volume",    label: "Default Volume",  type: "number", width: "short", placeholder: "80" },
  { key: "loop",      label: "Loop",           type: "select", options: ["yes", "no"], width: "short" },
  { key: "loopDelay", label: "Loop Delay (s)",  type: "number", width: "short", placeholder: "0" },
  { key: "fadeIn",    label: "Fade In (s)",     type: "number", width: "short", placeholder: "0" },
  { key: "fadeOut",   label: "Fade Out (s)",    type: "number", width: "short", placeholder: "0" },
  { key: "notes",     label: "Notes",          type: "longtext" },
];

// Per-category tag suggestions
const TAG_OPTS = {
  sounds:  ["combat", "nature", "magic", "door", "trap", "UI", "horror", "weather", "footstep", "impact"],
  music:   ["battle", "calm", "tavern", "exploration", "boss", "sad", "victory", "horror", "epic", "stealth"],
  ambient: ["rain", "wind", "fire", "water", "forest", "cave", "city", "night", "storm", "crowd", "birds"],
};

export function fieldsFor(category) {
  return TRACK_FIELDS.map((f) => {
    if (f.key === "tags") return { ...f, options: TAG_OPTS[category] || [] };
    return f;
  });
}

export const LIST_COLUMNS = ["name", "tags", "loop", "volume"];

// ─── PRESETS (SOUNDBOARDS) ───
// A preset defines a scene: which music, which ambient layers, which quick-fire sounds.
// Each layer reference includes volume override, loop override, etc.

export const PRESET_FIELDS = [
  { key: "name",         label: "Name",              type: "text", required: true, placeholder: "Dungeon, Town, Battle..." },
  { key: "tags",         label: "Tags",              type: "tags", options: ["combat", "exploration", "social", "travel", "rest", "horror", "boss"] },
  { key: "fadeInDuration",  label: "Fade In (s)",    type: "number", width: "short", placeholder: "2" },
  { key: "fadeOutDuration", label: "Fade Out (s)",   type: "number", width: "short", placeholder: "2" },
  { key: "notes",        label: "Notes",             type: "longtext" },
];

// Global mixer settings
export const GLOBAL_DEFAULTS = {
  masterVolume: 80,
  defaultFadeIn: 2,
  defaultFadeOut: 2,
};
