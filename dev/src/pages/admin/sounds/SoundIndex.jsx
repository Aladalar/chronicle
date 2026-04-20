import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SOUND_ICONS } from "@/components/icons";
import { LIBRARY_CATEGORIES } from "./soundSchema";
import SoundLibrary from "./SoundLibrary";
import PresetEditor from "./PresetEditor";
import LiveMixer from "./LiveMixer";
import styles from "./SoundIndex.module.css";

export default function SoundIndex() {
  const [view, setView] = useState(null); // null = landing, "presets", or category key
  const [activePreset, setActivePreset] = useState(null);

  if (view === "presets") {
    return (
      <>
        <PresetEditor
          onBack={() => setView(null)}
          onActivate={(p) => { setActivePreset(p); setView(null); }}
        />
        <LiveMixer activePreset={activePreset} onDeactivate={() => setActivePreset(null)} />
      </>
    );
  }

  if (view && LIBRARY_CATEGORIES[view]) {
    return (
      <>
        <SoundLibrary category={view} onBack={() => setView(null)} />
        <LiveMixer activePreset={activePreset} onDeactivate={() => setActivePreset(null)} />
      </>
    );
  }

  // ── Landing ──
  return (
    <>
      <div className={styles.wrap}>
        <div className={styles.intro}>
          <p className="muted">
            Build your audio library, create scene presets, and use the live mixer
            to control music, ambient layers, and sound effects during play.
          </p>
        </div>

        {/* Active preset indicator */}
        {activePreset && (
          <div className={styles.activeBar}>
            <span className={styles.activePulse} />
            <span>
              <strong>{activePreset.name}</strong> is active
            </span>
            <div style={{ flex: 1 }} />
            <button className="btn-sm btn-danger" onClick={() => setActivePreset(null)}>
              Stop All
            </button>
          </div>
        )}

        <h3 className={styles.sectionTitle}>Libraries</h3>
        <div className={styles.grid}>
          {Object.entries(LIBRARY_CATEGORIES).map(([key, cat]) => (
            <button key={key} className={styles.card} onClick={() => setView(key)}>
              <span className={styles.cardIcon}>
                <FontAwesomeIcon icon={SOUND_ICONS[key]} />
              </span>
              <div className={styles.cardBody}>
                <span className={styles.cardTitle}>{cat.label}</span>
                <span className={styles.cardDesc}>{cat.desc}</span>
              </div>
            </button>
          ))}
        </div>

        <h3 className={styles.sectionTitle}>Presets & Mixer</h3>
        <div className={styles.grid}>
          <button className={styles.card} onClick={() => setView("presets")}>
            <span className={styles.cardIcon}>
              <FontAwesomeIcon icon={SOUND_ICONS.bundles} />
            </span>
            <div className={styles.cardBody}>
              <span className={styles.cardTitle}>Scene Presets</span>
              <span className={styles.cardDesc}>
                Pre-built scenes — dungeon, town, battle. Activate to start the mixer with layered audio.
              </span>
            </div>
          </button>
        </div>
      </div>

      <LiveMixer activePreset={activePreset} onDeactivate={() => setActivePreset(null)} />
    </>
  );
}
