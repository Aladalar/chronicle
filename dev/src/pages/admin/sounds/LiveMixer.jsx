import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ACTION_ICONS, SOUND_ICONS } from "@/components/icons";
import { GLOBAL_DEFAULTS } from "./soundSchema";
import styles from "./LiveMixer.module.css";

// This is a UI-only component for now. No actual audio playback — just state management
// and visual controls. Web Audio API integration comes when files are on disk.

export default function LiveMixer({ activePreset, onDeactivate }) {
  const [masterVol, setMasterVol] = useState(GLOBAL_DEFAULTS.masterVolume);
  const [musicPlaying, setMusicPlaying] = useState(true);
  const [musicVol, setMusicVol] = useState(activePreset?.musicTrack?.volume ?? 80);
  const [ambientStates, setAmbientStates] = useState(() =>
    (activePreset?.ambientLayers || []).map((l) => ({ ...l, playing: true }))
  );
  const [soundStates, setSoundStates] = useState(() =>
    (activePreset?.soundButtons || []).map((l) => ({ ...l, playing: false }))
  );

  if (!activePreset) return null;

  const toggleAmbient = (idx) => {
    setAmbientStates((s) => s.map((a, i) => i === idx ? { ...a, playing: !a.playing } : a));
  };

  const setAmbientVol = (idx, vol) => {
    setAmbientStates((s) => s.map((a, i) => i === idx ? { ...a, volume: vol } : a));
  };

  const toggleSound = (idx) => {
    setSoundStates((s) => s.map((a, i) => i === idx ? { ...a, playing: !a.playing } : a));
  };

  return (
    <div className={styles.mixer}>
      {/* Header */}
      <div className={styles.mixerHead}>
        <span className={styles.presetName}>
          <FontAwesomeIcon icon={ACTION_ICONS.play} className={styles.pulseIcon} />
          {activePreset.name}
        </span>
        <div className={styles.masterControl}>
          <FontAwesomeIcon icon={SOUND_ICONS.sounds} />
          <input type="range" min="0" max="100" value={masterVol} onChange={(e) => setMasterVol(Number(e.target.value))} className={styles.masterSlider} />
          <span className={styles.volLabel}>{masterVol}%</span>
        </div>
        <button className="btn-sm btn-danger" onClick={onDeactivate}>
          <FontAwesomeIcon icon={ACTION_ICONS.stop} /> Stop All
        </button>
      </div>

      <div className={styles.mixerBody}>
        {/* Music */}
        {activePreset.musicTrack && (
          <div className={styles.channel} data-type="music">
            <div className={styles.channelHead}>
              <FontAwesomeIcon icon={SOUND_ICONS.music} />
              <span className={styles.channelLabel}>Music</span>
            </div>
            <span className={styles.trackName}>{activePreset.musicTrack.trackName || "—"}</span>
            <div className={styles.channelControls}>
              <button
                className={styles.playBtn}
                data-playing={musicPlaying}
                onClick={() => setMusicPlaying(!musicPlaying)}
              >
                <FontAwesomeIcon icon={musicPlaying ? ACTION_ICONS.pause : ACTION_ICONS.play} />
              </button>
              <input type="range" min="0" max="100" value={musicVol}
                onChange={(e) => setMusicVol(Number(e.target.value))} className={styles.volSlider} />
              <span className={styles.volLabel}>{musicVol}%</span>
            </div>
          </div>
        )}

        {/* Ambient channels */}
        {ambientStates.map((a, i) => (
          <div key={i} className={styles.channel} data-type="ambient">
            <div className={styles.channelHead}>
              <FontAwesomeIcon icon={SOUND_ICONS.ambient} />
              <span className={styles.channelLabel}>{a.trackName || `Ambient ${i + 1}`}</span>
            </div>
            <div className={styles.channelControls}>
              <button
                className={styles.playBtn}
                data-playing={a.playing}
                onClick={() => toggleAmbient(i)}
              >
                <FontAwesomeIcon icon={a.playing ? ACTION_ICONS.pause : ACTION_ICONS.play} />
              </button>
              <input type="range" min="0" max="100" value={a.volume ?? 80}
                onChange={(e) => setAmbientVol(i, Number(e.target.value))} className={styles.volSlider} />
              <span className={styles.volLabel}>{a.volume ?? 80}%</span>
              {a.loop === "yes" && a.loopDelay > 0 && (
                <span className={styles.loopBadge}>⟳ {a.loopDelay}s</span>
              )}
            </div>
          </div>
        ))}

        {/* Sound buttons */}
        {soundStates.length > 0 && (
          <div className={styles.soundGrid}>
            {soundStates.map((s, i) => (
              <button
                key={i}
                className={styles.soundBtn}
                data-playing={s.playing}
                onClick={() => toggleSound(i)}
              >
                <FontAwesomeIcon icon={s.playing ? ACTION_ICONS.stop : ACTION_ICONS.play} />
                <span>{s.trackName || `Sound ${i + 1}`}</span>
                {s.loop === "yes" && <span className={styles.loopDot} title={`Loop every ${s.loopDelay || 0}s`}>⟳</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
