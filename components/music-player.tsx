"use client";

import { Pause, Play, Repeat, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   BACKGROUND MUSIC PLAYER — in-flow bar at the very end of the page

   Rendered by app/layout.tsx after the page content and laid out in normal
   flow (never position: fixed), so it sits below the footer at the bottom of
   the document and can never overlap the site's content.

   The track is always loaded from this one path. To change the music, replace
   the file at `public/music/portfolio.mp3` — keeping the same filename — and
   nothing here needs to change.

   Autoplay is attempted once on mount. Browsers routinely block audible
   autoplay until the visitor interacts with the page, so a blocked attempt is
   expected and handled quietly: the player simply stays paused and the visitor
   can press Play. No workarounds are used to force playback.

   If the audio file is missing or unplayable, the player removes itself rather
   than showing a broken control.

   Looping defaults to ON; the repeat button toggles it.
   ───────────────────────────────────────────────────────────────────────────── */

const TRACK_SRC = "/music/portfolio.mp3";
const DEFAULT_VOLUME = 0.6;

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [unavailable, setUnavailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [muted, setMuted] = useState(false);
  const [loopOn, setLoopOn] = useState(true);
  const [loading, setLoading] = useState(false);

  /* Attempt autoplay once, on mount, and settle the "is this file usable?"
     question for good.

     Note: the <audio> element is server-rendered, so a missing file can finish
     failing *before* React hydrates — the synthetic onError prop alone would
     miss that. We therefore also listen natively and inspect the element's own
     error state, which covers both orderings. */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let cancelled = false;
    const fail = () => {
      if (!cancelled) setUnavailable(true);
    };
    const check = () => {
      if (audio.error) fail();
    };

    audio.addEventListener("error", fail);
    check();

    audio.volume = DEFAULT_VOLUME;

    const attempt = audio.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch((error: unknown) => {
        /* NotAllowedError => the browser declined autoplay. That is expected
           and harmless: stay paused and let the visitor press Play. Anything
           else means the source itself is unusable. */
        if (!(error instanceof DOMException) || error.name !== "NotAllowedError") {
          fail();
        }
        setBlocked(true);
      });
    }

    /* Media error state settles asynchronously, so keep an eye on it briefly. */
    const poll = window.setInterval(check, 400);
    const stopPolling = window.setTimeout(() => window.clearInterval(poll), 8000);

    return () => {
      cancelled = true;
      audio.removeEventListener("error", fail);
      window.clearInterval(poll);
      window.clearTimeout(stopPolling);
    };
  }, []);

  /* Mirror our state onto the media element. */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
    audio.loop = loopOn;
  }, [volume, muted, loopOn]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      const attempt = audio.play();
      if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      if (!next && volume === 0) setVolume(DEFAULT_VOLUME);
      return next;
    });
  }, [volume]);

  /* The file is missing or can't be decoded — step aside quietly. */
  if (unavailable) return null;

  const label = playing
    ? "NOW PLAYING"
    : loading
      ? "LOADING..."
      : blocked
        ? "TAP TO PLAY"
        : "PAUSED";

  return (
    <div className={`mp-root${playing ? " is-playing" : ""}`}>
      <style>{PLAYER_STYLES}</style>

      <audio
        ref={audioRef}
        src={TRACK_SRC}
        loop={loopOn}
        preload="auto"
        playsInline
        onPlay={() => {
          setPlaying(true);
          setBlocked(false);
        }}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
        onCanPlay={() => setLoading(false)}
        onPause={() => setPlaying(false)}
        onError={() => setUnavailable(true)}
      />

      <div className="mp-bar">
        <button
          type="button"
          className="mp-btn mp-play"
          onClick={togglePlay}
          aria-label={playing ? "Pause background music" : "Play background music"}
          aria-pressed={playing}
          title={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause size={13} strokeWidth={2.5} /> : <Play size={13} strokeWidth={2.5} />}
        </button>

        <span className="mp-eq" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>

        <span className="mp-label">{label}</span>

        <span className="mp-divider" aria-hidden="true" />

        <button
          type="button"
          className="mp-btn mp-loop"
          onClick={() => setLoopOn((current) => !current)}
          aria-label={loopOn ? "Disable looping" : "Enable looping"}
          aria-pressed={loopOn}
          title={loopOn ? "Looping on" : "Looping off"}
        >
          <Repeat size={13} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          className="mp-btn mp-mute"
          onClick={toggleMute}
          aria-label={muted ? "Unmute background music" : "Mute background music"}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted || volume === 0 ? (
            <VolumeX size={13} strokeWidth={2.2} />
          ) : (
            <Volume2 size={13} strokeWidth={2.2} />
          )}
        </button>

        <input
          type="range"
          className="mp-range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(event) => {
            const next = Number(event.target.value);
            setVolume(next);
            setMuted(next === 0);
          }}
          aria-label="Background music volume"
          title="Volume"
        />
      </div>
    </div>
  );
}

/* Palette matches the "Obsidian Editorial" tokens used by the portfolio:
   --bg #0C0C0C · --surface #141414 · --amber #F5A623 · --border rgba(255,255,255,.10) */
const PLAYER_STYLES = `
  .mp-root {
    position: relative;
    z-index: 1;
    background: #141414;
    border-top: 1px solid rgba(255, 255, 255, 0.10);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    -webkit-font-smoothing: antialiased;
    transition: border-top-color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .mp-root.is-playing { border-top-color: rgba(245, 166, 35, 0.32); }

  .mp-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    max-width: 1440px;
    margin: 0 auto;
    padding: 0.6rem 4rem;
  }

  .mp-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    border-radius: 999px;
    transition: color 0.25s ease, background 0.25s ease, transform 0.25s ease;
  }
  .mp-btn:focus-visible { outline: 1px solid #F5A623; outline-offset: 2px; }

  .mp-play {
    width: 30px;
    height: 30px;
    flex: 0 0 30px;
    background: #F5A623;
    color: #0C0C0C;
  }
  .mp-play:hover { transform: scale(1.07); }

  .mp-mute { width: 22px; height: 22px; flex: 0 0 22px; }
  .mp-mute:hover { color: #F5A623; }

  .mp-loop { width: 22px; height: 22px; flex: 0 0 22px; }
  .mp-loop[aria-pressed="true"] { color: #F5A623; }
  .mp-loop[aria-pressed="false"] { color: rgba(255, 255, 255, 0.3); }
  .mp-loop:hover { color: #F5A623; }

  /* Animated level meter — the "now playing" cue. */
  .mp-eq {
    display: inline-flex;
    align-items: flex-end;
    gap: 2px;
    height: 12px;
    flex: 0 0 auto;
  }
  .mp-eq i {
    width: 2px;
    height: 3px;
    border-radius: 1px;
    background: rgba(255, 255, 255, 0.3);
    transition: background 0.4s ease;
  }
  .is-playing .mp-eq i {
    background: #F5A623;
    animation: mp-eq 1.05s ease-in-out infinite;
  }
  .is-playing .mp-eq i:nth-child(2) { animation-delay: 0.18s; }
  .is-playing .mp-eq i:nth-child(3) { animation-delay: 0.36s; }
  .is-playing .mp-eq i:nth-child(4) { animation-delay: 0.52s; }

  @keyframes mp-eq {
    0%, 100% { height: 3px; }
    50%      { height: 12px; }
  }

  .mp-label {
    font-size: 0.58rem;
    line-height: 1;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.42);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: auto;
    transition: color 0.4s ease;
  }
  .is-playing .mp-label { color: #F5A623; }

  .mp-divider {
    width: 1px;
    height: 14px;
    background: rgba(255, 255, 255, 0.10);
    flex: 0 0 1px;
  }

  .mp-range {
    -webkit-appearance: none;
    appearance: none;
    width: 72px;
    height: 2px;
    border: 0;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.18);
    cursor: pointer;
    outline: none;
  }
  .mp-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 8px;
    height: 8px;
    border: 0;
    border-radius: 50%;
    background: #F5A623;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  .mp-range::-webkit-slider-thumb:hover { transform: scale(1.3); }
  .mp-range::-moz-range-thumb {
    width: 8px;
    height: 8px;
    border: 0;
    border-radius: 50%;
    background: #F5A623;
    cursor: pointer;
  }
  .mp-range::-moz-range-track {
    height: 2px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.18);
  }
  .mp-range:focus-visible { outline: 1px solid #F5A623; outline-offset: 4px; }

  @media (max-width: 900px) {
    .mp-bar { padding: 0.6rem 1.5rem; }
  }

  @media (max-width: 480px) {
    .mp-bar { gap: 0.4rem; padding: 0.55rem 1.25rem; }
    .mp-eq { display: none; }
    .mp-play { width: 28px; height: 28px; flex-basis: 28px; }
    .mp-label { font-size: 0.52rem; letter-spacing: 0.12em; }
    .mp-range { width: 52px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .is-playing .mp-eq i { animation: none; height: 7px; }
    .mp-play:hover { transform: none; }
  }
`;