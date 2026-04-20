import { useEffect, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "@/api/client";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "@/components/Toast";
import FieldInput from "../refs/FieldInput";
import { SOUND_CATEGORIES, SOUND_FIELDS, SOUND_LIST_COLUMNS } from "./soundSchema";
import { SOUND_ICONS, ACTION_ICONS } from "@/components/icons";
import styles from "./SoundTable.module.css";

export default function SoundTable({ category, onBack }) {
  const cat = SOUND_CATEGORIES[category];
  const fields = SOUND_FIELDS[category] || [];
  const listCols = SOUND_LIST_COLUMNS[category] || ["name"];

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const endpoint = `/sounds/${category}`;

  async function load() {
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

  useEffect(() => { load(); }, [category]);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }, [rows, query]);

  const openNew = () => {
    const empty = {};
    fields.forEach((f) => { empty[f.key] = null; });
    setEditing(empty);
    setEditOpen(true);
  };

  const openEdit = (row) => {
    setEditing({ ...row });
    setEditOpen(true);
  };

  async function handleSave() {
    for (const f of fields) {
      if (f.required && !editing[f.key]) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    try {
      const { id, createdAt, updatedAt, ...payload } = editing;
      if (id) {
        await api("PATCH", `${endpoint}/${id}`, payload);
        toast.ok("Updated");
      } else {
        await api("POST", endpoint, payload);
        toast.ok("Created");
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
      await api("DELETE", `${endpoint}/${deleting.id}`);
      toast.ok("Deleted");
      setDeleting(null);
      load();
    } catch (e) {
      toast.error(e.message);
      setDeleting(null);
    }
  }

  const renderCell = (row, colKey) => {
    const val = row[colKey];
    if (val === null || val === undefined || val === "") return <span className={styles.empty}>—</span>;
    if (colKey === "tags" && Array.isArray(val)) {
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {val.map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}
        </div>
      );
    }
    if (colKey === "loop") return val === "yes" ? "Loop" : "Once";
    return String(val);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <button className={styles.backBtn} onClick={onBack}>
          <FontAwesomeIcon icon={ACTION_ICONS.back} />
          <span>Soundboard</span>
        </button>
        <span className={styles.crumbSep}>&#8250;</span>
        <span className={styles.crumbCurrent}>
          <FontAwesomeIcon icon={SOUND_ICONS[category]} />
          {cat.label}
        </span>
      </div>

      <div className={styles.header}>
        <h2>{cat.label}</h2>
        <p className={styles.desc}>{cat.desc}</p>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="muted" style={{ fontSize: 13 }}>
          {loading ? "Loading..." : `${filtered.length} / ${rows.length}`}
        </span>
        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={openNew}>
          <FontAwesomeIcon icon={ACTION_ICONS.add} style={{ marginRight: 6 }} />
          New
        </button>
      </div>

      {loading ? null : rows.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No {cat.label.toLowerCase()} yet.</p>
          <button className="btn-primary" onClick={openNew} style={{ marginTop: 12 }}>Create first one</button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {listCols.map((col) => {
                  const f = fields.find((x) => x.key === col);
                  return <th key={col}>{f?.label || col}</th>;
                })}
                <th className={styles.actionsCol}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id || row.name}>
                  {listCols.map((col) => (
                    <td key={col}>{renderCell(row, col)}</td>
                  ))}
                  <td className={styles.actionsCol}>
                    <button className="btn-sm" onClick={() => openEdit(row)}>
                      <FontAwesomeIcon icon={ACTION_ICONS.edit} />
                    </button>
                    <button className="btn-sm btn-danger" onClick={() => setDeleting(row)}>
                      <FontAwesomeIcon icon={ACTION_ICONS.delete} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={editOpen}
        title={editing?.id ? `Edit` : `New ${cat.label.replace(/s$/, "")}`}
        onClose={() => setEditOpen(false)}
        width={600}
      >
        {editing && (
          <>
            {fields.map((f) => (
              <label key={f.key} className={styles.field}>
                <span className={styles.fieldLabel}>
                  {f.label}
                  {f.required && <span style={{ color: "var(--red)" }}>*</span>}
                </span>
                <FieldInput
                  field={f}
                  value={editing[f.key]}
                  onChange={(v) => setEditing({ ...editing, [f.key]: v })}
                  allRefs={{}}
                />
              </label>
            ))}
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
        title="Delete"
        message={`Delete "${deleting?.name}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
