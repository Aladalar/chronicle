// dev/src/pages/admin/sounds/FilePicker.jsx
import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "@/api/client";
import { toast } from "@/components/Toast";
import { ACTION_ICONS } from "@/components/icons";
import styles from "./FilePicker.module.css";

/**
 * FilePicker — replaces the path text input in SoundLibrary.
 *
 * Props:
 *   category      "sounds" | "music" | "ambient"
 *   assignedPaths string[]  — all paths already in the DB (to mark as used)
 *   value         string | null    — current single path
 *   variants      string[] | null  — current variant group
 *   onChange      (path: string|null, variants: string[]|null) => void
 */
export default function FilePicker({ category, assignedPaths = [], value, variants, onChange }) {
  const [open, setOpen] = useState(false);
  const [discovered, setDiscovered] = useState(null); // { files, groups }
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("single"); // "single" | "group"
  const [selected, setSelected] = useState([]); // file paths being staged

  // Load on open
  useEffect(() => {
    if (!open || discovered) return;
    setLoading(true);
    api("GET", `/sounds/discover?category=${category}`)
      .then((d) => setDiscovered(d))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [open, category]);

  // Pre-fill selection from current value
  useEffect(() => {
    if (!open) return;
    if (variants?.length) { setMode("group"); setSelected([...variants]); }
    else if (value)       { setMode("single"); setSelected([value]); }
    else                  { setMode("single"); setSelected([]); }
  }, [open]);

  const assignedSet = useMemo(() => new Set(assignedPaths), [assignedPaths]);

  const allSingles = useMemo(() => {
    if (!discovered) return [];
    const q = query.toLowerCase();
    return discovered.files.filter((f) => !q || f.toLowerCase().includes(q));
  }, [discovered, query]);

  const allGroups = useMemo(() => {
    if (!discovered) return [];
    const q = query.toLowerCase();
    return discovered.groups.filter(
      (g) => !q || g.name.toLowerCase().includes(q) || g.files.some((f) => f.toLowerCase().includes(q))
    );
  }, [discovered, query]);

  function toggleFile(f) {
    setSelected((prev) =>
      mode === "single"
        ? [f]
        : prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

  function selectGroup(g) {
    setMode("group");
    setSelected([...g.files]);
  }

  function confirm() {
    if (selected.length === 0) { onChange(null, null); setOpen(false); return; }
    if (selected.length === 1) { onChange(selected[0], null); }
    else                       { onChange(selected[0], selected); }
    setOpen(false);
  }

  function clear() { onChange(null, null); setOpen(false); }

  // ── display label ──
  const label = variants?.length
    ? `${variants.length} variants (${groupBaseName(variants[0])})`
    : value
    ? value.split("/").pop()
    : "Pick file…";

  return (
    <div className={styles.wrap}>
      <div className={styles.trigger}>
        <button type="button" className={styles.triggerBtn} onClick={() => setOpen(true)}>
          <FontAwesomeIcon icon={ACTION_ICONS.edit} />
          <span className={value || variants?.length ? styles.hasValue : styles.placeholder}>
            {label}
          </span>
        </button>
        {(value || variants?.length) && (
          <button type="button" className={styles.clearBtn} onClick={clear} title="Clear">×</button>
        )}
      </div>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.panelHead}>
              <span className={styles.panelTitle}>Pick file — {category}</span>
              <button type="button" className={styles.closeBtn} onClick={() => setOpen(false)}>×</button>
            </div>

            <div className={styles.toolbar}>
              <input
                placeholder="Filter…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <div className={styles.modeToggle}>
                <button
                  type="button"
                  className={mode === "single" ? styles.modeActive : ""}
                  onClick={() => { setMode("single"); setSelected(selected.slice(0, 1)); }}
                >Single</button>
                <button
                  type="button"
                  className={mode === "group" ? styles.modeActive : ""}
                  onClick={() => setMode("group")}
                >Multi / Group</button>
              </div>
            </div>

            {loading && <p className={styles.hint}>Scanning…</p>}

            {!loading && discovered && (
              <div className={styles.lists}>
                {/* Auto-detected groups */}
                {allGroups.length > 0 && (
                  <div className={styles.section}>
                    <p className={styles.sectionLabel}>Auto-detected groups</p>
                    {allGroups.map((g) => {
                      const active = selected.length > 1 && g.files.every((f) => selected.includes(f));
                      const partlyUsed = g.files.some((f) => assignedSet.has(f));
                      return (
                        <div
                          key={g.name}
                          className={`${styles.groupRow} ${active ? styles.active : ""} ${partlyUsed && !active ? styles.used : ""}`}
                          onClick={() => selectGroup(g)}
                        >
                          <span className={styles.groupName}>{shortName(g.name)}</span>
                          <span className={styles.groupCount}>{g.files.length} variants</span>
                          {active && <span className={styles.check}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Singles */}
                {allSingles.length > 0 && (
                  <div className={styles.section}>
                    <p className={styles.sectionLabel}>Files</p>
                    {allSingles.map((f) => {
                      const isSelected = selected.includes(f);
                      const isUsed = assignedSet.has(f);
                      return (
                        <div
                          key={f}
                          className={`${styles.fileRow} ${isSelected ? styles.active : ""} ${isUsed && !isSelected ? styles.used : ""}`}
                          onClick={() => toggleFile(f)}
                        >
                          <span className={styles.fileName}>{f}</span>
                          {isUsed && !isSelected && <span className={styles.usedBadge}>assigned</span>}
                          {isSelected && <span className={styles.check}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {allSingles.length === 0 && allGroups.length === 0 && (
                  <p className={styles.hint}>No files found{query ? " matching filter" : ` in /home/res/${category}`}.</p>
                )}
              </div>
            )}

            <div className={styles.panelFoot}>
              <span className={styles.selInfo}>
                {selected.length === 0 && "Nothing selected"}
                {selected.length === 1 && `1 file selected`}
                {selected.length > 1 && `${selected.length} variants — random pick on play`}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setOpen(false)}>Cancel</button>
                <button type="button" className="btn-primary" onClick={confirm}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function shortName(fullPath) {
  return fullPath.split("/").pop() || fullPath;
}

function groupBaseName(filePath) {
  const stem = filePath.split("/").pop()?.replace(/\.[^.]+$/, "") || "";
  return stem.replace(/[-_( ]?\d+\)?$/, "") || stem;
}
