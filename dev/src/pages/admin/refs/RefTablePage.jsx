import { useEffect, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "@/api/client";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "@/components/Toast";
import FieldInput from "./FieldInput";
import { REF_TABLES } from "./schema";
import { ageInfo, AGE_STATES } from "./age";
import { TABLE_ICONS, ACTION_ICONS } from "@/components/icons";
import { StoredIcon } from "@/components/IconPicker";
import styles from "./RefTable.module.css";

function resolveTable(tableKey) {
  return { def: REF_TABLES[tableKey], endpoint: `/refs/${tableKey}`, backLabel: "Shared DBs" };
}

export default function RefTablePage({ tableKey, onBack, activeCampaign }) {
  const { def: schema, endpoint, backLabel } = resolveTable(tableKey);
  if (!schema) return <p>Unknown table: {tableKey}</p>;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [allRefs, setAllRefs] = useState({});

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const campaignAge = activeCampaign?.currentAge ?? null;
  const hasAge = !!schema.hasAge;

  // ─ Load this table ─
  async function loadRows() {
    setLoading(true);
    try {
      const data = await api("GET", endpoint);
      setRows(data || []);
    } catch (e) {
      toast.error(`Load failed: ${e.message}`);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  // ─ Load referenced tables (for `ref` dropdowns) ─
  async function loadReferencedTables() {
    const refFields = (schema.fields || []).filter((f) => f.type === "ref");
    if (refFields.length === 0) return;

    const uniqueTables = [...new Set(refFields.map((f) => f.refTable))];
    const entries = await Promise.all(
      uniqueTables.map(async (t) => {
        try {
          const data = await api("GET", `/refs/${t}`);
          return [t, data || []];
        } catch {
          return [t, []];
        }
      })
    );
    setAllRefs(Object.fromEntries(entries));
  }

  useEffect(() => {
    loadRows();
    loadReferencedTables();
  }, [tableKey]);

  // ─ Filter ─
  const filtered = useMemo(() => {
    let out = rows;
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
    }
    if (hasAge && stateFilter !== "all") {
      out = out.filter((r) => ageInfo(r.age, campaignAge).state === stateFilter);
    }
    return out;
  }, [rows, query, stateFilter, hasAge, campaignAge]);

  // ─ Open new / edit ─
  const openNew = () => {
    const empty = {};
    (schema.fields || []).forEach((f) => { empty[f.key] = null; });
    setEditing(empty);
    setEditOpen(true);
  };
  const openEdit = (row) => {
    setEditing({ ...row });
    setEditOpen(true);
  };

  // ─ Save ─
  async function handleSave() {
    for (const f of schema.fields || []) {
      if (f.required && (editing[f.key] === null || editing[f.key] === "" || editing[f.key] === undefined)) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    try {
      if (editing.id) {
        await api("PATCH", `${endpoint}/${editing.id}`, stripMeta(editing));
        toast.ok("Updated");
      } else {
        await api("POST", endpoint, stripMeta(editing));
        toast.ok("Created");
      }
      setEditOpen(false);
      setEditing(null);
      loadRows();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await api("DELETE", `${endpoint}/${deleting.id}`);
      toast.ok("Deleted");
      setDeleting(null);
      loadRows();
    } catch (e) {
      toast.error(e.message);
      setDeleting(null);
    }
  }

  // ─ State counts for filter pills ─
  const stateCounts = useMemo(() => {
    if (!hasAge) return {};
    const c = { known: 0, forgotten: 0, lost: 0, undiscovered: 0, unknown: 0 };
    for (const r of rows) {
      const s = ageInfo(r.age, campaignAge).state;
      c[s] = (c[s] || 0) + 1;
    }
    return c;
  }, [rows, campaignAge, hasAge]);

  // ─ Render a cell ─
  const renderCell = (row, colKey) => {
    const field = (schema.fields || []).find((f) => f.key === colKey);
    const val = row[colKey];

    // Age column → show with state badge
    if (colKey === "age" && hasAge) {
      if (val == null) return <span className={styles.empty}>—</span>;
      const info = ageInfo(val, campaignAge);
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span className={styles.ageNum}>{val}</span>
          {campaignAge != null && (
            <span
              className={styles.stateBadge}
              style={{ color: info.meta.color, borderColor: info.meta.color }}
              title={info.meta.hint}
            >{info.meta.label}</span>
          )}
        </span>
      );
    }

    if (val === null || val === undefined || val === "") return <span className={styles.empty}>—</span>;

    if (!field) return String(val);
    if (field.type === "color") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 16, height: 16, borderRadius: 3, background: val, border: "1px solid var(--border)" }} />
          <code>{val}</code>
        </div>
      );
    }
    if (field.type === "tags") {
      const arr = Array.isArray(val) ? val : [];
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {arr.map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}
        </div>
      );
    }
    if (field.type === "ref") {
      const list = allRefs[field.refTable] || [];
      const match = list.find((o) => o.id === val);
      if (!match) return <span className={styles.empty}>?</span>;
      if (field.refTable === "types") {
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <StoredIcon name={match.icon} fallback="diamond" style={{ color: match.color || "var(--text)", fontSize: 14 }} />
            <span style={{ color: match.color || "var(--text)" }}>{match.name}</span>
          </span>
        );
      }
      return match.name;
    }
    return String(val);
  };

  return (
    <div className={styles.wrap}>
      {/* ── Breadcrumb ── */}
      <div className={styles.breadcrumb}>
        <button className={styles.backBtn} onClick={onBack}>
          <FontAwesomeIcon icon={ACTION_ICONS.back} />
          <span className={styles.backLabel}>{backLabel}</span>
        </button>
        <span className={styles.crumbSep}>&#8250;</span>
        <span className={styles.crumbCurrent}>
          {TABLE_ICONS[tableKey] && <FontAwesomeIcon icon={TABLE_ICONS[tableKey]} className={styles.crumbIcon} />}
          {schema.label}
        </span>
      </div>

      {/* ── Header ── */}
      <div className={styles.header}>
        <h2 className={styles.title}>{schema.label}</h2>
        <p className={styles.desc}>{schema.description}</p>
        {hasAge && campaignAge == null && (
          <p className={styles.warning}>
            ⚠ No campaign selected — age states (known/forgotten/lost) aren't computed.
          </p>
        )}
        {hasAge && campaignAge != null && (
          <p className={styles.hint}>
            Currently viewing for <strong>Age {campaignAge}</strong>. State badges show entries
            relative to this era.
          </p>
        )}
      </div>

      {/* ── Age state filter pills ── */}
      {hasAge && campaignAge != null && (
        <div className={styles.stateFilter}>
          <button
            className={styles.stateChip}
            data-active={stateFilter === "all"}
            onClick={() => setStateFilter("all")}
          >All <span className={styles.chipCount}>{rows.length}</span></button>
          {Object.entries(AGE_STATES).map(([stateKey, meta]) => {
            const count = stateCounts[stateKey] || 0;
            if (count === 0) return null;
            return (
              <button
                key={stateKey}
                className={styles.stateChip}
                data-active={stateFilter === stateKey}
                style={{
                  borderColor: stateFilter === stateKey ? meta.color : undefined,
                  color: stateFilter === stateKey ? meta.color : undefined,
                }}
                onClick={() => setStateFilter(stateKey)}
                title={meta.hint}
              >{meta.label} <span className={styles.chipCount}>{count}</span></button>
            );
          })}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>
          {loading ? "Loading..." : `${filtered.length} / ${rows.length}`}
        </p>
        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={openNew}>+ New {singular(schema.label)}</button>
      </div>

      {loading ? null : rows.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No {schema.label.toLowerCase()} yet.</p>
          <button className="btn-primary" onClick={openNew} style={{ marginTop: 12 }}>Create first one</button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {(schema.listColumns || []).map((col) => {
                  const f = (schema.fields || []).find((x) => x.key === col);
                  return <th key={col}>{f?.label || col}</th>;
                })}
                <th className={styles.actionsCol}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  {(schema.listColumns || []).map((col) => (
                    <td key={col}>{renderCell(row, col)}</td>
                  ))}
                  <td className={styles.actionsCol}>
                    <button className="btn-sm" onClick={() => openEdit(row)}>Edit</button>
                    <button className="btn-sm btn-danger" onClick={() => setDeleting(row)}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Edit / New Modal ── */}
      <Modal
        open={editOpen}
        title={editing?.id ? `Edit ${singular(schema.label)}` : `New ${singular(schema.label)}`}
        onClose={() => setEditOpen(false)}
        width={640}
      >
        {editing && (
          <>
            {(schema.fields || []).map((f) => (
              <label key={f.key} className={styles.field}>
                <span className={styles.fieldLabel}>
                  {f.label}
                  {f.required && <span className={styles.required}>*</span>}
                </span>
                <FieldInput
                  field={f}
                  value={editing[f.key]}
                  onChange={(v) => setEditing({ ...editing, [f.key]: v })}
                  allRefs={allRefs}
                />
                {f.hint && <span className={styles.hint}>{f.hint}</span>}
              </label>
            ))}
            <div className={styles.formFoot}>
              <button onClick={() => setEditOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>
                {editing.id ? "Save Changes" : "Create"}
              </button>
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title={`Delete ${singular(schema.label)}`}
        message={`Permanently delete "${deleting?.name || "this entry"}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

function stripMeta(obj) {
  const { id, createdAt, updatedAt, ...rest } = obj;
  return rest;
}

// Naively singularize a plural: "Ruins" → "Ruin", "Abilities" → "Ability"
function singular(label) {
  if (label.endsWith("ies")) return label.slice(0, -3) + "y";
  if (label.endsWith("s"))   return label.slice(0, -1);
  return label;
}
