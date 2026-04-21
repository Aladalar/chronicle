// dev/src/pages/admin/sounds/soundSchema.js — patch
//
// Remove the `path` entry from TRACK_FIELDS — it's now handled by FilePicker directly in SoundLibrary.
// `variants` is written to the row by FilePicker's onChange; no schema field needed.
//
// Updated TRACK_FIELDS:

const TRACK_FIELDS = [
  { key: "name",      label: "Name",           type: "text", required: true },
  // path is intentionally omitted — rendered as <FilePicker> in SoundLibrary
  { key: "tags",      label: "Tags",           type: "tags", options: [] },
  { key: "volume",    label: "Default Volume", type: "number", width: "short", placeholder: "80" },
  { key: "loop",      label: "Loop",           type: "select", options: ["yes", "no"], width: "short" },
  { key: "loopDelay", label: "Loop Delay (s)", type: "number", width: "short", placeholder: "0" },
  { key: "fadeIn",    label: "Fade In (s)",    type: "number", width: "short", placeholder: "0" },
  { key: "fadeOut",   label: "Fade Out (s)",   type: "number", width: "short", placeholder: "0" },
  { key: "notes",     label: "Notes",         type: "longtext" },
];

// LIST_COLUMNS — keep as-is; SoundLibrary appends "path" column separately for the file display
export const LIST_COLUMNS = ["name", "tags", "loop", "volume"];
