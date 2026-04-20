import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "@/api/client";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "@/components/Toast";
import FieldInput from "../refs/FieldInput";
import { PRESET_FIELDS } from "./soundSchema";
import { SOUND_ICONS, ACTION_ICONS } from "@/components/icons";
import styles from "./PresetEditor.module.css";

export default function PresetEditor({ onBack, onActivate }) {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  async function load() {
    setLoading(true);
    try { setPresets(await api("GET", "/sounds/presets") || []); }
    catch (e) { toast.error(e.message); setPresets([]); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing({
      name: "", tags: [], fadeInDuration: 2, fadeOutDuration: 2, notes: "",
      musicTrack: null,
      ambientLayers: [],   // [{ trackId, trackName, volume, loop, loopDelay, fadeIn, fadeOut }]
      soundButtons: [],    // [{ trackId, trackName, volume, loop, loopDelay, fadeIn, fadeOut }]
    });
    setEditOpen(true);
  };

  const openEdit = (p) => {
    setEditing({
      ...p,
      musicTrack: p.musicTrack || null,
      ambientLayers: p.ambientLayers || [],
      soundButtons: p.soundButtons || [],
    });
    setEditOpen(true);
  };

  async function handleSave() {
    if (!editing.name?.trim()) { toast.error("Name is required"); return; }
    try {
      const { id, createdAt, updatedAt, ...payload } = editing;
      if (id) { await api("PATCH", `/sounds/presets/${id}`, payload); toast.ok("Updated"); }
      else    { await api("POST", "/sounds/presets", payload); toast.ok("Created"); }
      setEditOpen(false); setEditing(null); load();
    } catch (e) { toast.error(e.message); }
  }

  async function handleDelete() {
    if (!deleting) return;
    try { await api("DELETE", `/sounds/presets/${deleting.id}`); toast.ok("Deleted"); setDeleting(null); load(); }
    catch (e) { toast.error(e.message); setDeleting(null); }
  }

  const addLayer = (list, key) => {
    setEditing({
      ...editing,
      [key]: [...editing[key], { trackId: null, trackName: "", volume: 80, loop: "yes", loopDelay: 0, fadeIn: 1, fadeOut: 1 }],
    });
  };

  const updLayer = (key, idx, field, val) => {
    const arr = [...editing[key]];
    arr[idx] = { ...arr[idx], [field]: val };
    setEditing({ ...editing, [key]: arr });
  };

  const rmLayer = (key, idx) => {
    setEditing({ ...editing, [key]: editing[key].filter((_, i) => i !== idx) });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <button className={styles.backBtn} onClick={onBack}>
          <FontAwesomeIcon icon={ACTION_ICONS.back} /> Soundboard
        </button>
        <span className={styles.sep}>›</span>
        <span className={styles.current}>
          <FontAwesomeIcon icon={SOUND_ICONS.bundles} /> Presets
        </span>
      </div>

      <div className={styles.toolbar}>
        <span className="muted" style={{ fontSize: 13 }}>
          {loading ? "..." : `${presets.length} preset${presets.length === 1 ? "" : "s"}`}
        </span>
        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={openNew}>
          <FontAwesomeIcon icon={ACTION_ICONS.add} /> New Preset
        </button>
      </div>

      {!loading && presets.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No presets. Create your first scene.</p>
          <button className="btn-primary" onClick={openNew} style={{ marginTop: 12 }}>Create</button>
        </div>
      ) : !loading && (
        <div className={styles.grid}>
          {presets.map((p) => (
            <div key={p.id} className={styles.card}>
              <h3 className={styles.cardTitle}>{p.name}</h3>
              <div className={styles.cardMeta}>
                {(p.tags || []).map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}
              </div>
              <div className={styles.cardStats}>
                {p.musicTrack && <span>♫ 1 music</span>}
                <span>≋ {(p.ambientLayers || []).length} ambient</span>
                <span>⚡ {(p.soundButtons || []).length} sounds</span>
              </div>
              <div className={styles.cardActions}>
                <button className="btn-sm btn-primary" onClick={() => onActivate(p)}>
                  <FontAwesomeIcon icon={ACTION_ICONS.play} /> Activate
                </button>
                <button className="btn-sm" onClick={() => openEdit(p)}>
                  <FontAwesomeIcon icon={ACTION_ICONS.edit} />
                </button>
                <button className="btn-sm btn-danger" onClick={() => setDeleting(p)}>
                  <FontAwesomeIcon icon={ACTION_ICONS.delete} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit modal ── */}
      <Modal open={editOpen} title={editing?.id ? "Edit Preset" : "New Preset"} onClose={() => setEditOpen(false)} width={720}>
        {editing && (<>
          {PRESET_FIELDS.map((f) => (
            <label key={f.key} className={styles.field}>
              <span className={styles.fieldLabel}>{f.label}{f.required && <span style={{ color: "var(--red)" }}>*</span>}</span>
              <FieldInput field={f} value={editing[f.key]} onChange={(v) => setEditing({ ...editing, [f.key]: v })} allRefs={{}} />
            </label>
          ))}

          <hr />

          {/* Music track (singleton) */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}><FontAwesomeIcon icon={SOUND_ICONS.music} /> Music Track</h4>
            <p className={styles.hint}>One track. Starting this preset crossfades from current music.</p>
            {editing.musicTrack ? (
              <LayerRow
                layer={editing.musicTrack}
                onUpdate={(f, v) => setEditing({ ...editing, musicTrack: { ...editing.musicTrack, [f]: v } })}
                onRemove={() => setEditing({ ...editing, musicTrack: null })}
              />
            ) : (
              <button className="btn-sm" onClick={() => setEditing({ ...editing, musicTrack: { trackName: "", volume: 80, loop: "yes", loopDelay: 0, fadeIn: 2, fadeOut: 2 } })}>
                + Set Music
              </button>
            )}
          </div>

          {/* Ambient layers */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}><FontAwesomeIcon icon={SOUND_ICONS.ambient} /> Ambient Layers</h4>
            <p className={styles.hint}>Multiple. Shared layers between presets persist during transitions.</p>
            {editing.ambientLayers.map((l, i) => (
              <LayerRow key={i} layer={l}
                onUpdate={(f, v) => updLayer("ambientLayers", i, f, v)}
                onRemove={() => rmLayer("ambientLayers", i)} />
            ))}
            <button className="btn-sm" onClick={() => addLayer(editing.ambientLayers, "ambientLayers")}>+ Add Ambient</button>
          </div>

          {/* Sound buttons */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}><FontAwesomeIcon icon={SOUND_ICONS.sounds} /> Quick-fire Sounds</h4>
            <p className={styles.hint}>On-deck buttons the DM can trigger during play. Can loop with delay.</p>
            {editing.soundButtons.map((l, i) => (
              <LayerRow key={i} layer={l}
                onUpdate={(f, v) => updLayer("soundButtons", i, f, v)}
                onRemove={() => rmLayer("soundButtons", i)} />
            ))}
            <button className="btn-sm" onClick={() => addLayer(editing.soundButtons, "soundButtons")}>+ Add Sound</button>
          </div>

          <div className={styles.formFoot}>
            <button onClick={() => setEditOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}>{editing.id ? "Save" : "Create"}</button>
          </div>
        </>)}
      </Modal>

      <ConfirmDialog open={!!deleting} title="Delete Preset" message={`Delete "${deleting?.name}"?`}
        confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleting(null)} />
    </div>
  );
}

function LayerRow({ layer, onUpdate, onRemove }) {
  return (
    <div className={styles.layerRow}>
      <input value={layer.trackName || ""} onChange={(e) => onUpdate("trackName", e.target.value)} placeholder="Track name / path" style={{ flex: 2 }} />
      <div className={styles.layerControl}>
        <label className={styles.miniLabel}>Vol</label>
        <input type="range" min="0" max="100" value={layer.volume ?? 80} onChange={(e) => onUpdate("volume", Number(e.target.value))} style={{ width: 80 }} />
        <span className={styles.miniVal}>{layer.volume ?? 80}%</span>
      </div>
      <div className={styles.layerControl}>
        <label className={styles.miniLabel}>Loop</label>
        <select value={layer.loop || "no"} onChange={(e) => onUpdate("loop", e.target.value)} style={{ width: 60, padding: "3px 4px", fontSize: 12 }}>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      {layer.loop === "yes" && (
        <div className={styles.layerControl}>
          <label className={styles.miniLabel}>Delay</label>
          <input type="number" min="0" value={layer.loopDelay ?? 0} onChange={(e) => onUpdate("loopDelay", Number(e.target.value))}
            style={{ width: 50, padding: "3px 4px", fontSize: 12 }} /> <span className={styles.miniVal}>s</span>
        </div>
      )}
      <div className={styles.layerControl}>
        <label className={styles.miniLabel}>Fade</label>
        <input type="number" min="0" step="0.5" value={layer.fadeIn ?? 0} onChange={(e) => onUpdate("fadeIn", Number(e.target.value))}
          style={{ width: 40, padding: "3px 4px", fontSize: 12 }} title="Fade in" />
        <span className={styles.miniVal}>/</span>
        <input type="number" min="0" step="0.5" value={layer.fadeOut ?? 0} onChange={(e) => onUpdate("fadeOut", Number(e.target.value))}
          style={{ width: 40, padding: "3px 4px", fontSize: 12 }} title="Fade out" />
      </div>
      <button className="btn-sm btn-danger" onClick={onRemove}><FontAwesomeIcon icon={ACTION_ICONS.delete} /></button>
    </div>
  );
}
