"use client";

export type AmbientScanProps = {
  className?: string;
};

export function AmbientScan({ className }: AmbientScanProps) {
  return (
    <>
      <style>{`
        .ambient-scan {
          --ambient-scan-color: var(--amber, #f5a623);
          position: relative;
          display: block;
          width: min(8rem, 100%);
          height: 2rem;
          overflow: hidden;
          color: var(--ambient-scan-color);
          pointer-events: none;
          isolation: isolate;
        }

        .ambient-scan::before,
        .ambient-scan::after,
        .ambient-scan__orbit,
        .ambient-scan__signal {
          position: absolute;
          content: '';
          pointer-events: none;
        }

        .ambient-scan::before {
          top: 50%;
          right: 0;
          left: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            color-mix(in srgb, currentColor 28%, transparent) 20%,
            color-mix(in srgb, currentColor 72%, transparent) 50%,
            color-mix(in srgb, currentColor 28%, transparent) 80%,
            transparent
          );
          opacity: 0.55;
          transform: translateY(-50%);
        }

        .ambient-scan::after {
          top: 0;
          bottom: 0;
          left: -30%;
          width: 34%;
          background: linear-gradient(
            90deg,
            transparent,
            color-mix(in srgb, currentColor 58%, transparent),
            transparent
          );
          filter: blur(0.35rem);
          opacity: 0.5;
          animation: ambient-scan-sweep 4.8s ease-in-out infinite;
        }

        .ambient-scan__orbit {
          top: 0.35rem;
          left: 50%;
          width: 2.5rem;
          height: 1.3rem;
          border: 1px solid color-mix(in srgb, currentColor 42%, transparent);
          border-radius: 50%;
          opacity: 0.7;
          transform: translateX(-50%) rotate(-18deg);
          animation: ambient-scan-orbit 6s ease-in-out infinite;
        }

        .ambient-scan__signal {
          top: calc(50% - 0.14rem);
          left: calc(50% - 0.14rem);
          width: 0.28rem;
          height: 0.28rem;
          border-radius: 50%;
          background: currentColor;
          box-shadow: 0 0 0.8rem color-mix(in srgb, currentColor 80%, transparent);
          animation: ambient-scan-signal 6s linear infinite;
        }

        @keyframes ambient-scan-sweep {
          0%,
          12% {
            transform: translateX(0);
          }
          72%,
          100% {
            transform: translateX(390%);
          }
        }

        @keyframes ambient-scan-orbit {
          0%,
          100% {
            opacity: 0.42;
            transform: translateX(-50%) rotate(-18deg) scale(0.96);
          }
          50% {
            opacity: 0.82;
            transform: translateX(-50%) rotate(-18deg) scale(1.04);
          }
        }

        @keyframes ambient-scan-signal {
          from {
            transform: rotate(0deg) translateX(1.25rem);
          }
          to {
            transform: rotate(360deg) translateX(1.25rem);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ambient-scan::after,
          .ambient-scan__orbit,
          .ambient-scan__signal {
            animation: none;
          }
        }
      `}</style>

      <span
        aria-hidden="true"
        className={className ? `ambient-scan ${className}` : "ambient-scan"}
      >
        <span className="ambient-scan__orbit" />
        <span className="ambient-scan__signal" />
      </span>
    </>
  );
}
