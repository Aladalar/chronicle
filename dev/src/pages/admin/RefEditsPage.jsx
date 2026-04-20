import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { REF_TABLES } from "./refs/schema";
import ConfirmDialog from "@/components/ConfirmDialog";
import Modal from "@/components/Modal";
import { toast } from "@/components/Toast";
import styles from "./RefEditsPage.module.css";

const FILTERS = [
  { id: "pending",  label: "Pending"  },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all",      label: "All"      },
];

export default function RefEditsPage() {
  const [filter, setFilter] = useState("pending");
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [viewing, setViewing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const q = filter === "all" ? "" : `?status=${filter}`;
      const data = await api("GET", `/proposals${q}`);
      setProposals(data || []);
    } catch (e) {
      toast.error(`Load failed: ${e.message}`);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  async function approve(p) {
    try {
      await api("POST", `/proposals/${p.id}/approve`);
      toast.ok(`Approved: ${describe(p)}`);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function reject() {
    if (!rejecting) return;
    try {
      await api("POST", `/proposals/${rejecting.id}/reject`, { reason: rejectReason });
      toast.ok("Rejected");
      setRejecting(null);
      setRejectReason("");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  const describe = (p) => {
    const table = REF_TABLES[p.table]?.label || p.table;
    const op = { create: "Create", update: "Update", delete: "Delete" }[p.op] || p.op;
    return `${op} ${table}: ${p.data?.name || p.targetId || "?"}`;
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.intro}>
        <p className="muted">
          Players with <strong>commit</strong> permission propose changes to shared DBs.
          Review and approve or reject them here. Pending count should live here when the backend is ready.
        </p>
      </div>

      <div className={styles.filterBar}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={styles.filterBtn}
            data-active={filter === f.id}
            onClick={() => setFilter(f.id)}
          >{f.label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>
          {loading ? "Loading..." : `${proposals.length} proposal${proposals.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {loading ? null : proposals.length === 0 ? (
        <div className={styles.empty}>
          <p>No {filter} proposals.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {proposals.map((p) => {
            const tableMeta = REF_TABLES[p.table];
            return (
              <div key={p.id} className={styles.card} data-op={p.op} data-status={p.status}>
                <div className={styles.cardHead}>
                  <div className={styles.badges}>
                    <span className={styles.opBadge} data-op={p.op}>{p.op}</span>
                    <span className={styles.tableBadge}>
                      {tableMeta?.icon} {tableMeta?.label || p.table}
                    </span>
                    {p.status !== "pending" && (
                      <span className={styles.statusBadge} data-status={p.status}>{p.status}</span>
                    )}
                  </div>
                  <span className={styles.meta}>
                    by <strong>{p.author?.displayName || p.author?.username || "unknown"}</strong>
                    {p.createdAt && <> · {new Date(p.createdAt).toLocaleString()}</>}
                  </span>
                </div>

                <h4 className={styles.title}>{p.data?.name || p.targetId || "(unnamed)"}</h4>

                {p.reason && (
                  <p className={styles.reason}><em>{p.reason}</em></p>
                )}

                <div className={styles.actions}>
                  <button className="btn-sm" onClick={() => setViewing(p)}>View diff</button>
                  <div style={{ flex: 1 }} />
                  {p.status === "pending" && (
                    <>
                      <button className="btn-sm btn-danger" onClick={() => setRejecting(p)}>Reject</button>
                      <button className="btn-sm btn-primary" onClick={() => approve(p)}>Approve</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Reject dialog ── */}
      <Modal
        open={!!rejecting}
        title="Reject Proposal"
        onClose={() => { setRejecting(null); setRejectReason(""); }}
        width={460}
      >
        {rejecting && (
          <>
            <p className="muted" style={{ marginBottom: 10 }}>
              Rejecting <strong>{describe(rejecting)}</strong>
            </p>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Reason (optional)</span>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Why is this being rejected?"
                rows={3}
              />
            </label>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
              <button onClick={() => { setRejecting(null); setRejectReason(""); }}>Cancel</button>
              <button className="btn-danger" onClick={reject}>Reject</button>
            </div>
          </>
        )}
      </Modal>

      {/* ── Diff / details ── */}
      <Modal
        open={!!viewing}
        title={viewing ? describe(viewing) : ""}
        onClose={() => setViewing(null)}
        width={640}
      >
        {viewing && (
          <pre className={styles.jsonBlock}>
            {JSON.stringify(viewing.data, null, 2)}
          </pre>
        )}
      </Modal>
    </div>
  );
}
