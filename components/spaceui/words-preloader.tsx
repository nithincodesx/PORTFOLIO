'use client';

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type WordsPreloaderProps = {
  words?: string[];
  duration?: number;
  className?: string;
  children?: ReactNode;
  fullscreen?: boolean;
  onComplete?: () => void;
};

/* Exact SpaceUI words — plus Malayalam. Last word stays short ("NK.")
   so the curved wipe launches from a tight label, like the original. */
const DEFAULT_WORDS = [
  'ഹലോ', 'Hello', 'bonjour', 'നമസ്കാരം', 'Ciao', 'Olà',
  'സ്വാഗതം', 'やあ', 'Hallå', 'Guten tag', 'നന്ദി', 'NK.',
];

export function WordsPreloader({
  words = DEFAULT_WORDS,
  duration = 2000,
  className,
  children,
  fullscreen = false,
  onComplete,
}: WordsPreloaderProps) {
  const [isLoading, setIsLoading] = useState(true);

  /* Tell the music player the intro started so audio kicks in together
     with the loader words (browsers may still need a first click). */
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('words-intro-start'));
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const timer = window.setTimeout(() => onComplete?.(), 1100);
    return () => window.clearTimeout(timer);
  }, [isLoading, onComplete]);

  useEffect(() => {
    if (!fullscreen || !isLoading) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, [fullscreen, isLoading]);


  if (fullscreen) {
    return (
      <AnimatePresence mode="wait">
        {isLoading ? (
          <PreloaderContent key="words-preloader" words={words} fullscreen />
        ) : null}
      </AnimatePresence>
    );
  }

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
          animation: none;
        }

        .words-preloader.is-playing {
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
          animation: none;
        }

        .words-preloader.is-playing .words-preloader__content {
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

        .words-preloader__context {
          margin: 0;
          color: rgba(255,255,255,0.62);
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.02em;
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
          animation: none;
          animation-delay: var(--word-delay);
        }

        .words-preloader.is-playing .words-preloader__word {
          animation: words-preloader-word 780ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .words-preloader:not(.is-playing) .words-preloader__word:first-child {
          opacity: 1;
          transform: translateY(0);
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
          animation: none;
        }

        .words-preloader.is-playing .words-preloader__progress {
          animation: words-preloader-progress var(--words-duration) cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes words-preloader-word {
          0% { opacity: 0; transform: translateY(110%); }
          20%, 78% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-110%); }
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
          .words-preloader.is-playing { animation: none; clip-path: none; }
          .words-preloader.is-playing .words-preloader__content,
          .words-preloader.is-playing .words-preloader__word,
          .words-preloader.is-playing .words-preloader__progress { animation: none; }
          .words-preloader.is-playing .words-preloader__progress { transform: scaleX(0.35); }
        }
      `}</style>

      <div
        aria-hidden="true"
        className={`${className ? `words-preloader ${className}` : "words-preloader"}`}
      >
        <div className="words-preloader__content">
          <p className="words-preloader__label">NITHIN KRISHNA / PORTFOLIO</p>
          <div className="words-preloader__window">
            {words.map((word, index) => (
              <p
                className="words-preloader__word"
                key={`${word}-${index}`}
              >
                {word}
              </p>
            ))}
          </div>
          <p className="words-preloader__status">Loading intelligence layer</p>
          <div className="words-preloader__track">
            <div className="words-preloader__progress" />
          </div>
          {children ?? <p className="words-preloader__context">Landing page / AI Engineer portfolio</p>}
        </div>
      </div>
    </>
  );
}

function PreloaderContent({ words, fullscreen = false }: { words: string[]; fullscreen?: boolean }) {
  const [index, setIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setDimension({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (index >= words.length - 1) return;
    const timer = window.setTimeout(() => setIndex((i) => i + 1), index === 0 ? 1000 : 150);
    return () => window.clearTimeout(timer);
  }, [index, words.length]);

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height}  L0 0`;
  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height}  L0 0`;

  return (
    <motion.div
      ref={rootRef}
      aria-hidden="true"
      variants={{
        initial: { top: 0 },
        exit: { top: '-100%', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 } },
      }}
      initial="initial"
      exit="exit"
      className={cn(
        'flex items-center justify-center bg-[#0c0c0c]',
        fullscreen ? 'fixed inset-0 z-[200] h-[100svh] w-full' : 'absolute inset-0 z-20',
      )}
    >
      {dimension.width > 0 ? (
        <Fragment>
          <motion.p
            variants={{
              initial: { opacity: 0 },
              enter: { opacity: 0.75, transition: { duration: 1, delay: 0.2 } },
            }}
            className="absolute z-10 px-6 text-center text-5xl font-semibold tracking-tighter text-white md:text-6xl"
            style={{ fontFamily: "'Syne','Noto Sans Malayalam','Manjari','Inter',sans-serif" }}
            initial="initial"
            animate="enter"
          >
            {words[index]}
          </motion.p>
          <svg className="absolute top-0 h-[calc(100%+300px)] w-full">
            <motion.path
              variants={{
                initial: { d: initialPath, transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } },
                exit: { d: targetPath, transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.3 } },
              }}
              initial="initial"
              exit="exit"
              className="fill-[#0c0c0c]"
            />
          </svg>
        </Fragment>
      ) : null}
    </motion.div>
  );
}
