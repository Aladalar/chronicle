import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import styles from "./IconPicker.module.css";

// Register ALL free-solid icons into the FA library
library.add(fas);

// Build searchable list from the `fas` bundle
const ALL_ICONS = (() => {
  const list = [];
  // fas is { prefix, iconName → definition } but also has individual exports
  // Iterate the fas bundle properly
  for (const [key, icon] of Object.entries(fas)) {
    if (!icon || typeof icon !== "object" || !icon.iconName) continue;
    if (key === "fas" || key === "prefix") continue;
    // Dedupe by iconName
    if (list.some((i) => i.name === icon.iconName)) continue;
    list.push({ name: icon.iconName, icon });
  }
  list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
})();

// Favorites — shown first before search
const FAVORITES = [
  "hand-fist", "shield-halved", "wand-magic-sparkles", "dragon", "paw",
  "leaf", "flask", "gem", "crown", "star", "skull-crossbones", "fire",
  "bolt", "snowflake", "water", "wind", "mountain-sun", "dungeon",
  "scroll", "book", "feather", "brain", "eye", "heart", "chess-queen",
  "hands-praying", "sun", "moon", "circle-nodes", "hammer", "gears",
  "diamond", "location-dot", "house-chimney-crack", "cloud-sun",
  "music", "volume-high", "layer-group", "arrow-up", "face-smile",
  "skull", "ghost", "hat-wizard", "staff-snake", "dagger", "bow-arrow",
  "horse", "spider", "tree", "wheat-awn", "fish", "dove", "cat",
  "chess-rook", "landmark", "tent", "campground", "church", "store",
  "coins", "ring", "shield", "swords", "crosshairs",
];

// ═══ Lookup: name → FA icon object ═══
export function resolveIcon(iconName) {
  if (!iconName) return null;
  const entry = ALL_ICONS.find((i) => i.name === iconName);
  return entry?.icon || null;
}

// ═══ Render stored icon by name ═══
export function StoredIcon({ name, fallback, style, className }) {
  const icon = resolveIcon(name) || (fallback ? resolveIcon(fallback) : null);
  if (!icon) return null;
  return <FontAwesomeIcon icon={icon} style={style} className={className} />;
}

// ═══ Icon Picker Button + Modal ═══
// value: icon name string or null (null = use defaultIcon)
// defaultIcon: inherited from parent group/section
// onChange: (iconName | null) => void
export default function IconPicker({ value, defaultIcon, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const isCustom = value && value !== defaultIcon;
  const displayIcon = resolveIcon(value) || resolveIcon(defaultIcon);

  const filtered = useMemo(() => {
    if (!query.trim()) {
      // Show favorites first, then everything else
      const favSet = new Set(FAVORITES);
      const favIcons = FAVORITES.map((n) => ALL_ICONS.find((i) => i.name === n)).filter(Boolean);
      const rest = ALL_ICONS.filter((i) => !favSet.has(i.name));
      return [...favIcons, ...rest];
    }
    const q = query.toLowerCase().replace(/[^a-z0-9]/g, "");
    return ALL_ICONS.filter((i) => i.name.replace(/-/g, "").includes(q));
  }, [query]);

  return (
    <>
      <div className={styles.trigger}>
        <button
          type="button"
          className={styles.previewBtn}
          onClick={() => setOpen(true)}
          title="Pick icon"
        >
          {displayIcon ? (
            <FontAwesomeIcon icon={displayIcon} className={styles.previewIcon} />
          ) : (
            <span className={styles.noIcon}>?</span>
          )}
        </button>
        <div className={styles.triggerInfo}>
          <span className={styles.iconName}>{value || defaultIcon || "none"}</span>
          {isCustom && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => onChange(null)}
              title="Reset to default"
            >
              Reset to default
            </button>
          )}
          {!isCustom && defaultIcon && (
            <span className={styles.defaultLabel}>default from group</span>
          )}
        </div>
      </div>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>Pick Icon</h3>
              <button className={styles.closeBtn} onClick={() => setOpen(false)}>×</button>
            </div>

            <input
              className={styles.searchInput}
              placeholder="Search icons..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />

            <div className={styles.count}>
              {filtered.length} icon{filtered.length === 1 ? "" : "s"}
              {!query && <span className={styles.countHint}> — favorites shown first</span>}
            </div>

            <div className={styles.grid}>
              {filtered.map((entry) => {
                const selected = value === entry.name;
                const isDefault = !value && defaultIcon === entry.name;
                return (
                  <button
                    key={entry.name}
                    type="button"
                    className={styles.iconBtn}
                    data-selected={selected}
                    data-default={isDefault}
                    onClick={() => {
                      onChange(entry.name);
                      setOpen(false);
                      setQuery("");
                    }}
                    title={entry.name}
                  >
                    <FontAwesomeIcon icon={entry.icon} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
