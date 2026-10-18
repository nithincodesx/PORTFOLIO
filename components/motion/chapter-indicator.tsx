"use client";

export type ChapterIndicatorItem = {
  id: string;
  label: string;
};

export type ChapterIndicatorProps = {
  items: ChapterIndicatorItem[];
  activeId: string | null;
  onSelect?: (id: string) => void;
};

export function ChapterIndicator({ items, activeId, onSelect }: ChapterIndicatorProps) {
  if (items.length === 0) return null;

  return (
    <>
      <style>{`
        .chapter-indicator {
          --chapter-amber: #f5a623;
          --chapter-muted: rgba(255, 255, 255, 0.48);
          --chapter-line: rgba(255, 255, 255, 0.16);
          position: fixed;
          top: 50%;
          right: clamp(1rem, 3.2vw, 3.5rem);
          z-index: 40;
          display: none;
          width: min(12rem, 14vw);
          min-width: 8rem;
          flex-direction: column;
          gap: 0.8rem;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .chapter-indicator__caption {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.55rem;
          padding-right: 0.8rem;
          color: rgba(255, 255, 255, 0.55);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.52rem;
          letter-spacing: 0.24em;
          line-height: 1;
          text-transform: uppercase;
        }

        .chapter-indicator__caption::before {
          width: 1.8rem;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.38)
          );
          content: '';
        }

        .chapter-indicator__list {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          margin: 0;
          padding: 0.35rem 0;
          border-inline-end: 1px solid var(--chapter-line);
          list-style: none;
          pointer-events: auto;
        }

        .chapter-indicator__item {
          margin: 0;
          padding: 0;
        }

        .chapter-indicator__link {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.65rem;
          min-height: 1.7rem;
          padding: 0.2rem 0.8rem 0.2rem 0.4rem;
          color: var(--chapter-muted);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.58rem;
          font-weight: 500;
          letter-spacing: 0.09em;
          line-height: 1.2;
          text-align: right;
          text-decoration: none;
          text-transform: uppercase;
          transition: color 220ms ease, background-color 220ms ease;
        }

        .chapter-indicator__label {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .chapter-indicator__marker {
          display: inline-flex;
          flex: 0 0 1.35rem;
          align-items: center;
          justify-content: center;
          width: 1.35rem;
          height: 1.35rem;
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 50%;
          color: inherit;
          font-size: 0.5rem;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.02em;
          line-height: 1;
          transition: background-color 220ms ease, border-color 220ms ease,
            box-shadow 220ms ease, color 220ms ease, transform 220ms ease;
        }

        .chapter-indicator__link:hover,
        .chapter-indicator__link:focus-visible,
        .chapter-indicator__link[data-active='true'] {
          color: var(--chapter-amber);
        }

        .chapter-indicator__link:hover .chapter-indicator__marker,
        .chapter-indicator__link:focus-visible .chapter-indicator__marker,
        .chapter-indicator__link[data-active='true'] .chapter-indicator__marker {
          border-color: var(--chapter-amber);
        }

        .chapter-indicator__link[data-active='true'] {
          color: var(--chapter-amber);
          font-size: 0.66rem;
          font-weight: 600;
          letter-spacing: 0.13em;
        }

        .chapter-indicator__link[data-active='true'] .chapter-indicator__marker {
          background: var(--chapter-amber);
          color: #0c0c0c;
          box-shadow: 0 0 0 0.2rem rgba(245, 166, 35, 0.12),
            0 0 1rem rgba(245, 166, 35, 0.18);
          transform: scale(1.15);
        }

        .chapter-indicator__link:focus-visible {
          border-radius: 0.2rem;
          outline: 1px solid rgba(245, 166, 35, 0.9);
          outline-offset: 0.25rem;
        }

        @media (pointer: fine) and (min-width: 1100px) {
          .chapter-indicator {
            display: flex;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .chapter-indicator__link,
          .chapter-indicator__marker {
            transition: none;
          }
        }
      `}</style>

      <nav className="chapter-indicator" aria-label="Chapter navigation">
        <span className="chapter-indicator__caption" aria-hidden="true">
          Index
        </span>
        <ol className="chapter-indicator__list">
          {items.map((item, index) => {
            const isActive = activeId === item.id;

            return (
              <li className="chapter-indicator__item" key={item.id}>
                <a
                  className="chapter-indicator__link"
                  href={`#${item.id}`}
                  data-active={isActive}
                  aria-label={`Chapter ${index + 1}: ${item.label}`}
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => onSelect?.(item.id)}
                >
                  <span className="chapter-indicator__label">{item.label}</span>
                  <span className="chapter-indicator__marker" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
