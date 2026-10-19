"use client";

import type { CSSProperties, ReactNode } from "react";

export type WordsPreloaderProps = {
  children?: ReactNode;
  className?: string;
  duration?: number;
  words?: string[];
};

const DEFAULT_WORDS = ["ഹലോ", "HELLO", "AI", "SYSTEMS", "NK."];

export function WordsPreloader({
  children,
  className,
  duration = 2200,
  words = DEFAULT_WORDS,
}: WordsPreloaderProps) {
  const safeDuration = Number.isFinite(duration) ? Math.max(900, duration) : 2200;
  const style = { "--words-duration": `${safeDuration}ms` } as CSSProperties;

  return (
    <>
      <style>{`
        .words-preloader {
          --preloader-amber: #f5a623;
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          place-items: center;
          overflow: hidden;
          background: #0c0c0c;
          color: #fff;
          pointer-events: none;
          isolation: isolate;
          animation: words-preloader-exit var(--words-duration)
            cubic-bezier(0.76, 0, 0.24, 1) both;
        }

        .words-preloader::before {
          position: absolute;
          inset: 0;
          z-index: -1;
          background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 4rem 4rem;
          content: '';
          mask-image: linear-gradient(to bottom, transparent, #000 25%, #000 75%, transparent);
        }

        .words-preloader__content {
          display: grid;
          justify-items: center;
          gap: 1.1rem;
          width: min(28rem, calc(100vw - 3rem));
          text-align: center;
          animation: words-preloader-content var(--words-duration)
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .words-preloader__label,
        .words-preloader__status {
          margin: 0;
          color: rgba(255,255,255,0.54);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.56rem;
          letter-spacing: 0.2em;
          line-height: 1;
          text-transform: uppercase;
        }

        .words-preloader__window {
          position: relative;
          width: 100%;
          height: clamp(5.5rem, 16vw, 9rem);
          overflow: hidden;
        }

        .words-preloader__word {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          margin: 0;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: clamp(3rem, 10vw, 7rem);
          font-weight: 800;
          letter-spacing: -0.08em;
          line-height: 0.9;
          opacity: 0;
          transform: translateY(110%);
          animation: words-preloader-word var(--words-duration) cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: var(--word-delay);
        }

        .words-preloader__word:first-child { color: var(--preloader-amber); }
        .words-preloader__word:nth-child(2) { color: rgba(255,255,255,0.72); }
        .words-preloader__word:nth-child(3) { color: var(--preloader-amber); }
        .words-preloader__word:nth-child(4) { color: #fff; }

        .words-preloader__status {
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }

        .words-preloader__status::before {
          width: 0.35rem;
          height: 0.35rem;
          border-radius: 50%;
          background: var(--preloader-amber);
          box-shadow: 0 0 0.75rem rgba(245,166,35,0.75);
          content: '';
        }

        .words-preloader__track {
          width: min(18rem, 100%);
          height: 1px;
          overflow: hidden;
          background: rgba(255,255,255,0.16);
        }

        .words-preloader__progress {
          width: 100%;
          height: 100%;
          background: var(--preloader-amber);
          box-shadow: 0 0 0.9rem rgba(245,166,35,0.8);
          transform: scaleX(0);
          transform-origin: left;
          animation: words-preloader-progress var(--words-duration) cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes words-preloader-word {
          0%, 8% { opacity: 0; transform: translateY(110%); }
          15%, 28% { opacity: 1; transform: translateY(0); }
          36%, 100% { opacity: 0; transform: translateY(-110%); }
        }

        @keyframes words-preloader-progress {
          0% { transform: scaleX(0); }
          78%, 100% { transform: scaleX(1); }
        }

        @keyframes words-preloader-content {
          0%, 70% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-0.5rem); }
        }

        @keyframes words-preloader-exit {
          0%, 76% { clip-path: inset(0); }
          100% { clip-path: inset(0 0 100% 0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .words-preloader { display: none; }
        }
      `}</style>

      <div
        aria-hidden="true"
        className={className ? `words-preloader ${className}` : "words-preloader"}
        style={style}
      >
        <div className="words-preloader__content">
          <p className="words-preloader__label">NITHIN KRISHNA / PORTFOLIO</p>
          <div className="words-preloader__window">
            {words.map((word, index) => (
              <p
                className="words-preloader__word"
                key={`${word}-${index}`}
                style={{ "--word-delay": `${index * (safeDuration / Math.max(words.length, 1))}ms` } as CSSProperties}
              >
                {word}
              </p>
            ))}
          </div>
          <p className="words-preloader__status">Loading intelligence layer</p>
          <div className="words-preloader__track">
            <div className="words-preloader__progress" />
          </div>
          {children}
        </div>
      </div>
    </>
  );
}
