import { useEffect, useState } from "react";
import { api } from "@/api/client";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "@/components/Toast";
import styles from "./PlayersPage.module.css";

export default function PlayersPage({ activeCampaign }) {
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [newInvite, setNewInvite] = useState({ role: "player", characterId: "" });
  const [generatedInvite, setGeneratedInvite] = useState(null);

  const [revoking, setRevoking] = useState(null);

  if (!activeCampaign) {
    return (
      <div className={styles.empty}>
        <h3>No campaign selected</h3>
        <p className="muted">Go to Campaigns and select one.</p>
      </div>
    );
  }

  const cid = activeCampaign.id;

  async function load() {
    setLoading(true);
    try {
      const [mems, invs, chars] = await Promise.all([
        api("GET", `/campaigns/${cid}/members`).catch(() => []),
        api("GET", `/campaigns/${cid}/invites`).catch(() => []),
        api("GET", `/campaigns/${cid}/characters`).catch(() => []),
      ]);
      setMembers(mems || []);
      setInvites(invs || []);
      setCharacters(chars || []);
    } catch (e) {
      toast.error(`Load failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [cid]);

  async function createInvite() {
    try {
      const res = await api("POST", `/campaigns/${cid}/invite`, {
        role: newInvite.role,
        characterId: newInvite.characterId || null,
      });
      setGeneratedInvite(res);
      toast.ok("Invite generated");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function revokeInvite() {
    if (!revoking) return;
    try {
      await api("DELETE", `/invites/${revoking.inviteCode || revoking.code}`);
      toast.ok("Invite revoked");
      setRevoking(null);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  // Unassigned characters = characters with no ownerId
  const unassignedCharacters = characters.filter((c) => !c.ownerId);

  const inviteUrl = (code) => `${window.location.origin}/invite/${code}`;

  return (
    <div className={styles.wrap}>
      {/* ── Members ── */}
      <section>
        <header className={styles.sectionHead}>
          <h3>Members</h3>
          <p className={styles.sectionDesc}>Players who have joined this campaign.</p>
        </header>

        {loading ? null : members.length === 0 ? (
          <div className={styles.emptyBox}>No members yet.</div>
        ) : (
          <div className={styles.list}>
            {members.map((m) => (
              <div key={m.id || m.userId} className={styles.memberCard}>
                <div className={styles.avatar}>
                  {(m.user?.displayName || m.user?.username || "?")[0].toUpperCase()}
                </div>
                <div className={styles.memberInfo}>
                  <span className={styles.memberName}>
                    {m.user?.displayName || m.user?.username || "Unknown"}
                  </span>
                  <span className={styles.memberMeta}>
                    @{m.user?.username} · {m.role}
                  </span>
                </div>
                <div style={{ flex: 1 }} />
                <span className={styles.roleBadge} data-role={m.role}>{m.role}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Invites ── */}
      <section>
        <header className={styles.sectionHead}>
          <h3>Pending Invites</h3>
          <p className={styles.sectionDesc}>
            Generate an invite link to share. Optionally pair it with an existing unassigned character;
            if unpaired, a new player + character slot will be created when they register.
          </p>
          <button className="btn-primary" onClick={() => {
            setNewInvite({ role: "player", characterId: "" });
            setGeneratedInvite(null);
            setInviteOpen(true);
          }}>+ Generate Invite</button>
        </header>

        {loading ? null : invites.length === 0 ? (
          <div className={styles.emptyBox}>No pending invites.</div>
        ) : (
          <div className={styles.list}>
            {invites.map((inv) => {
              const paired = inv.characterId ? characters.find((c) => c.id === inv.characterId) : null;
              const code = inv.inviteCode || inv.code;
              return (
                <div key={code} className={styles.inviteCard}>
                  <div className={styles.inviteInfo}>
                    <code className={styles.inviteCode}>{code}</code>
                    <span className={styles.inviteMeta}>
                      Role: <strong>{inv.role}</strong>
                      {paired && <> · Paired to <strong>{paired.name}</strong></>}
                      {!paired && inv.characterId && <> · Paired (character not loaded)</>}
                      {!inv.characterId && <> · Will create new character</>}
                    </span>
                  </div>
                  <div style={{ flex: 1 }} />
                  <button
                    className="btn-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(inviteUrl(code));
                      toast.ok("Invite URL copied");
                    }}
                  >Copy Link</button>
                  <button className="btn-sm btn-danger" onClick={() => setRevoking(inv)}>Revoke</button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Invite modal ── */}
      <Modal
        open={inviteOpen}
        title={generatedInvite ? "Share This Link" : "Generate Invite"}
        onClose={() => { setInviteOpen(false); setGeneratedInvite(null); }}
        width={520}
      >
        {generatedInvite ? (
          <>
            <p className="muted">Send this link to the player. They'll set their username and password on first open.</p>
            <div className={styles.copyBox}>
              <code>{inviteUrl(generatedInvite.inviteCode || generatedInvite.code)}</code>
              <button
                className="btn-sm btn-primary"
                onClick={() => {
                  navigator.clipboard.writeText(inviteUrl(generatedInvite.inviteCode || generatedInvite.code));
                  toast.ok("Copied");
                }}
              >Copy</button>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button className="btn-primary" onClick={() => { setInviteOpen(false); setGeneratedInvite(null); }}>
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Role</span>
              <select
                value={newInvite.role}
                onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
              >
                <option value="player">Player</option>
                <option value="dm">Co-DM</option>
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Pair with existing character (optional)</span>
              <select
                value={newInvite.characterId}
                onChange={(e) => setNewInvite({ ...newInvite, characterId: e.target.value })}
              >
                <option value="">— None (new player, new character) —</option>
                {unassignedCharacters.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <span className={styles.hint}>
                Only unassigned characters shown. If unpaired, a new character slot is created on join.
              </span>
            </label>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setInviteOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={createInvite}>Generate Link</button>
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={!!revoking}
        title="Revoke Invite"
        message={`Revoke this invite? The link will no longer work.`}
        confirmLabel="Revoke"
        danger
        onConfirm={revokeInvite}
        onCancel={() => setRevoking(null)}
      />
    </div>
  );
}
