"use client";

import type { CSSProperties } from "react";

export type BootSequenceProps = {
  /** Total runtime of the sequence in milliseconds. */
  duration?: number;
  /** Primary mark shown during the boot sequence. */
  mark?: string;
  /** Small system identifier shown above the progress line. */
  systemLabel?: string;
  className?: string;
};

const DEFAULT_DURATION = 900;

function getDuration(duration: number) {
  return Number.isFinite(duration) ? Math.max(1, duration) : DEFAULT_DURATION;
}

export function BootSequence({
  duration = DEFAULT_DURATION,
  mark = "NK.",
  systemLabel = "SYSTEM / 01",
  className,
}: BootSequenceProps) {
  const sequenceDuration = getDuration(duration);
  const sequenceStyle = {
    "--boot-sequence-duration": `${sequenceDuration}ms`,
  } as CSSProperties;

  return (
    <>
      <style>{`
        .boot-sequence {
          --boot-sequence-amber: #f5a623;
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          place-items: center;
          overflow: hidden;
          background: #0c0c0c;
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
           pointer-events: none;
          isolation: isolate;
          animation: boot-sequence-curtain var(--boot-sequence-duration)
            cubic-bezier(0.76, 0, 0.24, 1) both;
        }

        .boot-sequence::before,
        .boot-sequence::after {
          position: absolute;
          content: '';
          pointer-events: none;
        }

        .boot-sequence::before {
          inset: 0;
          z-index: -1;
          opacity: 0.45;
          background-image: linear-gradient(
              rgba(255, 255, 255, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.035) 1px,
              transparent 1px
            );
          background-size: 100% 25%, 25% 100%;
          mask-image: linear-gradient(to bottom, transparent, #000 24%, #000 76%, transparent);
        }

        .boot-sequence::after {
          top: 50%;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(245, 166, 35, 0.18) 22%,
            rgba(245, 166, 35, 0.18) 78%,
            transparent
          );
          opacity: 0.8;
        }

        .boot-sequence__content {
          display: grid;
          justify-items: center;
          gap: 1.15rem;
          width: min(22rem, calc(100vw - 3rem));
          text-align: center;
          animation: boot-sequence-content var(--boot-sequence-duration)
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .boot-sequence__label {
          margin: 0;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.56rem;
          letter-spacing: 0.24em;
          line-height: 1;
          text-transform: uppercase;
        }

        .boot-sequence__mark {
          margin: 0;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: clamp(4rem, 11vw, 7rem);
          font-weight: 700;
          letter-spacing: -0.08em;
          line-height: 0.8;
        }

        .boot-sequence__status {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          margin: 0;
          color: rgba(255, 255, 255, 0.42);
          font-size: 0.52rem;
          letter-spacing: 0.17em;
          line-height: 1;
          text-transform: uppercase;
        }

        .boot-sequence__status::before {
          width: 0.3rem;
          height: 0.3rem;
          border-radius: 50%;
          background: var(--boot-sequence-amber);
          box-shadow: 0 0 0.65rem rgba(245, 166, 35, 0.7);
          content: '';
        }

        .boot-sequence__progress-track {
          width: min(17rem, 100%);
          height: 1px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.14);
        }

        .boot-sequence__progress {
          width: 100%;
          height: 100%;
          background: var(--boot-sequence-amber);
          box-shadow: 0 0 0.8rem rgba(245, 166, 35, 0.75);
          transform: scaleX(0);
          transform-origin: left center;
          animation: boot-sequence-progress var(--boot-sequence-duration)
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes boot-sequence-progress {
          0% {
            transform: scaleX(0);
          }
          72% {
            transform: scaleX(1);
          }
          100% {
            transform: scaleX(1);
          }
        }

        @keyframes boot-sequence-content {
          0%,
          68% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-0.5rem);
          }
        }

        @keyframes boot-sequence-curtain {
          0%,
          72% {
            clip-path: inset(0 0 0 0);
          }
          100% {
            clip-path: inset(0 0 100% 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .boot-sequence {
            display: none;
          }
        }
      `}</style>

      <div
        aria-hidden="true"
        className={className ? `boot-sequence ${className}` : "boot-sequence"}
        style={sequenceStyle}
      >
        <div className="boot-sequence__content">
          <p className="boot-sequence__label">{systemLabel}</p>
          <p className="boot-sequence__mark">{mark}</p>
          <p className="boot-sequence__status">Loading intelligence layer</p>
          <div className="boot-sequence__progress-track">
            <div className="boot-sequence__progress" />
          </div>
        </div>
      </div>
    </>
  );
}
