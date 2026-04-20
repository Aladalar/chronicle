import { useEffect, useState } from "react";
import { api } from "@/api/client";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "@/components/Toast";
import styles from "./CampaignsPage.module.css";

export default function CampaignsPage({ activeCampaign, onSelect }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null for new, object for existing
  const [deleting, setDeleting] = useState(null);

  // ─ Load list ─
  async function loadList() {
    setLoading(true);
    try {
      const list = await api("GET", "/campaigns");
      setCampaigns(list || []);
    } catch (e) {
      toast.error(`Load failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadList(); }, []);

  // ─ Open modals ─
  const openNew = () => {
    setEditing({ name: "", description: "" });
    setEditOpen(true);
  };
  const openEdit = (c) => {
    setEditing({ ...c });
    setEditOpen(true);
  };

  // ─ Save (create or update) ─
  async function handleSave() {
    if (!editing.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      const payload = {
        name: editing.name,
        description: editing.description || "",
        currentAge: editing.currentAge ?? 1,
      };
      if (editing.id) {
        await api("PATCH", `/campaigns/${editing.id}`, payload);
        toast.ok("Campaign updated");
      } else {
        const created = await api("POST", "/campaigns", payload);
        toast.ok(`Created "${created.name}"`);
      }
      setEditOpen(false);
      setEditing(null);
      loadList();
    } catch (e) {
      toast.error(e.message);
    }
  }

  // ─ Delete ─
  async function handleDelete() {
    if (!deleting) return;
    try {
      await api("DELETE", `/campaigns/${deleting.id}`);
      toast.ok(`Deleted "${deleting.name}"`);
      if (activeCampaign?.id === deleting.id) onSelect(null);
      setDeleting(null);
      loadList();
    } catch (e) {
      toast.error(e.message);
      setDeleting(null);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div>
          <p className="muted" style={{ margin: 0 }}>
            {loading ? "Loading..." : `${campaigns.length} campaign${campaigns.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <button className="btn-primary" onClick={openNew}>
          <span style={{ fontSize: 18, marginRight: 6 }}>+</span>
          New Campaign
        </button>
      </div>

      {loading ? null : campaigns.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No campaigns yet</p>
          <p className="muted">Create your first campaign to get started.</p>
          <button className="btn-primary btn-lg" onClick={openNew} style={{ marginTop: 16 }}>
            Create First Campaign
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {campaigns.map((c) => {
            const active = activeCampaign?.id === c.id;
            return (
              <div key={c.id} className={styles.card} data-active={active}>
                <div className={styles.cardHead}>
                  <h3 className={styles.cardTitle}>{c.name}</h3>
                  {active && <span className={styles.activeTag}>Active</span>}
                </div>
                {c.description ? (
                  <p className={styles.cardDesc}>{c.description}</p>
                ) : (
                  <p className={styles.cardDesc + " muted"} style={{ fontStyle: "italic" }}>No description</p>
                )}
                <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-mono, monospace)" }}>
                  Age {c.currentAge ?? 1}
                </div>
                <div className={styles.cardFoot}>
                  {!active && (
                    <button className="btn-primary btn-sm" onClick={() => onSelect(c)}>
                      Select
                    </button>
                  )}
                  {active && (
                    <span className="muted" style={{ fontSize: 13 }}>Currently selected</span>
                  )}
                  <div style={{ flex: 1 }} />
                  <button className="btn-sm" onClick={() => openEdit(c)}>Edit</button>
                  <button className="btn-sm btn-danger" onClick={() => setDeleting(c)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─ Edit / New Modal ─ */}
      <Modal
        open={editOpen}
        title={editing?.id ? "Edit Campaign" : "New Campaign"}
        onClose={() => setEditOpen(false)}
      >
        {editing && (
          <>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Name</span>
              <input
                value={editing.name || ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="The Shattered Kingdom"
                autoFocus
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Description</span>
              <textarea
                value={editing.description || ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="A long-running campaign set in the ruins of the old empire..."
                rows={4}
              />
            </label>
            <label className={styles.field} style={{ maxWidth: 160 }}>
              <span className={styles.fieldLabel}>Current Age</span>
              <input
                type="number"
                min="1"
                value={editing.currentAge ?? 1}
                onChange={(e) => setEditing({ ...editing, currentAge: e.target.value === "" ? null : Number(e.target.value) })}
                placeholder="1"
              />
              <span style={{ fontSize: 12, color: "var(--text-mut)", fontStyle: "italic" }}>
                Which era is this campaign set in? Determines known/forgotten/lost states.
              </span>
            </label>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={() => setEditOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>
                {editing.id ? "Save Changes" : "Create"}
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* ─ Delete Confirm ─ */}
      <ConfirmDialog
        open={!!deleting}
        title="Delete Campaign"
        message={`Permanently delete "${deleting?.name}"? All characters, journal entries, and data in this campaign will be lost. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
