"use client";

import { Pause, Play, Repeat, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/* BACKGROUND MUSIC PLAYER — in-flow bar at the very end of the page.
   Autoplays on load; if the browser blocks audible autoplay, it unlocks
   on the visitor's first click / tap / key / scroll. */

const TRACK_SRC = "/music/portfolio.mp3";
const DEFAULT_VOLUME = 0.6;

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [muted, setMuted] = useState(false);
  const [loopOn, setLoopOn] = useState(true);

  const startPlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      /* Still blocked — stays paused until a gesture unlocks it. */
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let cancelled = false;
    const fail = () => { if (!cancelled) setUnavailable(true); };
    const check = () => { if (audio.error) fail(); };
    audio.addEventListener("error", fail);
    check();
    audio.volume = DEFAULT_VOLUME;
    /* Autoplay on load. If the browser blocks audible autoplay, unlock on
       the very first gesture (click / tap / key / scroll). */
    startPlayback();
    const unlock = () => startPlayback();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("touchstart", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("wheel", unlock, { passive: true });
    const poll = window.setInterval(check, 400);
    const stop = window.setTimeout(() => window.clearInterval(poll), 8000);
    return () => { cancelled = true; audio.removeEventListener("error", fail); window.removeEventListener("pointerdown", unlock); window.removeEventListener("touchstart", unlock); window.removeEventListener("keydown", unlock); window.removeEventListener("wheel", unlock); window.clearInterval(poll); window.clearTimeout(stop); };
  }, [startPlayback]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = loopOn;
    audio.volume = muted ? 0 : volume;
  }, [loopOn, volume, muted]);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (audio.paused) { await startPlayback(); }
      else { audio.pause(); setPlaying(false); }
    } catch { /* blocked — unlock listeners will retry on next gesture */ }
  }, [startPlayback]);

  if (unavailable) return null;

  return (
    <div className={`mp-wrap${playing ? " is-playing" : ""}`}>
      <style>{`
  .mp-wrap { border-top: 1px solid rgba(255,255,255,0.08); background: #0C0C0C; }
  .mp-bar { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 2rem; }
  .mp-btn { display: inline-flex; align-items: center; justify-content: center; border: 0; background: transparent; color: #fff; cursor: pointer; border-radius: 999px; transition: color 0.25s ease, transform 0.25s ease; }
  .mp-play { width: 30px; height: 30px; flex: 0 0 30px; background: #F5A623; color: #0C0C0C; }
  .mp-play:hover { transform: scale(1.07); }
  .mp-mute { width: 22px; height: 22px; flex: 0 0 22px; }
  .mp-mute:hover { color: #F5A623; }
  .mp-loop { width: 22px; height: 22px; flex: 0 0 22px; }
  .mp-loop[aria-pressed="true"] { color: #F5A623; }
  .mp-loop[aria-pressed="false"] { color: rgba(255, 255, 255, 0.3); }
  .mp-eq { display: inline-flex; align-items: flex-end; gap: 2px; height: 12px; }
  .mp-eq i { width: 2px; height: 3px; border-radius: 1px; background: rgba(255,255,255,0.3); }
  .is-playing .mp-eq i { background: #F5A623; animation: mp-eq 1.05s ease-in-out infinite; }
  @keyframes mp-eq { 0%, 100% { height: 3px; } 50% { height: 12px; } }
  .mp-label { font-size: 0.58rem; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.42); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: auto; }
  .is-playing .mp-label { color: #F5A623; }
  .mp-divider { width: 1px; height: 14px; background: rgba(255,255,255,0.10); flex: 0 0 1px; }
  .mp-range { -webkit-appearance: none; appearance: none; width: 72px; height: 2px; border: 0; border-radius: 2px; background: rgba(255,255,255,0.18); cursor: pointer; }
  .mp-range::-webkit-slider-thumb { -webkit-appearance: none; width: 8px; height: 8px; border-radius: 50%; background: #F5A623; cursor: pointer; }
  .mp-range::-moz-range-thumb { width: 8px; height: 8px; border: 0; border-radius: 50%; background: #F5A623; cursor: pointer; }
      `}</style>
      <audio ref={audioRef} src={TRACK_SRC} preload="auto" autoPlay onError={() => setUnavailable(true)} onEnded={() => setPlaying(false)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <div className="mp-bar">
        <button type="button" className="mp-btn mp-play" onClick={toggle} aria-label={playing ? "Pause music" : "Play music"}>
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <span className="mp-eq" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="mp-label">{playing ? "Now playing — portfolio.mp3" : "Play ambient music"}</span>
        <span className="mp-divider" aria-hidden="true" />
        <button type="button" className="mp-btn mp-mute" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"}>
          {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>
        <input type="range" className="mp-range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
          onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }} aria-label="Volume" />
        <button type="button" className="mp-btn mp-loop" onClick={() => setLoopOn((v) => !v)} aria-pressed={loopOn} aria-label="Toggle loop">
          <Repeat size={13} />
        </button>
      </div>
    </div>
  );
}
