import { useEffect, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "@/api/client";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "@/components/Toast";
import FieldInput from "../refs/FieldInput";
import { LIBRARY_CATEGORIES, fieldsFor, LIST_COLUMNS } from "./soundSchema";
import { SOUND_ICONS, ACTION_ICONS } from "@/components/icons";
import styles from "./SoundLibrary.module.css";

export default function SoundLibrary({ category, onBack }) {
  const cat = LIBRARY_CATEGORIES[category];
  const fields = fieldsFor(category);
  const endpoint = `/sounds/${category}`;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  async function load() {
    setLoading(true);
    try { setRows(await api("GET", endpoint) || []); }
    catch (e) { toast.error(e.message); setRows([]); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [category]);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }, [rows, query]);

  const openNew = () => {
    const empty = { volume: 80, loop: "no", loopDelay: 0, fadeIn: 0, fadeOut: 0 };
    fields.forEach((f) => { if (!(f.key in empty)) empty[f.key] = null; });
    setEditing(empty);
    setEditOpen(true);
  };

  async function handleSave() {
    for (const f of fields) {
      if (f.required && !editing[f.key]) { toast.error(`${f.label} is required`); return; }
    }
    try {
      const { id, createdAt, updatedAt, ...payload } = editing;
      if (id) { await api("PATCH", `${endpoint}/${id}`, payload); toast.ok("Updated"); }
      else    { await api("POST", endpoint, payload); toast.ok("Created"); }
      setEditOpen(false); setEditing(null); load();
    } catch (e) { toast.error(e.message); }
  }

  async function handleDelete() {
    if (!deleting) return;
    try { await api("DELETE", `${endpoint}/${deleting.id}`); toast.ok("Deleted"); setDeleting(null); load(); }
    catch (e) { toast.error(e.message); setDeleting(null); }
  }

  const renderCell = (row, col) => {
    const val = row[col];
    if (val == null || val === "") return <span className={styles.empty}>—</span>;
    if (col === "tags" && Array.isArray(val)) return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {val.map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}
      </div>
    );
    if (col === "volume") return `${val}%`;
    if (col === "loop") return val === "yes" ? "Loop" : "—";
    return String(val);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <button className={styles.backBtn} onClick={onBack}>
          <FontAwesomeIcon icon={ACTION_ICONS.back} /> Soundboard
        </button>
        <span className={styles.sep}>›</span>
        <span className={styles.current}>
          <FontAwesomeIcon icon={SOUND_ICONS[category]} /> {cat.label}
        </span>
      </div>

      <div className={styles.toolbar}>
        <input placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ maxWidth: 260 }} />
        <span className="muted" style={{ fontSize: 13 }}>{loading ? "..." : `${filtered.length}/${rows.length}`}</span>
        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={openNew}>
          <FontAwesomeIcon icon={ACTION_ICONS.add} /> New
        </button>
      </div>

      {!loading && rows.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No {cat.label.toLowerCase()} yet.</p>
          <button className="btn-primary" onClick={openNew} style={{ marginTop: 12 }}>Create first</button>
        </div>
      ) : !loading && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              {LIST_COLUMNS.map((c) => <th key={c}>{fields.find((f) => f.key === c)?.label || c}</th>)}
              <th style={{ width: 80, textAlign: "right" }}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id || r.name}>
                  {LIST_COLUMNS.map((c) => <td key={c}>{renderCell(r, c)}</td>)}
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button className="btn-sm" onClick={() => { setEditing({ ...r }); setEditOpen(true); }}><FontAwesomeIcon icon={ACTION_ICONS.edit} /></button>
                    <button className="btn-sm btn-danger" onClick={() => setDeleting(r)} style={{ marginLeft: 4 }}><FontAwesomeIcon icon={ACTION_ICONS.delete} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={editOpen} title={editing?.id ? "Edit" : `New ${cat.label.replace(/s$/, "")}`} onClose={() => setEditOpen(false)} width={600}>
        {editing && (<>
          {fields.map((f) => (
            <label key={f.key} className={styles.field}>
              <span className={styles.fieldLabel}>{f.label}{f.required && <span style={{ color: "var(--red)" }}>*</span>}</span>
              <FieldInput field={f} value={editing[f.key]} onChange={(v) => setEditing({ ...editing, [f.key]: v })} allRefs={{}} />
            </label>
          ))}
          <div className={styles.formFoot}>
            <button onClick={() => setEditOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}>{editing.id ? "Save" : "Create"}</button>
          </div>
        </>)}
      </Modal>

      <ConfirmDialog open={!!deleting} title="Delete" message={`Delete "${deleting?.name}"?`}
        confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleting(null)} />
    </div>
  );
}
