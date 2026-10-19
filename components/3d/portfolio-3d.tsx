"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";

import { useSiteConfig } from "@/components/cms/site-config-provider";
import { ContributionCalendar } from "@/components/3d/contribution-calendar";
import { ProjectGallery, type GalleryImage } from "@/components/3d/project-gallery";
import { AmbientScan } from "@/components/motion/ambient-scan";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { ProjectDetail } from "@/components/motion/project-detail";
import { WordsPreloader } from "@/components/spaceui/words-preloader";
import type { RenderableSectionId } from "@/lib/cms/types";

/* ─────────────────────────────────────────────────────────────────────────────
   OBSIDIAN EDITORIAL PORTFOLIO
   Inspired by: dribbble.com/shots/26995447
   Design System: Stitch "Obsidian Editorial"
   Fonts: Syne (headings) · Inter (body) · JetBrains Mono (labels)
   Accent: #F5A623 amber
───────────────────────────────────────────────────────────────────────────── */

/* All editable content (projects, services, experience, hero, …) now lives in
   SiteConfig — see lib/cms/defaults.ts for the shipped defaults and
   /control to edit it. The hardcoded arrays that used to live here moved to
   DEFAULT_SITE_CONFIG so there is a single source of truth. */

const NAV_LINKS: { id: RenderableSectionId; label: string }[] = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "services", label: "Service" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

const MATRIX_COLUMNS = [
  "NITHIN 0101 NITHIN 1100",
  "001 NITHIN 101 NITHIN",
  "NITHIN 1100 010 NITHIN",
  "101 NITHIN 001 NITHIN",
  "NITHIN 011 101 NITHIN",
  "110 NITHIN 010 NITHIN",
];

export function EditorialPortfolio({ galleryImages = [] }: { galleryImages?: GalleryImage[] }) {
  const cursorRef = useRef<HTMLDivElement>(null);

  /* While the fullscreen words intro plays, keep the nav + custom cursor
     hidden so only the loader words are visible. They fade in with the wipe. */
  const [introDone, setIntroDone] = useState(false);

  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  /* 3D hero: mouse parallax + scroll dive */
  const heroRef = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 55, damping: 18, mass: 0.6 });
  const tiltX = useTransform(sy, [-0.5, 0.5], [7, -7]);
  const tiltY = useTransform(sx, [-0.5, 0.5], [-9, 9]);
  const layerBgX = useTransform(sx, [-0.5, 0.5], [12, -12]);
  const layerBgY = useTransform(sy, [-0.5, 0.5], [10, -10]);
  const layerFgX = useTransform(sx, [-0.5, 0.5], [-26, 26]);
  const layerFgY = useTransform(sy, [-0.5, 0.5], [-20, 20]);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const heroRotX = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  /* Editable content + section visibility/order from Firebase (falls back to
     the shipped defaults until/unless the Firestore document loads). */
  const { config } = useSiteConfig();
  const { hero, about, projects, gallery, services, experience, skills, contact, socials, content, theme } =
    config;
  const [openProject, setOpenProject] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const orderedSections = [...config.sections]
    .sort((a, b) => a.order - b.order)
    .filter((entry) => entry.visible);
  const visibleSectionIds = new Set<string>(orderedSections.map((entry) => entry.id));

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    /* ── Custom cursor ── */
    const cursor = cursorRef.current;
    const moveCursor = (e: MouseEvent) => {
      if (!cursor) return;
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };
    if (finePointer) window.addEventListener("mousemove", moveCursor);

    const hoverables = document.querySelectorAll<HTMLElement>("a,button,[data-hover]");
    const enterHover = () => cursor?.classList.add("hovered");
    const leaveHover = () => cursor?.classList.remove("hovered");
    if (finePointer) hoverables.forEach((el) => {
      el.addEventListener("mouseenter", enterHover);
      el.addEventListener("mouseleave", leaveHover);
    });

    /* ── Hero text reveal ── */
    const reveals = document.querySelectorAll<HTMLElement>(".reveal-text");
    reveals.forEach((el, i) => {
      if (reduceMotion) el.classList.add("visible");
      else setTimeout(() => el.classList.add("visible"), 120 * (i + 1));
    });

    /* ── Scroll reveal ── */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".scroll-fade").forEach((el) => io.observe(el));

    /* ── 3D hero mouse tracking (drives parallax + tilt springs) ── */
    const heroEl = heroRef.current;
    const trackHeroMouse = (e: MouseEvent) => {
      if (!heroEl || !finePointer || reduceMotion) return;
      const rect = heroEl.getBoundingClientRect();
      mx.set((e.clientX - rect.left) / rect.width - 0.5);
      my.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    const resetHeroMouse = () => { mx.set(0); my.set(0); };
    heroEl?.addEventListener("mousemove", trackHeroMouse);
    heroEl?.addEventListener("mouseleave", resetHeroMouse);

    /* ── Navbar hide on scroll down ── */
    let lastY = 0;
    const nav = document.getElementById("main-nav");
    const handleScroll = () => {
      const y = window.scrollY;
      if (nav) {
        nav.style.transform = y > lastY && y > 80 ? "translateY(-100%)" : "translateY(0)";
      }
      lastY = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    /* ── Marquee scroll speed ── */
    const marqueeTrack = document.getElementById("marquee-track");
    let marqueeX = 0;
    let marqueeRaf: number;
    const animateMarquee = () => {
      marqueeX -= 0.5;
      if (marqueeTrack) {
        const halfW = marqueeTrack.scrollWidth / 2;
        if (Math.abs(marqueeX) >= halfW) marqueeX = 0;
        marqueeTrack.style.transform = `translateX(${marqueeX}px)`;
      }
      marqueeRaf = requestAnimationFrame(animateMarquee);
    };
    marqueeRaf = reduceMotion ? 0 : requestAnimationFrame(animateMarquee);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("scroll", handleScroll);
      heroEl?.removeEventListener("mousemove", trackHeroMouse);
      heroEl?.removeEventListener("mouseleave", resetHeroMouse);
      hoverables.forEach((el) => {
        el.removeEventListener("mouseenter", enterHover);
        el.removeEventListener("mouseleave", leaveHover);
      });
      io.disconnect();
      if (marqueeRaf) cancelAnimationFrame(marqueeRaf);
    };
    /* Re-runs when config resolves/changes so freshly rendered or reordered
       sections get their reveal observers and marquee track re-attached. */
  }, [config]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  /* ── Keep the contribution calendar aligned with the hero buttons ──
     The graph mirrors the rendered width of the "View Work" / "Get In Touch"
     row so both share identical left/right edges at every viewport. ── */
  useEffect(() => {
    const buttons = buttonsRef.current;
    const stats = statsRef.current;
    if (!buttons || !stats) return;

    const sync = () => {
      const { width } = buttons.getBoundingClientRect();
      if (width > 0) stats.style.width = `${Math.round(width)}px`;
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(buttons);
    return () => observer.disconnect();
  }, []);

  /* ── GitHub contribution calendar is rendered inside the hero (see
     <ContributionCalendar /> below) — it loads its own real contribution data
     and caches it for 24h. ── */

  return (
    <main className="editorial-root">
      <WordsPreloader
        duration={6500}
        words={["ഹലോ", "HELLO", "NAMASKARAM", "AI ENGINEER", "LANDING PAGE", "NK."]}
      />
      <style>{`
        /* ── Reset ─────────────────────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg:       ${theme.bg};
          --surface:  ${theme.surface};
          --white:    #FFFFFF;
          --muted:    rgba(255,255,255,0.56);
          --border:   rgba(255,255,255,0.10);
          --amber:    ${theme.accent};
          --amber-dim:${theme.accentDim};
          --ease-expo: cubic-bezier(0.16, 1, 0.3, 1);
          --ease-circ: cubic-bezier(0.85, 0, 0.15, 1);
        }

        /* ── Body ──────────────────────────────────────────────────── */
         .editorial-root {
          background: var(--bg);
          color: var(--white);
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          /* overflow-x: clip (not hidden) so position: sticky works in descendants */
          overflow-x: clip;
           cursor: none;
         }

        /* ── Custom cursor ─────────────────────────────────────────── */
        #ed-cursor {
          width: 8px; height: 8px;
          background: var(--white);
          border-radius: 50%;
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          mix-blend-mode: difference;
          transition: width 0.25s var(--ease-expo),
                      height 0.25s var(--ease-expo),
                      background-color 0.25s ease;
        }
         #ed-cursor.hovered {
           width: 24px; height: 24px;
           background: transparent;
           border: 1px solid var(--amber);
           opacity: 1;
        }

        /* ── Nav ───────────────────────────────────────────────────── */
        #main-nav {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.5rem 4rem;
          border-bottom: 1px solid var(--border);
          background: rgba(12,12,12,0.85);
          backdrop-filter: blur(14px);
          transition: transform 0.4s var(--ease-expo);
        }
        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          color: var(--white);
          letter-spacing: -0.03em;
          text-decoration: none;
        }
        .nav-links { display: flex; gap: 2.5rem; align-items: center; }
        .nav-link {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.58);
          text-decoration: none;
          transition: color 0.3s ease;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 0; height: 1px;
          background: var(--amber);
          transition: width 0.3s var(--ease-expo);
        }
        .nav-link:hover { color: var(--white); }
        .nav-link:hover::after { width: 100%; }
        .nav-available {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--amber);
          text-decoration: none;
          transition: opacity 0.3s;
        }
         .nav-available:hover { opacity: 0.7; }
         .mobile-menu-toggle { display: none; }
         .mobile-menu { display: none; }
         .nav-link:focus-visible, .nav-available:focus-visible, .nav-logo:focus-visible,
         .btn-solid:focus-visible, .btn-ghost:focus-visible, .social-link:focus-visible,
         .footer-logo:focus-visible {
           outline: 1px solid var(--amber);
           outline-offset: 0.35rem;
         }

        /* ── Section wrapper ───────────────────────────────────────── */
         .ed-container {
           max-width: 1440px;
           margin: 0 auto;
           padding: 0 4rem;
         }
        .divider {
          height: 1px;
          background: var(--border);
          width: 100%;
        }
        .section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--amber);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        /* ── Hero ──────────────────────────────────────────────────── */
         .hero {
           min-height: 100vh;
           display: flex; flex-direction: column; justify-content: flex-end;
           padding-top: 9rem;
           padding-left: 4rem;
           padding-right: 4rem;
           padding-bottom: 4rem;
          position: relative;
          isolation: isolate;
           overflow: hidden;
         }
         .hero::before {
           content: '';
           position: absolute;
           inset: 0;
           z-index: -1;
           opacity: 0.28;
           background-image: linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
           background-size: 5rem 5rem;
           mask-image: linear-gradient(to bottom, transparent, black 20%, black 72%, transparent);
         }
         .hero::after {
           content: '';
           position: absolute;
           top: 18%;
           right: -12rem;
           width: 32rem;
           height: 32rem;
           z-index: -1;
           border: 1px solid rgba(245,166,35,0.18);
           border-radius: 50%;
           box-shadow: 0 0 0 2rem rgba(245,166,35,0.025), 0 0 0 6rem rgba(245,166,35,0.02);
           animation: hero-orbit 18s linear infinite;
           pointer-events: none;
         }
        /* 3D hero layers */
        .hero-tilt { transform-style: preserve-3d; will-change: transform; }
        .ht-line { display: block; overflow: hidden; transform-style: preserve-3d; }
        .hero { overflow: clip; }
        /* Viewport edge glow: fixed to the screen edges (not the hero box),
           so shades spread past the container to the true page borders.
           Left = green, right = gold. Inside stays pure dark. */
        .viewport-edge {
          position: fixed; top: 0; bottom: 0; width: min(22vw, 340px);
          pointer-events: none; z-index: 1;
        }
        .viewport-edge-left {
          left: 0;
          background:
            radial-gradient(130% 34% at 0% 12%, rgba(91,255,143,0.13), transparent 65%),
            radial-gradient(130% 34% at 0% 88%, rgba(91,255,143,0.10), transparent 65%),
            linear-gradient(90deg, rgba(91,255,143,0.05), transparent);
        }
        .viewport-edge-right {
          right: 0;
          background:
            radial-gradient(130% 34% at 100% 12%, rgba(245,166,35,0.15), transparent 65%),
            radial-gradient(130% 34% at 100% 88%, rgba(245,166,35,0.11), transparent 65%),
            linear-gradient(270deg, rgba(245,166,35,0.05), transparent);
        }
        @keyframes hero-orbit { to { transform: rotate(360deg); } }
        .matrix-rain {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
          mask-image: linear-gradient(to bottom, transparent, black 20%, black 78%, transparent);
        }
        .matrix-column {
          position: absolute;
          top: -55%;
          width: 7rem;
          color: rgba(91, 255, 143, 0.18);
          font-family: 'JetBrains Mono', monospace;
          font-size: clamp(0.55rem, 0.8vw, 0.72rem);
          line-height: 1.9;
          letter-spacing: 0.16em;
          text-shadow: 0 0 12px rgba(91, 255, 143, 0.22);
          writing-mode: vertical-rl;
          white-space: pre-wrap;
          animation: matrix-fall var(--matrix-speed) linear infinite;
          animation-delay: var(--matrix-delay);
        }
        @keyframes matrix-fall {
          from { transform: translateY(-8%); }
          to { transform: translateY(128%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .matrix-column { animation: none; }
        }
        .hero-tag {
          position: absolute;
          top: 7.5rem; right: 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
          z-index: 1;
        }
        .hero-headline {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          line-height: 0.9;
          letter-spacing: -0.04em;
           font-size: clamp(3.75rem, 10vw, 9.5rem);
          text-transform: uppercase;
          margin-bottom: 3rem;
          position: relative;
          z-index: 1;
        }
        .hero-headline .line-light {
          display: block;
          color: var(--muted);
          font-weight: 400;
        }
        .hero-headline .line-bold { display: block; }
        .hero-headline .accent-dot { color: var(--amber); }

        /* Text reveal */
         .reveal-text {
           opacity: 0;
           transform: translateY(50px);
           transition: opacity 1s var(--ease-expo), transform 1s var(--ease-expo);
         }
         .reveal-text { animation: hero-line-in 1.15s var(--ease-expo) 1.45s both; }
         .reveal-text.delay-1 { animation-delay: 1.58s; }
         .reveal-text.delay-2 { animation-delay: 1.72s; }
         @keyframes hero-line-in { from { opacity: 0; transform: translateY(50px); clip-path: inset(0 0 100% 0); } to { opacity: 1; transform: translateY(0); clip-path: inset(0 0 0 0); } }
         .reveal-text.visible { opacity: 1; transform: translateY(0); }

        /* Scroll fade */
         .scroll-fade {
           opacity: 0;
           transform: translateY(36px);
           clip-path: inset(0 0 18px 0);
           transition: opacity 0.9s var(--ease-expo), transform 0.9s var(--ease-expo), clip-path 0.9s var(--ease-expo);
         }
         .scroll-fade.visible { opacity: 1; transform: translateY(0); clip-path: inset(0 0 0 0); }
         .project-item.scroll-fade { transition-delay: 0ms; }
         .delay-1 { transition-delay: 100ms; }
        .delay-2 { transition-delay: 200ms; }
        .delay-3 { transition-delay: 320ms; }
         .delay-4 { transition-delay: 440ms; }
         .section-header { position: relative; }
         .section-header::after {
           position: absolute;
           left: 0;
           bottom: -1rem;
           width: 0;
           height: 1px;
           background: var(--amber);
           content: '';
           transition: width 1s var(--ease-expo);
         }
         .section-header.visible::after { width: min(8rem, 22vw); }
         .hero-signal {
           position: absolute;
           top: 7.5rem;
           left: 4rem;
           display: flex;
           align-items: center;
           gap: 0.65rem;
           z-index: 1;
           color: var(--muted);
           font-family: 'JetBrains Mono', monospace;
           font-size: 0.6rem;
           letter-spacing: 0.18em;
           text-transform: uppercase;
         }
         .hero-signal::before { content: ''; width: 0.45rem; height: 0.45rem; background: var(--amber); box-shadow: 0 0 0 0.25rem rgba(245,166,35,0.12); animation: signal-pulse 2.4s ease-in-out infinite; }
         @keyframes signal-pulse { 50% { box-shadow: 0 0 0 0.55rem rgba(245,166,35,0); } }
         .hero .hero-scan { position: absolute; top: 7.2rem; right: 8rem; z-index: 1; opacity: 0.8; }

        .hero-sub {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: end;
          position: relative;
          z-index: 1;
        }
        .hero-description {
          font-size: 1.15rem;
          line-height: 1.75;
          color: var(--muted);
          max-width: 36ch;
        }
        .hero-actions-block {
          display: flex; flex-direction: column; align-items: flex-end; gap: 2rem;
        }
        .hero-buttons { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: flex-end; }
        .btn-solid {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 1rem 2.25rem;
          background: var(--white);
          color: var(--bg);
          border: none;
          text-decoration: none;
          cursor: none;
          transition: background 0.3s ease;
          display: inline-block;
        }
        .btn-solid:hover { background: var(--amber); }
        .btn-ghost {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 1rem 2.25rem;
          background: transparent;
          color: var(--white);
          border: 1px solid var(--border);
          text-decoration: none;
          cursor: none;
          transition: border-color 0.3s ease, color 0.3s ease;
          display: inline-block;
        }
        .btn-ghost:hover { border-color: var(--amber); color: var(--amber); }

        .hero-stats {
          display: flex; gap: 2.5rem;
        }
        .stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--white);
          letter-spacing: -0.02em;
        }
        .stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
          margin-top: 0.2rem;
        }

        /* ── Marquee ───────────────────────────────────────────────── */
        .marquee-wrapper {
          overflow: hidden;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 1rem 0;
          background: var(--surface);
        }
        .marquee-track {
          display: flex; gap: 3rem;
          white-space: nowrap;
          will-change: transform;
        }
        .marquee-item {
          font-family: 'Syne', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
          flex-shrink: 0;
        }
        .marquee-item span { color: var(--amber); margin: 0 1rem; }

        /* ── Work section ──────────────────────────────────────────── */
         .work-section { padding: 6rem 4rem; }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3rem; }
        .section-big-num {
          font-family: 'Syne', sans-serif;
          font-size: clamp(3rem, 7vw, 6rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: rgba(255,255,255,0.36);
          line-height: 1;
        }

        /* Project rows */
        .project-list { border-top: 1px solid var(--border); }
         .project-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2rem 1.5rem;
          border-bottom: 1px solid var(--border);
          text-decoration: none;
          color: var(--white);
          position: relative;
          overflow: hidden;
          transition: background-color 0.4s var(--ease-expo);
           cursor: none;
           width: 100%;
           text-align: left;
           font: inherit;
           border-left: 0;
           border-right: 0;
           border-top: 0;
        }
        .project-row::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 1px;
          background: var(--amber);
          transition: width 0.6s var(--ease-expo);
        }
        .project-row:hover { background: var(--surface); }
        .project-row:hover::after { width: 100%; }
        .project-row:hover .project-title { color: var(--amber); }
         .project-row:hover .project-num { color: var(--amber); }
         .project-row[aria-expanded="true"] { background: var(--surface); }
         .project-row[aria-expanded="true"] .project-title,
         .project-row[aria-expanded="true"] .project-num { color: var(--amber); }
         .project-row[aria-expanded="true"]::after { width: 100%; }
         .project-row:focus-visible { outline: 2px solid var(--amber); outline-offset: -3px; }
         .project-toggle { position: relative; display: inline-block; width: 1.2rem; height: 1.2rem; flex: 0 0 1.2rem; color: var(--muted); transition: color 250ms ease; }
         .project-toggle::before, .project-toggle::after { position: absolute; top: 50%; left: 10%; width: 80%; height: 1px; background: currentColor; content: ''; transition: transform 400ms var(--ease-expo), opacity 250ms ease; }
         .project-toggle::after { transform: rotate(90deg); }
         .project-row[aria-expanded="true"] .project-toggle { color: var(--amber); }
         .project-row[aria-expanded="true"] .project-toggle::after { transform: rotate(0); opacity: 0; }
         .project-details {
           display: grid;
           grid-template-rows: 0fr;
           overflow: hidden;
           transition: grid-template-rows 0.55s var(--ease-expo), opacity 0.35s ease;
           opacity: 0;
         }
         .project-details[data-open="true"] { grid-template-rows: 1fr; opacity: 1; }
         .project-details > div { min-height: 0; overflow: hidden; }

         /* ── About and skills ─────────────────────────────────────── */
         .about-section, .skills-section { padding: 6rem 4rem; }
         .about-grid { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 4rem; align-items: start; }
         .about-headline {
           font-family: 'Syne', sans-serif;
           font-size: clamp(2rem, 4vw, 4rem);
           line-height: 1;
           letter-spacing: -0.04em;
         }
         .about-body { color: var(--muted); font-size: clamp(1rem, 1.6vw, 1.35rem); line-height: 1.75; max-width: 48rem; }
         .skills-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; }
         .skill-chip { display: inline-flex; flex-direction: column; gap: 0.35rem; border: 1px solid var(--border); padding: 1rem 1.1rem; min-width: 9rem; transition: border-color 0.3s ease, background 0.3s ease; }
         .skill-chip:hover { border-color: var(--amber); background: var(--surface); }
         .skill-name { font-family: 'Syne', sans-serif; font-weight: 700; }
         .skill-level { color: var(--muted); font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; }

        .project-left { display: flex; align-items: center; gap: 2.5rem; flex: 1; min-width: 0; }
        .project-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: var(--muted);
          transition: color 0.4s ease;
          min-width: 2rem;
        }
        .project-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.4rem, 2.5vw, 2.2rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          transition: color 0.4s var(--ease-expo);
          line-height: 1.1;
          overflow-wrap: anywhere;
        }
        .project-tags {
          display: flex; gap: 0.6rem; flex-wrap: wrap;
        }
        .project-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
          border: 1px solid var(--border);
          padding: 0.2rem 0.6rem;
        }
        .project-meta {
          display: flex; align-items: center; gap: 2rem; flex-shrink: 0; margin-left: 1.5rem;
        }
        .project-year {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: var(--muted);
        }
        .project-arrow {
          font-variation-settings: 'FILL' 0, 'wght' 300;
          transition: transform 0.4s var(--ease-expo);
          color: var(--muted);
        }

        /* ── Services grid ─────────────────────────────────────────── */
         .services-section { padding: 6rem 4rem; }
        .services-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 1px solid var(--border);
        }
        .service-card {
          position: relative;
          padding: 3rem;
          border: 1px solid var(--border);
          margin: -1px 0 0 -1px;
          transition: background 0.4s ease;
          cursor: none;
        }
        .service-card:hover { background: var(--surface); }
        .service-card::before { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: var(--amber); transform: scaleX(0); transform-origin: left; transition: transform 550ms var(--ease-expo); content: ''; }
        .service-card:hover::before { transform: scaleX(1); }
        .service-card:hover .service-explore { color: var(--amber); }
        .service-icon {
          font-size: 2rem;
          color: var(--muted);
          margin-bottom: 1.5rem;
          display: block;
          transition: color 0.3s ease, transform 0.5s var(--ease-expo);
        }
        .service-card:hover .service-icon { color: var(--amber); transform: translateY(-5px) rotate(-8deg); }
        .service-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.3rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--white);
          margin-bottom: 0.75rem;
          line-height: 1.25;
        }
        .service-desc {
          font-size: 0.9rem;
          line-height: 1.7;
          color: var(--muted);
          margin-bottom: 1.5rem;
        }
        .service-explore {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.3s ease;
          display: inline-flex; align-items: center; gap: 0.4rem;
        }

        /* ── Experience ────────────────────────────────────────────── */
         .exp-section { padding: 6rem 4rem; }
        .exp-table { width: 100%; border-collapse: collapse; }
        .exp-row {
          border-bottom: 1px solid var(--border);
          transition: background 0.3s ease;
        }
        .exp-row:hover { background: var(--surface); }
        .exp-cell {
          padding: 2rem 1.5rem;
          vertical-align: middle;
        }
        .exp-period {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: var(--muted);
          white-space: nowrap;
          letter-spacing: 0.05em;
        }
        .exp-role {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--white);
        }
        .exp-company {
          font-size: 0.85rem;
          color: var(--muted);
          margin-top: 0.3rem;
        }
        .exp-summary {
          margin-top: 0.65rem;
          max-width: 42rem;
          color: var(--muted);
          font-size: 0.78rem;
          line-height: 1.55;
        }
        .exp-stack { display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end; }
        .exp-chip {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          border: 1px solid var(--border);
          padding: 0.25rem 0.75rem;
          transition: border-color 0.3s ease, color 0.3s ease;
        }
        .exp-row:hover .exp-chip { border-color: var(--amber); color: var(--amber); }

        /* ── Contact ───────────────────────────────────────────────── */
         .contact-section { padding: 6rem 4rem 8rem; }
         .contact-scan { margin: 0 0 2.5rem auto; opacity: 0.72; }
        .contact-headline {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 0.92;
          font-size: clamp(3.5rem, 9vw, 8rem);
          text-transform: uppercase;
          margin-bottom: 3rem;
        }
        .contact-headline em {
          font-style: italic;
          color: var(--amber);
        }
        .contact-line { display: block; }
        .contact-headline.visible .contact-line { animation: contact-line-reveal 850ms var(--ease-expo) both; animation-delay: var(--line-delay, 0ms); }
        @keyframes contact-line-reveal { from { clip-path: inset(0 0 100% 0); transform: translateY(20px); } to { clip-path: inset(0); transform: translateY(0); } }
        .contact-email {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.1rem, 2.5vw, 2rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--white);
          text-decoration: none;
          border-bottom: 1px solid var(--border);
          transition: border-color 0.3s ease, color 0.3s ease;
          padding-bottom: 0.25rem;
          display: inline-block;
          margin-bottom: 2.5rem;
        }
         .contact-email:hover { border-color: var(--amber); color: var(--amber); }
         .contact-orbit { position: relative; display: inline-block; }
         .contact-orbit::after { content: ''; position: absolute; inset: -1.4rem -2rem; border: 1px solid rgba(245,166,35,0.2); border-radius: 50%; transform: rotate(-8deg); pointer-events: none; transition: transform 0.5s var(--ease-expo), border-color 0.3s ease; }
         .contact-orbit:hover::after { transform: rotate(5deg) scale(1.03); border-color: rgba(245,166,35,0.7); }
        .contact-actions { display: flex; gap: 1rem; margin-bottom: 4rem; flex-wrap: wrap; }
        .social-row { display: flex; gap: 2rem; flex-wrap: wrap; border-top: 1px solid var(--border); padding-top: 2rem; }
        .social-link {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.3s ease;
          display: flex; align-items: center; gap: 0.4rem;
        }
        .social-link:hover { color: var(--white); }

        /* ── Footer ────────────────────────────────────────────────── */
        .ed-footer {
          border-top: 1px solid var(--border);
          padding: 1.75rem 4rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 100%;
          margin: 0 auto;
        }
        .footer-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.4rem;
          letter-spacing: -0.03em;
          color: var(--white);
          text-decoration: none;
        }
         .footer-copy {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
           color: rgba(255,255,255,0.58);
        }

        /* ── Responsive ────────────────────────────────────────────── */
         @media (max-width: 900px) {
           #ed-cursor { display: none; }
           .editorial-root, .project-row, .service-card, .btn-solid, .btn-ghost { cursor: auto; }
          #main-nav { padding: 1.25rem 1.5rem; }
           .nav-links, .nav-available { display: none; }
           .mobile-menu-toggle { display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.65rem 0; border: 0; background: transparent; color: var(--white); font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase; cursor: pointer; }
           .mobile-menu-toggle::before { width: 0.4rem; height: 0.4rem; border-radius: 50%; background: var(--amber); box-shadow: 0 0 0 0.25rem rgba(245,166,35,0.12); content: ''; }
           .mobile-menu { position: fixed; inset: 0; z-index: 90; display: flex; flex-direction: column; justify-content: flex-end; gap: 1.25rem; padding: 7rem 1.5rem 2rem; background: rgba(12,12,12,0.97); }
           .mobile-menu::before { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px); background-size: 4rem 4rem; content: ''; opacity: 0.6; pointer-events: none; }
           .mobile-menu-link { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: baseline; padding: 0.5rem 0; border-bottom: 1px solid var(--border); color: var(--white); font-family: 'Syne', sans-serif; font-size: clamp(2rem, 10vw, 3.5rem); font-weight: 700; letter-spacing: -0.05em; text-decoration: none; }
           .mobile-menu-link span { color: var(--amber); font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; letter-spacing: 0.14em; }
           .mobile-menu-meta { position: relative; z-index: 1; margin-top: auto; color: var(--muted); font-family: 'JetBrains Mono', monospace; font-size: 0.58rem; letter-spacing: 0.15em; text-transform: uppercase; }
           .ed-container,
           .hero,
           .work-section,
           .about-section,
           .services-section,
           .exp-section,
           .skills-section,
           .contact-section { padding-left: 1.5rem; padding-right: 1.5rem; }
          .hero-sub { grid-template-columns: 1fr; }
          .hero-actions-block { align-items: flex-start; }
          .hero-buttons { justify-content: flex-start; }
          .services-grid { grid-template-columns: 1fr; }
          .ed-footer { flex-direction: column; gap: 1rem; padding: 1.5rem; text-align: center; }
           .project-tags { display: none; }
           .about-grid { grid-template-columns: 1fr; gap: 2rem; }
           .hero-signal { left: 1.5rem; }
           .hero .hero-scan { top: 7.2rem; right: 1.5rem; transform: scale(0.72); transform-origin: right center; }
           .hero::after { right: -18rem; top: 20%; }
           .hero-headline { font-size: clamp(2.55rem, 11.5vw, 4.8rem); letter-spacing: -0.07em; line-height: 0.86; overflow-wrap: normal; }
           .hero { min-height: auto; padding-top: 9.5rem; padding-bottom: 3rem; }
           .hero-signal { top: 7.4rem; }
           .hero-description { font-size: 1rem; }
           .hero-actions-block { gap: 1.4rem; }
           .hero-buttons { width: 100%; }
           .hero-buttons .btn-solid, .hero-buttons .btn-ghost { flex: 1; padding-left: 0.75rem; padding-right: 0.75rem; text-align: center; }
           .hero-stats { width: 100% !important; overflow-x: auto; }
           .section-header { margin-bottom: 2.2rem !important; }
           .section-big-num { font-size: clamp(2.7rem, 14vw, 4rem); }
         }
         @media (max-height: 700px) and (min-width: 901px) {
           .hero { padding-top: 7rem; padding-bottom: 2.5rem; }
           .hero-headline { margin-bottom: 1.5rem; font-size: clamp(3.25rem, 9vw, 7rem); }
           .hero-signal { top: 5.5rem; }
         }
         @media (min-width: 901px) and (max-width: 1400px) {
           .hero-headline { font-size: clamp(3.75rem, 10vw, 8rem); }
         }
         @media (max-width: 680px) {
           .project-row { padding: 1.4rem 0.75rem; align-items: flex-start; gap: 1rem; }
           .project-left { gap: 0.75rem; }
           .project-num { min-width: 1.4rem; padding-top: 0.25rem; }
           .project-title { font-size: 1.15rem; line-height: 1.25; }
           .project-meta { margin-left: 0; gap: 0.7rem; padding-top: 0.25rem; }
           .project-year { display: none; }
         }

         @media (pointer: coarse) { .editorial-root, .project-row, .service-card { cursor: auto; } #ed-cursor { display: none; } }
         @media (prefers-reduced-motion: reduce) {
           *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: 0.01ms !important; }
           .marquee-track { transform: none !important; }
           .hero::after, .hero-signal::before { animation: none; }
           .reveal-text { animation: none; }
           .mobile-menu { animation: none; }
         }

        /* ── Scroll bar ────────────────────────────────────────────── */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--border); }
      `}</style>

      {/* ── Custom Cursor ────────────────────────────────────────── */}
      <div id="ed-cursor" ref={cursorRef} />

      {/* ── Viewport edge glow (fixed to screen borders, not the hero box) ── */}
      <div className="viewport-edge viewport-edge-left" aria-hidden="true" />
      <div className="viewport-edge viewport-edge-right" aria-hidden="true" />

      {/* ── Navbar ───────────────────────────────────────────────── */}
       <nav id="main-nav">
         <a href="#home" className="nav-logo">NK.</a>
         <div className="nav-links">
          {NAV_LINKS.filter((link) => visibleSectionIds.has(link.id)).map((link) => (
            <a key={link.id} href={`#${link.id}`} className="nav-link">{link.label}</a>
          ))}
         </div>
         <a href="#contact" className="nav-available">Available →</a>
         <button
           type="button"
           className="mobile-menu-toggle"
           aria-expanded={mobileMenuOpen}
           aria-controls="mobile-menu"
           onClick={() => setMobileMenuOpen((open) => !open)}
         >
           {mobileMenuOpen ? "Close" : "Menu"}
         </button>
       </nav>
       {mobileMenuOpen && (
         <div id="mobile-menu" className="mobile-menu">
           {NAV_LINKS.filter((link) => visibleSectionIds.has(link.id))
             .map((item, index) => (
               <a
                 key={item.id}
                 href={`#${item.id}`}
                 className="mobile-menu-link"
                 onClick={() => setMobileMenuOpen(false)}
               >
                 {item.label}
                 <span>{String(index + 1).padStart(2, "0")}</span>
               </a>
             ))}
           <p className="mobile-menu-meta">AI systems / voice / retrieval / agents</p>
         </div>
       )}
       {orderedSections.map((section) => (
        <Fragment key={section.id}>
          {/* ── Hero ─────────────────────────────────────────────────── */}
          {section.id === "hero" && (
            <>
      <motion.section
        id="home"
        ref={heroRef}
        className="hero ed-container"
        style={{ scale: heroScale, rotateX: heroRotX, opacity: heroOpacity, transformPerspective: 1100 }}
      >
        <div className="hero-signal" aria-hidden="true">Live signal / portfolio 01</div>
        <AmbientScan className="hero-scan" />
        <div className="matrix-rain" aria-hidden="true">
          {MATRIX_COLUMNS.map((column, index) => (
            <span
              key={index}
              className="matrix-column"
              style={{
                left: `${8 + index * 17}%`,
                "--matrix-speed": `${13 + index * 2}s`,
                "--matrix-delay": `-${index * 2.4}s`,
              } as CSSProperties}
            >
              {column}
            </span>
          ))}
        </div>

        <motion.h1
          className="hero-headline hero-tilt"
          style={{ rotateX: tiltX, rotateY: tiltY, x: layerFgX, transformPerspective: 1000 }}
          initial={false}
          animate={introDone ? "in" : "hidden"}
          variants={{ hidden: {}, in: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
        >
          <motion.span className="line-light ht-line" variants={{ hidden: { y: "110%", rotateX: -55, opacity: 0 }, in: { y: "0%", rotateX: 0, opacity: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } } }}>{hero.headline.line1}</motion.span>
          <motion.span className="line-bold ht-line" variants={{ hidden: { y: "110%", rotateX: -55, opacity: 0 }, in: { y: "0%", rotateX: 0, opacity: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } } }}>{hero.headline.line2}</motion.span>
          <motion.span className="line-bold ht-line" variants={{ hidden: { y: "110%", rotateX: -55, opacity: 0 }, in: { y: "0%", rotateX: 0, opacity: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } } }}>
            {hero.headline.line3}<span className="accent-dot">{hero.headline.accent}</span>
          </motion.span>
        </motion.h1>

        <motion.div
          className="hero-sub"
          initial={false}
          animate={introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.8, delay: introDone ? 0.7 : 0, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="hero-description">
            {hero.description}
          </p>
          <div className="hero-actions-block">
            <div className="hero-buttons" ref={buttonsRef}>
              <MagneticButton href={hero.primaryCta.href} className="btn-solid">{hero.primaryCta.label}</MagneticButton>
              <MagneticButton href={hero.secondaryCta.href} className="btn-ghost">{hero.secondaryCta.label}</MagneticButton>
            </div>
            <div className="hero-stats" ref={statsRef}>
              <ContributionCalendar />
            </div>
          </div>
        </motion.div>
      </motion.section>
            </>
          )}
          {section.id === "hero" && section.dividerAfter && <div className="divider" />}

          {/* ── Marquee ──────────────────────────────────────────────── */}
          {section.id === "marquee" && (
            <>
      <div className="marquee-wrapper">
        <div id="marquee-track" className="marquee-track">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="marquee-item" style={{ display: "flex", alignItems: "center", gap: "3rem" }}>
              {content.marquee.map((text, j) => (
                <Fragment key={j}>
                   {j > 0 && <span aria-hidden="true" style={{ color: theme.accent }}>✦</span>}
                  <span>{text}</span>
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
            </>
          )}

          {/* ── About ────────────────────────────────────────────────── */}
          {section.id === "about" && (
            <>
              <section id="about" className="about-section ed-container">
                <div className="section-header scroll-fade" style={{ marginBottom: "2.5rem" }}>
                  <p className="section-label">— About</p>
                  <p className="section-big-num">00</p>
                </div>
                <div className="about-grid scroll-fade delay-1">
                  <h2 className="about-headline">{about.headline}</h2>
                  <p className="about-body">{about.body}</p>
                </div>
              </section>
            </>
          )}
          {section.id === "about" && section.dividerAfter && <div className="divider" />}

          {/* ── Work Section ─────────────────────────────────────────── */}
          {section.id === "work" && (
            <>
      <section id="work" className="work-section ed-container">
        <div className="section-header scroll-fade">
          <div>
            <p className="section-label">{projects.label}</p>
            <p className="section-big-num">{projects.number}</p>
          </div>
          <MagneticButton
            href={projects.allProjectsHref}
            target="_blank" rel="noreferrer"
            className="btn-ghost"
            style={{ alignSelf: "flex-end" }}
          >
            {projects.allProjectsLabel}
          </MagneticButton>
        </div>

        <div className="project-list">
          {projects.items.map((p, i) => {
            const isOpen = openProject === p.num;
            return (
              <div key={p.num} className={`project-item scroll-fade delay-${(i % 4) + 1}`}>
                 <button
                   type="button"
                   className="project-row"
                   aria-expanded={isOpen}
                   aria-controls={`project-panel-${p.num}`}
                   onClick={() => setOpenProject(isOpen ? null : p.num)}
                >
                  <div className="project-left">
                    <span className="project-num">{p.num}</span>
                    <span className="project-title">{p.title}</span>
                    <div className="project-tags">
                      {p.tags.map(t => <span key={t} className="project-tag">{t}</span>)}
                    </div>
                  </div>
                  <div className="project-meta">
                    <span className="project-year">{p.year}</span>
                    <span className="project-toggle" aria-hidden="true" />
                  </div>
                </button>
                 <div id={`project-panel-${p.num}`} className="project-details" data-open={isOpen} aria-hidden={!isOpen} inert={!isOpen}>
                   <div>
                     <ProjectDetail
                       project={p}
                       open={isOpen}
                       image={galleryImages.length > 0 ? galleryImages[i % galleryImages.length] : undefined}
                     />
                   </div>
                 </div>
              </div>
            );
          })}
        </div>
      </section>
            </>
          )}
          {section.id === "work" && section.dividerAfter && <div className="divider" />}

          {/* ── Project Gallery (sticky image stack) ─────────────────────── */}
          {section.id === "gallery" && gallery.enabled && (
            <>
      <ProjectGallery images={galleryImages} label={gallery.label} title={gallery.title} hint={gallery.hint} />
      {section.dividerAfter && <div className="divider" />}
            </>
          )}

          {/* ── Services ─────────────────────────────────────────────── */}
          {section.id === "services" && (
            <>
      <section id="services" className="services-section ed-container">
        <div className="section-header scroll-fade" style={{ marginBottom: "2.5rem" }}>
          <div>
            <p className="section-label">{services.label}</p>
            <p className="section-big-num">{services.number}</p>
          </div>
        </div>

        <div className="services-grid scroll-fade delay-1">
           {services.items.map((s, index) => (
             <div key={s.title} className="service-card scroll-fade" data-hover="" style={{ transitionDelay: `${index * 90}ms` }}>
              <span className="material-symbols-outlined service-icon">{s.icon}</span>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-desc">{s.desc}</p>
              <span className="service-explore">Explore →</span>
            </div>
          ))}
        </div>
      </section>
            </>
          )}
          {section.id === "services" && section.dividerAfter && <div className="divider" />}

          {/* ── Experience ───────────────────────────────────────────── */}
          {section.id === "experience" && (
            <>
      <section id="experience" className="exp-section ed-container">
        <div className="section-header scroll-fade" style={{ marginBottom: "2.5rem" }}>
          <div>
            <p className="section-label">{experience.label}</p>
            <p className="section-big-num">{experience.number}</p>
          </div>
        </div>

        <div className="divider" />
        <table className="exp-table scroll-fade delay-1">
          <tbody>
             {experience.items.map((e, index) => (
               <tr key={e.period} className="exp-row scroll-fade" style={{ transitionDelay: `${index * 90}ms` }}>
                <td className="exp-cell" style={{ width: "18%" }}>
                  <span className="exp-period">{e.period}</span>
                </td>
                <td className="exp-cell" style={{ width: "50%" }}>
                  <p className="exp-role">{e.role}</p>
                  <p className="exp-company">{e.company} · {e.location}</p>
                  {e.summary && <p className="exp-summary">{e.summary}</p>}
                </td>
                <td className="exp-cell" style={{ width: "32%", textAlign: "right" }}>
                  <div className="exp-stack">
                    {e.stack.map(t => <span key={t} className="exp-chip">{t}</span>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
            </>
          )}
          {section.id === "experience" && section.dividerAfter && <div className="divider" />}

          {/* ── Skills ───────────────────────────────────────────────── */}
          {section.id === "skills" && (
            <>
              <section id="skills" className="skills-section ed-container">
                <div className="section-header scroll-fade" style={{ marginBottom: "2.5rem" }}>
                  <p className="section-label">— Skills</p>
                  <p className="section-big-num">04</p>
                </div>
                <div className="skills-grid scroll-fade delay-1">
                  {skills.items.map((skill, index) => (
                    <div key={skill.name} className="skill-chip scroll-fade" style={{ transitionDelay: `${index * 70}ms` }}>
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-level">{skill.level}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
          {section.id === "skills" && section.dividerAfter && <div className="divider" />}

          {/* ── Contact ──────────────────────────────────────────────── */}
          {section.id === "contact" && (
            <>
      <section id="contact" className="contact-section ed-container">
        <AmbientScan className="contact-scan" />
        <p className="section-label scroll-fade" style={{ marginBottom: "2rem" }}>{contact.label}</p>

        <h2 className="contact-headline scroll-fade delay-1">
          {contact.headline.map((line, i) => (
            <span key={i} className="contact-line" style={{ "--line-delay": `${i * 110}ms` } as CSSProperties}>
              {i === contact.headline.length - 1 ? <em>{line}</em> : line}
            </span>
          ))}
        </h2>

        <a href={`mailto:${contact.email}`} className="contact-email scroll-fade delay-2">
          {contact.email}
        </a>

        <div className="contact-actions scroll-fade delay-3">
          <MagneticButton href={`mailto:${contact.email}`} className="btn-solid">{contact.messageLabel}</MagneticButton>
          <MagneticButton href={contact.resumeUrl} target="_blank" rel="noreferrer" className="btn-ghost">{contact.cvLabel}</MagneticButton>
        </div>

        <div className="social-row scroll-fade delay-4">
          {socials.items.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="social-link">
              {s.label}
              <span className="material-symbols-outlined" style={{ fontSize: "0.9rem" }}>arrow_outward</span>
            </a>
          ))}
        </div>
      </section>
            </>
          )}
          {section.id === "contact" && section.dividerAfter && <div className="divider" />}
        </Fragment>
      ))}

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="ed-footer">
        <a href="#home" className="footer-logo">{content.footer.logo}</a>
        <p className="footer-copy">{content.footer.copyright}</p>
        <p className="footer-copy">{content.footer.credit}</p>
      </footer>
    </main>
  );
}
