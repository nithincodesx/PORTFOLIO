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
          --chapter-ink: rgba(255, 255, 255, 0.48);
          --chapter-line: rgba(255, 255, 255, 0.14);
          position: fixed;
          top: 50%;
          right: clamp(1rem, 2.8vw, 2.75rem);
          z-index: 40;
          display: none;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.7rem;
          transform: translateY(-50%);
          color: var(--chapter-ink);
          pointer-events: none;
        }

        .chapter-indicator__caption {
          padding-right: 0.9rem;
           color: rgba(255, 255, 255, 0.55);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.56rem;
          letter-spacing: 0.18em;
          line-height: 1;
          text-transform: uppercase;
        }

        .chapter-indicator__list {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          margin: 0;
          padding: 0.3rem 0;
          border-inline-end: 1px solid var(--chapter-line);
          list-style: none;
          pointer-events: auto;
        }

        .chapter-indicator__item {
          margin: 0;
          padding: 0;
        }

        .chapter-indicator__link {
          display: grid;
          grid-template-columns: minmax(4rem, auto) 0.45rem;
          align-items: center;
          gap: 0.7rem;
          min-height: 1.8rem;
          padding: 0.2rem 0.85rem 0.2rem 0.8rem;
          color: var(--chapter-ink);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          line-height: 1.2;
          text-align: right;
          text-decoration: none;
          text-transform: uppercase;
          transition: color 220ms ease, opacity 220ms ease;
        }

        .chapter-indicator__label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .chapter-indicator__marker {
          width: 0.4rem;
          height: 0.4rem;
          border: 1px solid currentColor;
          border-radius: 50%;
          opacity: 0.65;
          transition: background-color 220ms ease, border-color 220ms ease,
            box-shadow 220ms ease, opacity 220ms ease, transform 220ms ease;
        }

        .chapter-indicator__link:hover,
        .chapter-indicator__link:focus-visible,
        .chapter-indicator__link[data-active='true'] {
          color: var(--chapter-amber);
          outline: none;
        }

        .chapter-indicator__link:hover .chapter-indicator__marker,
        .chapter-indicator__link:focus-visible .chapter-indicator__marker,
        .chapter-indicator__link[data-active='true'] .chapter-indicator__marker {
          border-color: var(--chapter-amber);
          opacity: 1;
        }

        .chapter-indicator__link[data-active='true'] .chapter-indicator__marker {
          background: var(--chapter-amber);
          box-shadow: 0 0 0 0.2rem rgba(245, 166, 35, 0.12);
          transform: scale(1.15);
        }

        .chapter-indicator__link:focus-visible {
          border-radius: 0.2rem;
          box-shadow: 0 0 0 2px rgba(245, 166, 35, 0.7);
        }

        @media (pointer: fine) and (min-width: 768px) {
          .chapter-indicator {
            display: flex;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .chapter-indicator__link,
          .chapter-indicator__marker {
            transition-duration: 0.01ms;
          }
        }
      `}</style>

      <nav className="chapter-indicator" aria-label="Chapter navigation">
        <span className="chapter-indicator__caption" aria-hidden="true">
          Chapters
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
                  <span className="chapter-indicator__marker" aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
