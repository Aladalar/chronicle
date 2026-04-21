// dev/src/pages/admin/sounds/SoundPlayer.jsx
import { useEffect, useRef, useState } from "react";
import styles from "./SoundPlayer.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function SoundPlayer({ track, onClose }) {
  const audioRef    = useRef(null);
  const shouldPlay  = useRef(false);
  const loopTimer   = useRef(null);

  const [playing,  setPlaying]  = useState(false);
  const [volume,   setVolume]   = useState(80);
  const [elapsed,  setElapsed]  = useState(0);
  const [duration, setDuration] = useState(0);
  const [error,    setError]    = useState(null);
  const [currentFile, setCurrentFile] = useState(null);

  // Track changed — reset everything
  useEffect(() => {
    clearLoopTimer();
    if (!track) { stopAudio(); return; }
    setError(null);
    setElapsed(0);
    setDuration(0);
    setPlaying(false);
    shouldPlay.current = false;
    setCurrentFile(null); // clear so next pick triggers effect
  }, [track]);

  // currentFile changed — load it, play if shouldPlay
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentFile) return;

    setError(null);
    const url = `${API_BASE}/api/v1/sounds/file/${currentFile.split("/").map(encodeURIComponent).join("/")}`;
    audio.src = url;
    audio.volume = volume / 100;

    function onCanPlay() {
      if (shouldPlay.current) {
        audio.play()
          .then(() => setPlaying(true))
          .catch((e) => setError(e.message));
      }
    }
    function onError() {
      setError(`Cannot load: ${currentFile.split("/").pop()}`);
      setPlaying(false);
    }

    audio.addEventListener("canplay", onCanPlay, { once: true });
    audio.addEventListener("error",   onError,   { once: true });
    audio.load();

    return () => {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error",   onError);
    };
  }, [currentFile]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  function clearLoopTimer() {
    if (loopTimer.current) { clearTimeout(loopTimer.current); loopTimer.current = null; }
  }

  function pickRandom(t) {
    if (!t) return null;
    const pool = t.variants?.length > 1 ? t.variants : (t.path ? [t.path] : null);
    if (!pool) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function stopAudio() {
    clearLoopTimer();
    const audio = audioRef.current;
    if (!audio) return;
    shouldPlay.current = false;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    setPlaying(false);
    setElapsed(0);
    setDuration(0);
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !track) return;

    if (playing) {
      clearLoopTimer();
      shouldPlay.current = false;
      audio.pause();
      setPlaying(false);
    } else {
      shouldPlay.current = true;
      const file = pickRandom(track);
      if (!file) return;
      // If same file already loaded, play directly
      if (currentFile === file && audio.readyState >= 2) {
        audio.play()
          .then(() => setPlaying(true))
          .catch((e) => setError(e.message));
      } else {
        setCurrentFile(file);
      }
    }
  }

  function stop() {
    clearLoopTimer();
    const audio = audioRef.current;
    if (!audio) return;
    shouldPlay.current = false;
    audio.pause();
    audio.currentTime = 0;
    setPlaying(false);
    setElapsed(0);
  }

  function handleEnded() {
    setPlaying(false);
    setElapsed(0);

    if (!track || !shouldPlay.current) return;

    // loop = "yes" — pick next variant after loopDelay
    if (track.loop === "yes") {
      const delay = (track.loopDelay || 0) * 1000;
      loopTimer.current = setTimeout(() => {
        if (!shouldPlay.current) return;
        const next = pickRandom(track);
        if (!next) return;
        setCurrentFile(next); // triggers load+play via shouldPlay flag
      }, delay);
    } else {
      shouldPlay.current = false;
    }
  }

  function handleClose() { stopAudio(); onClose(); }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio) return;
    setElapsed(audio.currentTime);
    if (audio.duration && !isNaN(audio.duration)) setDuration(audio.duration);
  }

  function handleSeek(e) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const t = ((e.clientX - rect.left) / rect.width) * duration;
    audio.currentTime = t;
    setElapsed(t);
  }

  if (!track) return null;

  const progress    = duration ? (elapsed / duration) * 100 : 0;
  const hasVariants = track.variants?.length > 1;

  return (
    <div className={styles.bar}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
      />

      <div className={styles.info}>
        <span className={styles.name}>{track.name}</span>
        {hasVariants && currentFile && (
          <span className={styles.variant}>{currentFile.split("/").pop()}</span>
        )}
        {track.loop === "yes" && (
          <span className={styles.loopBadge}>
            loop{track.loopDelay > 0 ? ` +${track.loopDelay}s` : ""}
          </span>
        )}
        {error && <span className={styles.error} title={error}>! {error}</span>}
      </div>

      <div className={styles.controls}>
        <button className={styles.btn} onClick={stop} title="Stop"><StopIcon /></button>
        <button className={`${styles.btn} ${styles.btnMain}`} onClick={togglePlay} title={playing ? "Pause" : "Play"}>
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>

      <div className={styles.progress} onClick={handleSeek}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.time}>{fmt(elapsed)} / {fmt(duration)}</div>

      <div className={styles.volumeWrap}>
        <VolumeIcon />
        <input
          type="range" min="0" max="100" value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className={styles.volumeSlider}
        />
        <span className={styles.volumeVal}>{volume}%</span>
      </div>

      <button className={styles.closeBtn} onClick={handleClose}>×</button>
    </div>
  );
}

function fmt(s) {
  if (!s || isNaN(s)) return "0:00";
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

function PlayIcon()  { return <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M3 2l11 6-11 6V2z"/></svg>; }
function PauseIcon() { return <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><rect x="3" y="2" width="4" height="12"/><rect x="9" y="2" width="4" height="12"/></svg>; }
function StopIcon()  { return <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><rect x="3" y="3" width="10" height="10"/></svg>; }
function VolumeIcon(){ return <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M3 6H1v4h2l4 3V3L3 6z"/><path d="M11 3.5a6 6 0 010 9M9 5.5a3.5 3.5 0 010 5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/></svg>; }
