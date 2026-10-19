"use client";

import { Pause, Play, Repeat, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { useSiteConfig } from "@/components/cms/site-config-provider";

/* BACKGROUND MUSIC PLAYER — in-flow bar at the very end of the page.
   Autoplays on load; if the browser blocks audible autoplay, it unlocks
   on the visitor's first click / tap / key / scroll.
   Track, volume, loop, and autoplay are editable in /control → Music. */

export function MusicPlayer() {
  const pathname = usePathname();
  const { config } = useSiteConfig();
  const music = config.music;

  const audioRef = useRef<HTMLAudioElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(music.defaultVolume);
  const [muted, setMuted] = useState(false);
  const [loopOn, setLoopOn] = useState(music.loop);
  const [volumeTouched, setVolumeTouched] = useState(false);

  const startPlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      /* Muted playback is never blocked — this is what lets music start
         together with the loader even before any user gesture. */
      const wasMuted = audio.muted;
      audio.muted = true;
      await audio.play();
      audio.muted = wasMuted;
      setPlaying(true);
    } catch {
      /* Still blocked — stays paused until a gesture unlocks it. */
    }
  }, []);

  const startAudible = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.muted = false;
      setMuted(false);
      await audio.play();
      setPlaying(true);
    } catch {
      /* blocked — unlock listeners will retry on next gesture */
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
    audio.muted = true;
    setMuted(true);
    /* Start together with the words loader (muted autoplay always succeeds).
       First real gesture unmutes to audible. */
    const onIntroStart = () => startPlayback();
    const onFirstGesture = () => startAudible();
    window.addEventListener("words-intro-start", onIntroStart);
    if (music.autoplay) {
      window.addEventListener("pointerdown", onFirstGesture);
      window.addEventListener("touchstart", onFirstGesture);
      window.addEventListener("keydown", onFirstGesture);
      window.addEventListener("wheel", onFirstGesture, { passive: true });
    }
    const poll = window.setInterval(check, 400);
    const stop = window.setTimeout(() => window.clearInterval(poll), 8000);
    return () => {
      cancelled = true;
      audio.removeEventListener("error", fail);
      window.removeEventListener("words-intro-start", onIntroStart);
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      window.removeEventListener("wheel", onFirstGesture);
      window.clearInterval(poll);
      window.clearTimeout(stop);
    };
  }, [startPlayback, startAudible, music.autoplay, music.defaultVolume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = loopOn;
    audio.volume = muted ? 0 : volume;
  }, [loopOn, volume, muted]);

  /* Apply admin-configured defaults until the visitor touches the controls. */
  useEffect(() => {
    if (volumeTouched) return;
    setVolume(music.defaultVolume);
    setLoopOn(music.loop);
  }, [music.defaultVolume, music.loop, volumeTouched]);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (audio.paused) { await startPlayback(); }
      else { audio.pause(); setPlaying(false); }
    } catch { /* blocked — unlock listeners will retry on next gesture */ }
  }, [startPlayback]);

  /* No music bar on the admin panel; respect the "enabled" toggle too. */
  if (pathname.startsWith("/control") || !music.enabled || unavailable) return null;

  return (
    <aside className={`mp-wrap${playing ? " is-playing" : ""}`} aria-label="Ambient music player">
      <style>{`
  .mp-wrap { border-top: 1px solid rgba(255,255,255,0.08); background: #0C0C0C; }
  .mp-bar { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 2rem; }
  .mp-btn { display: inline-flex; align-items: center; justify-content: center; border: 0; background: transparent; color: #fff; cursor: pointer; border-radius: 999px; transition: color 0.25s ease, transform 0.25s ease; }
  .mp-play { width: 30px; height: 30px; flex: 0 0 30px; background: ${config.theme.accent}; color: #0C0C0C; }
  .mp-play:hover { transform: scale(1.07); }
  .mp-mute { width: 22px; height: 22px; flex: 0 0 22px; }
  .mp-mute:hover { color: ${config.theme.accent}; }
  .mp-loop { width: 22px; height: 22px; flex: 0 0 22px; }
  .mp-loop[aria-pressed="true"] { color: ${config.theme.accent}; }
  .mp-loop[aria-pressed="false"] { color: rgba(255, 255, 255, 0.3); }
  .mp-eq { display: inline-flex; align-items: flex-end; gap: 2px; height: 12px; }
  .mp-eq i { width: 2px; height: 3px; border-radius: 1px; background: rgba(255,255,255,0.3); }
  .is-playing .mp-eq i { background: ${config.theme.accent}; animation: mp-eq 1.05s ease-in-out infinite; }
  @keyframes mp-eq { 0%, 100% { height: 3px; } 50% { height: 12px; } }
  .mp-label { font-size: 0.58rem; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.58); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: auto; }
  .is-playing .mp-label { color: ${config.theme.accent}; }
  .mp-divider { width: 1px; height: 14px; background: rgba(255,255,255,0.10); flex: 0 0 1px; }
  .mp-range { -webkit-appearance: none; appearance: none; width: 72px; height: 2px; border: 0; border-radius: 2px; background: rgba(255,255,255,0.18); cursor: pointer; }
  .mp-range::-webkit-slider-thumb { -webkit-appearance: none; width: 8px; height: 8px; border-radius: 50%; background: ${config.theme.accent}; cursor: pointer; }
  .mp-range::-moz-range-thumb { width: 8px; height: 8px; border: 0; border-radius: 50%; background: ${config.theme.accent}; cursor: pointer; }
      `}</style>
      <audio ref={audioRef} src={music.src} preload="auto" onError={() => setUnavailable(true)} onEnded={() => setPlaying(false)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <div className="mp-bar">
        <button type="button" className="mp-btn mp-play" onClick={toggle} aria-label={playing ? "Pause music" : "Play music"}>
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <span className="mp-eq" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="mp-label">{playing ? `Now playing — ${music.label}` : "Play ambient music"}</span>
        <span className="mp-divider" aria-hidden="true" />
        <button type="button" className="mp-btn mp-mute" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"}>
          {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>
        <input type="range" className="mp-range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
          onChange={(e) => { setVolumeTouched(true); setVolume(Number(e.target.value)); setMuted(false); }} aria-label="Volume" />
        <button type="button" className="mp-btn mp-loop" onClick={() => setLoopOn((v) => !v)} aria-pressed={loopOn} aria-label="Toggle loop">
          <Repeat size={13} />
        </button>
      </div>
    </aside>
  );
}
