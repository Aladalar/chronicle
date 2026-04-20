import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "@/api/client";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "@/components/Toast";
import IconPicker, { StoredIcon } from "@/components/IconPicker";
import { ACTION_ICONS, TABLE_ICONS } from "@/components/icons";
import styles from "./TypesPage.module.css";

// Possible designations. Each has a label, icon, color hint for the group header.
const DESIGNATIONS = [
  { id: "ability",        label: "Ability Types",        hint: "Used for character abilities (Fight, Craft, Social...)", defaultIcon: "hand-fist" },
  { id: "knowledge",      label: "Knowledge Types",      hint: "Used for knowledge entries", defaultIcon: "brain" },
  { id: "spell",          label: "Spell Types",          hint: "Used for spells", defaultIcon: "star" },
  { id: "tome",           label: "Tome Types",           hint: "Ancient/divine spell categories", defaultIcon: "book" },
  { id: "arcane",         label: "Arcane Elements",      hint: "Elemental categories (Fire, Water, Shadow...)", defaultIcon: "wand-magic-sparkles" },
  { id: "trait",          label: "Trait Categories",     hint: "Trait groupings", defaultIcon: "feather" },
  { id: "rarity",         label: "Rarity Tiers",         hint: "Common, Uncommon, Rare, Epic, Unique", defaultIcon: "gem" },
  { id: "item",           label: "Item Types",           hint: "Weapon, Armor, Consumable, Trinket...", defaultIcon: "hammer" },
  { id: "material",       label: "Material Types",       hint: "Bylina, Houba, Zvire...", defaultIcon: "flask" },
  { id: "monster",        label: "Monster Types",        hint: "Undead, Demon, Shadow, Aberration...", defaultIcon: "dragon" },
  { id: "god",            label: "God Categories",       hint: "Major, Minor, Forgotten, Elder...", defaultIcon: "hands-praying" },
  { id: "transmutation",  label: "Transmutation Types",  hint: "Mainframe, Funkce, Objekt", defaultIcon: "sun" },
  { id: "rune",           label: "Rune Categories",      hint: "Effect, Logic, Utility", defaultIcon: "circle-nodes" },
  { id: "currency",       label: "Currencies",           hint: "Minor, Major, Imperial Platinum...", defaultIcon: "coins" },
  { id: "damage",         label: "Damage Types",         hint: "Slashing, Piercing, Fire...", defaultIcon: "bolt" },
];

const DESIG_BY_ID = Object.fromEntries(DESIGNATIONS.map((d) => [d.id, d]));

// Get default icon from first designation
function getDefaultIcon(designations) {
  if (!Array.isArray(designations) || designations.length === 0) return "diamond";
  const first = DESIG_BY_ID[designations[0]];
  return first?.defaultIcon || "diamond";
}

export default function TypesPage({ onBack }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | designation id | "unassigned"

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api("GET", "/refs/types");
      setRows(data || []);
    } catch (e) {
      toast.error(`Load failed: ${e.message}`);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // ─ Group rows by designation ─
  const grouped = useMemo(() => {
    const buckets = {};
    DESIGNATIONS.forEach((d) => { buckets[d.id] = []; });
    buckets.__unassigned = [];

    for (const row of rows) {
      const desigs = Array.isArray(row.designations) ? row.designations : [];
      if (desigs.length === 0) {
        buckets.__unassigned.push(row);
        continue;
      }
      desigs.forEach((d) => {
        if (buckets[d]) buckets[d].push(row);
        else {
          // unknown designation — create a bucket on the fly
          if (!buckets[`_unknown_${d}`]) buckets[`_unknown_${d}`] = [];
          buckets[`_unknown_${d}`].push(row);
        }
      });
    }
    return buckets;
  }, [rows]);

  const countFor = (d) => grouped[d]?.length ?? 0;

  // ─ Open new with pre-selected designation ─
  const openNew = (preDesig) => {
    setEditing({
      name: "",
      icon: "",
      color: "#808080",
      designations: preDesig ? [preDesig] : [],
      sortOrder: null,
    });
    setEditOpen(true);
  };

  const openEdit = (row) => {
    setEditing({
      ...row,
      designations: Array.isArray(row.designations) ? [...row.designations] : [],
    });
    setEditOpen(true);
  };

  async function handleSave() {
    if (!editing.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      const payload = {
        name: editing.name.trim(),
        icon: editing.icon || null,
        color: editing.color || null,
        designations: editing.designations || [],
        sortOrder: editing.sortOrder,
      };
      if (editing.id) {
        await api("PATCH", `/refs/types/${editing.id}`, payload);
        toast.ok("Type updated");
      } else {
        await api("POST", "/refs/types", payload);
        toast.ok("Type created");
      }
      setEditOpen(false);
      setEditing(null);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await api("DELETE", `/refs/types/${deleting.id}`);
      toast.ok("Type deleted");
      setDeleting(null);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  // ─ Toggle designation in editing modal ─
  const toggleDesig = (d) => {
    const has = editing.designations.includes(d);
    setEditing({
      ...editing,
      designations: has
        ? editing.designations.filter((x) => x !== d)
        : [...editing.designations, d],
    });
  };

  // ─ Which sections to render based on filter ─
  const sectionsToShow = filter === "all"
    ? [...DESIGNATIONS.map((d) => d.id), "__unassigned"]
    : filter === "unassigned"
      ? ["__unassigned"]
      : [filter];

  return (
    <div className={styles.wrap}>
      {/* ── Breadcrumb ── */}
      <div className={styles.breadcrumb}>
        <button className={styles.backBtn} onClick={onBack}>
          <FontAwesomeIcon icon={ACTION_ICONS.back} />
          <span>Shared DBs</span>
        </button>
        <span className={styles.crumbSep}>›</span>
        <span className={styles.crumbCurrent}>
          <FontAwesomeIcon icon={TABLE_ICONS.types} /> Types
        </span>
      </div>

      {/* ── Header ── */}
      <div className={styles.header}>
        <h2>Types</h2>
        <p className={styles.desc}>
          One table, many uses. Each type has one or more <strong>designations</strong> that
          control where it appears. A type can belong to multiple designations (e.g. a "Shadow"
          type designated as both <em>arcane</em> and <em>spell</em>).
        </p>
      </div>

      {/* ── Filter bar ── */}
      <div className={styles.filterBar}>
        <button
          className={styles.chipBtn}
          data-active={filter === "all"}
          onClick={() => setFilter("all")}
        >All <span className={styles.chipCount}>{rows.length}</span></button>
        {DESIGNATIONS.map((d) => {
          const n = countFor(d.id);
          if (filter !== "all" && filter !== d.id && n === 0) return null;
          return (
            <button
              key={d.id}
              className={styles.chipBtn}
              data-active={filter === d.id}
              onClick={() => setFilter(d.id)}
            >
              {d.label} <span className={styles.chipCount}>{n}</span>
            </button>
          );
        })}
        {countFor("__unassigned") > 0 && (
          <button
            className={styles.chipBtn}
            data-active={filter === "unassigned"}
            data-warning
            onClick={() => setFilter("unassigned")}
          >
            Unassigned <span className={styles.chipCount}>{countFor("__unassigned")}</span>
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={() => openNew()}>+ New Type</button>
      </div>

      {/* ── Grouped sections ── */}
      {loading ? null : (
        <div className={styles.sections}>
          {sectionsToShow.map((sectionId) => {
            const isUnassigned = sectionId === "__unassigned";
            const desig = DESIG_BY_ID[sectionId];
            const label = isUnassigned ? "Unassigned" : (desig?.label || sectionId);
            const hint = isUnassigned
              ? "These types have no designation — they won't appear in any dropdown."
              : desig?.hint;
            const items = grouped[sectionId] || [];
            if (filter === "all" && items.length === 0) return null;

            return (
              <section key={sectionId} className={styles.section} data-warning={isUnassigned && items.length > 0}>
                <header className={styles.sectionHead}>
                  <div>
                    <h3 className={styles.sectionTitle}>{label}</h3>
                    {hint && <p className={styles.sectionHint}>{hint}</p>}
                  </div>
                  <div className={styles.sectionCount}>{items.length}</div>
                  {!isUnassigned && desig && (
                    <button
                      className="btn-sm"
                      onClick={() => openNew(desig.id)}
                    >+ Add to {label}</button>
                  )}
                </header>

                {items.length === 0 ? (
                  <div className={styles.sectionEmpty}>No types in this group.</div>
                ) : (
                  <div className={styles.chips}>
                    {items.map((t) => {
                      const defaultIco = isUnassigned ? "diamond" : desig?.defaultIcon || "diamond";
                      return (
                      <div key={t.id} className={styles.typeChip}>
                        <span
                          className={styles.typeIcon}
                          style={{
                            background: (t.color || "#808080") + "22",
                            color: t.color || "var(--text)",
                          }}
                        >
                          <StoredIcon name={t.icon} fallback={defaultIco} />
                        </span>
                        <span
                          className={styles.typeName}
                          style={{ color: t.color || "var(--text)" }}
                        >
                          {t.name}
                        </span>
                        {(t.designations || []).length > 1 && (
                          <span className={styles.multiBadge} title={(t.designations || []).join(", ")}>
                            +{(t.designations || []).length - 1}
                          </span>
                        )}
                        <button
                          className={styles.miniBtn}
                          onClick={() => openEdit(t)}
                          title="Edit"
                        >&#9998;</button>
                        <button
                          className={`${styles.miniBtn} ${styles.miniDanger}`}
                          onClick={() => setDeleting(t)}
                          title="Delete"
                        >&times;</button>
                      </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* ── Edit / New Modal ── */}
      <Modal
        open={editOpen}
        title={editing?.id ? "Edit Type" : "New Type"}
        onClose={() => setEditOpen(false)}
        width={560}
      >
        {editing && (
          <>
            <div className={styles.formRow}>
              <label className={styles.field} style={{ flex: 2 }}>
                <span className={styles.fieldLabel}>Name *</span>
                <input
                  value={editing.name || ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Fight, Rare, Shadow..."
                  autoFocus
                />
              </label>
              <div className={styles.field} style={{ flex: "0 0 160px" }}>
                <span className={styles.fieldLabel}>Icon</span>
                <IconPicker
                  value={editing.icon || null}
                  defaultIcon={getDefaultIcon(editing.designations)}
                  onChange={(v) => setEditing({ ...editing, icon: v })}
                />
              </div>
            </div>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Color</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="color"
                  value={editing.color || "#808080"}
                  onChange={(e) => setEditing({ ...editing, color: e.target.value })}
                  style={{ width: 48, height: 36, padding: 2, cursor: "pointer" }}
                />
                <input
                  value={editing.color || ""}
                  onChange={(e) => setEditing({ ...editing, color: e.target.value })}
                  placeholder="#808080"
                  style={{ fontFamily: "var(--font-mono, monospace)", flex: 1 }}
                />
              </div>
            </label>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Used For (designations) *</span>
              <p className={styles.hint}>
                Click to toggle. This type will appear in the dropdowns of every selected system.
                A type needs at least one designation or it won't show anywhere.
              </p>
              <div className={styles.desigGrid}>
                {DESIGNATIONS.map((d) => {
                  const on = editing.designations.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      className={styles.desigChip}
                      data-active={on}
                      onClick={() => toggleDesig(d.id)}
                      title={d.hint}
                    >
                      <span className={styles.desigDot} data-on={on} />
                      {d.label.replace(/ Types?$/, "").replace(/ Categories$/, "").replace(/ Tiers$/, "").replace(/ Elements$/, "")}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className={styles.field} style={{ maxWidth: 160 }}>
              <span className={styles.fieldLabel}>Sort Order</span>
              <input
                type="number"
                value={editing.sortOrder ?? ""}
                onChange={(e) => setEditing({ ...editing, sortOrder: e.target.value === "" ? null : Number(e.target.value) })}
                placeholder="0"
              />
            </label>

            <div className={styles.formFoot}>
              <button onClick={() => setEditOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>
                {editing.id ? "Save" : "Create"}
              </button>
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete Type"
        message={`Delete "${deleting?.name}"? Any ability, item, or other record referencing it will lose its type.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
