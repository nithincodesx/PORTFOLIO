'use client';

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/* Exact SpaceUI words — plus Malayalam. Last word stays short ("NK.")
   so the curved wipe launches from a tight label, like the original. */
const DEFAULT_WORDS = [
  'ഹലോ', 'Hello', 'bonjour', 'നമസ്കാരം', 'Ciao', 'Olà',
  'സ്വാഗതം', 'やあ', 'Hallå', 'Guten tag', 'നന്ദി', 'NK.',
];

export type WordsPreloaderProps = {
  words?: string[];
  duration?: number;
  className?: string;
  children?: ReactNode;
  fullscreen?: boolean;
  onComplete?: () => void;
};

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
    const timer = window.setTimeout(() => setIsLoading(false), duration);
    return () => window.clearTimeout(timer);
  }, [duration]);

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
    <div className={cn('relative h-full min-h-80 w-full overflow-hidden', className)}>
      <AnimatePresence mode="wait">
        {isLoading ? <PreloaderContent key="words-preloader" words={words} /> : null}
      </AnimatePresence>
      <div className="flex h-full min-h-80 w-full items-center justify-center">
        {children ?? 'Your landing page'}
      </div>
    </div>
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
