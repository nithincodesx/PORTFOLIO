"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

export type GalleryImage = { src: string; alt: string };

function Card({ i, total, image, progress, active }: { i: number; total: number; image: GalleryImage; progress: MotionValue<number>; active: number }) {
  const targetScale = 1 - (total - 1 - i) * 0.05;
  const scale = useTransform(progress, [i / total, 1], [1, targetScale]);
  const [ratio, setRatio] = useState<string | null>(null);
  const isActive = i === active;
  return (
    <div className="pg-slot">
      <motion.div className={isActive ? "pg-card is-active" : "pg-card"} style={{ scale, top: `calc(-5vh + ${i * 25}px)`, aspectRatio: ratio ?? undefined }}>
        <div className="pg-sheen" aria-hidden="true" />
        <div className="pg-imgwrap">
          <img src={image.src} alt={image.alt} loading={i === 0 ? "eager" : "lazy"} draggable={false}
            onLoad={(e) => { const el = e.currentTarget; if (el.naturalWidth > 0 && el.naturalHeight > 0) setRatio(`${el.naturalWidth} / ${el.naturalHeight}`); }} />
        </div>
        <span className="pg-count">{String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      </motion.div>
    </div>
  );
}

function GalleryStack({ images }: { images: GalleryImage[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useEffect(() => {
    const update = (v: number) => setActive(Math.min(images.length - 1, Math.max(0, Math.floor(v * images.length))));
    update(scrollYProgress.get());
    const unsub = scrollYProgress.on("change", update);
    return unsub;
  }, [scrollYProgress, images.length]);
  return (
    <div className="pg-stack" ref={ref}>
      {images.map((image, i) => (
        <Card key={image.src} i={i} total={images.length} image={image} progress={scrollYProgress} active={active} />
      ))}
    </div>
  );
}
export function ProjectGallery({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) return null;
  return (
    <section className="pg-section">
      <style>{`
        .pg-section { position: relative; padding: 4rem 0 2rem; }
        .pg-head { text-align: center; margin-bottom: 1rem; }
        .pg-label { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--muted); opacity: 0.7; }
        .pg-hint { display: flex; justify-content: center; align-items: center; gap: 0.6rem; font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--muted); opacity: 0.5; margin: 0.75rem 0 0; }
        .pg-stack { position: relative; }
        .pg-slot { height: 100vh; height: 100svh; display: flex; align-items: center; justify-content: center; position: sticky; top: 0; }
        .pg-card { position: relative; width: min(1120px, calc(100vw - 2.5rem)); max-height: 82vh; max-height: 82svh; aspect-ratio: 16 / 10; border-radius: 1.5rem; background: #101013; transform-origin: top center; will-change: transform; padding: 10px; border: 1px solid rgba(255,255,255,0.10); box-shadow: inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.65), 0 18px 50px rgba(0,0,0,0.45); }
        .pg-card::before { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; padding: 1px; background: linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.05) 28%, rgba(0,0,0,0.5) 55%, rgba(255,255,255,0.10) 78%, rgba(255,255,255,0.22)); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0.85; }
        .pg-sheen { position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0; }
        .pg-card.is-active .pg-sheen { opacity: 1; padding: 1px; background: conic-gradient(from var(--pg-angle, 0deg), transparent 0deg, transparent 300deg, rgba(226,232,240,0.55) 330deg, rgba(255,255,255,0.85) 345deg, transparent 360deg); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; animation: pg-spin 7s linear infinite; }
        @property --pg-angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
        @keyframes pg-spin { to { --pg-angle: 360deg; } }
        .pg-imgwrap { position: absolute; inset: 10px; border-radius: calc(1.5rem - 10px); overflow: hidden; background: #0a0a0c; }
        .pg-imgwrap img { width: 100%; height: 100%; object-fit: contain; display: block; user-select: none; pointer-events: none; }
        .pg-count { position: absolute; left: 1.25rem; bottom: 1.25rem; font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; letter-spacing: 0.15em; color: var(--white); background: rgba(12,12,12,0.65); border: 1px solid rgba(255,255,255,0.16); padding: 0.35rem 0.7rem; border-radius: 999px; }
        @media (max-width: 640px) { .pg-card { width: calc(100vw - 1.5rem); max-height: 74svh; border-radius: 1.1rem; padding: 8px; } .pg-imgwrap { inset: 8px; border-radius: calc(1.1rem - 8px); } }
        @media (prefers-reduced-motion: reduce) { .pg-card.is-active .pg-sheen { animation: none; opacity: 0.35; } }
      `}</style>
      <div className="pg-head scroll-fade">
        <p className="section-label" style={{ textAlign: "center" }}>— Project Gallery</p>
        <p className="pg-label">Project Gallery</p>
        <p className="pg-hint">Scroll to stack ↓</p>
      </div>
      <GalleryStack images={images} />
    </section>
  );
}
