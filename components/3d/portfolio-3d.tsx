"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import { ContributionCalendar } from "@/components/3d/contribution-calendar";
import { ProjectGallery, type GalleryImage } from "@/components/3d/project-gallery";

/* ─────────────────────────────────────────────────────────────────────────────
   OBSIDIAN EDITORIAL PORTFOLIO
   Inspired by: dribbble.com/shots/26995447
   Design System: Stitch "Obsidian Editorial"
   Fonts: Syne (headings) · Inter (body) · JetBrains Mono (labels)
   Accent: #F5A623 amber
───────────────────────────────────────────────────────────────────────────── */

const PROJECTS = [
  {
    num: "01",
    title: "Verified-Hybrid-Multi-Agent-RAG-System",
    tags: ["Retrieval", "Vector DB", "Agents"],
    year: "2026",
    href: "https://github.com/nithincodesx/Verified-Hybrid-Multi-Agent-RAG-System-v1",
    desc: "Hybrid BM25 + vector RAG with a verification agent that validates every claim — reducing hallucinations by 94%.",
  },
  {
    num: "02",
    title: "AI-Agile-Retrospective-Facilitator",
    tags: ["LLM", "Workflow"],
    year: "2025",
    href: "https://github.com/nithincodesx/AI-Agile-Retrospective-Facilitator",
    desc: "AI facilitator that surfaces emotional bottlenecks in Agile sprints using sentiment and commit velocity.",
  },
  {
    num: "03",
    title: "Coraxis",
    tags: ["Autonomous Agents", "FastAPI", "Python"],
    year: "2026",
    href: "https://github.com/nithincodesx/Coraxis",
    desc: "Four specialised agents research a topic end to end — decompose, search, cross-check sources, and hand back a cited report, streamed live.",
  },
  {
    num: "04",
    title: "CloudPulse-AI",
    tags: ["Python", "Supabase", "Analytics"],
    year: "2026",
    href: "https://github.com/nithincodesx/CloudPulse-AI",
    desc: "SaaS-style infrastructure dashboard that turns real-time telemetry into server utilization and cost-saving signals.",
  },
  {
    num: "05",
    title: "Cozy-Coffee-v1",
    tags: ["Next.js", "Supabase", "TypeScript"],
    year: "2026",
    href: "https://github.com/nithincodesx/Cozy-Coffee-v1",
    desc: "A full-stack community for coffee lovers — share favourite brews, review cafes on an interactive map, and hold rich-text forum discussions.",
  },
];

const SERVICES = [
  {
    icon: "mic",
    title: "Voice AI & Autonomous Agents",
    desc: "Voice interfaces, tool-using agents, and multi-step planning loops that reason and self-verify.",
  },
  {
    icon: "lan",
    title: "RAG & Reliable Retrieval",
    desc: "Hybrid BM25 + dense vector retrieval with an independent claim-verification agent layer.",
  },
  {
    icon: "visibility",
    title: "Computer Vision Prototypes",
    desc: "Detection, segmentation, and OCR pipelines — shipped as clean, monitored APIs.",
  },
  {
    icon: "rocket_launch",
    title: "Full-Stack AI Products",
    desc: "End-to-end builds: Next.js frontends, FastAPI services, Supabase, Docker, and CI/CD.",
  },
];

const EXPERIENCE = [
  {
    period: "2024 â€” Present",
    role: "AI Engineer",
    company: "Independent Projects",
    location: "Remote",
    stack: ["LLMs", "LangChain", "RAG", "Python"],
  },
  {
    period: "2023 â€” 2024",
    role: "Full-Stack Developer",
    company: "Applied AI Labs",
    location: "Remote",
    stack: ["Next.js", "FastAPI", "Supabase"],
  },
  {
    period: "2022 â€” 2023",
    role: "ML Builder",
    company: "Research & Experiments",
    location: "India",
    stack: ["Python", "PyTorch", "OpenCV"],
    summary: "Built and evaluated computer-vision and NLP prototypes, then translated experiments into clear, interactive demos.",
  },
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
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* ── Custom cursor ── */
    const cursor = cursorRef.current;
    const moveCursor = (e: MouseEvent) => {
      if (!cursor) return;
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };
    window.addEventListener("mousemove", moveCursor);

    const hoverables = document.querySelectorAll<HTMLElement>("a,button,[data-hover]");
    const enterHover = () => cursor?.classList.add("hovered");
    const leaveHover = () => cursor?.classList.remove("hovered");
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", enterHover);
      el.addEventListener("mouseleave", leaveHover);
    });

    /* ── Hero text reveal ── */
    const reveals = document.querySelectorAll<HTMLElement>(".reveal-text");
    reveals.forEach((el, i) =>
      setTimeout(() => el.classList.add("visible"), 120 * (i + 1))
    );

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
    marqueeRaf = requestAnimationFrame(animateMarquee);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("scroll", handleScroll);
      hoverables.forEach((el) => {
        el.removeEventListener("mouseenter", enterHover);
        el.removeEventListener("mouseleave", leaveHover);
      });
      io.disconnect();
      cancelAnimationFrame(marqueeRaf);
    };
  }, []);

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
    <div className="editorial-root">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
      />

      <style>{`
        /* ── Reset ─────────────────────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg:       #0C0C0C;
          --surface:  #141414;
          --white:    #FFFFFF;
          --muted:    rgba(255,255,255,0.45);
          --border:   rgba(255,255,255,0.10);
          --amber:    #F5A623;
          --amber-dim:#C78419;
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
          width: 44px; height: 44px;
          background: var(--amber);
          opacity: 0.75;
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
          color: var(--muted);
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
          padding-bottom: 4rem;
          position: relative;
          isolation: isolate;
          overflow: hidden;
        }
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
          font-size: clamp(4rem, 11vw, 10rem);
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
        .reveal-text.visible { opacity: 1; transform: translateY(0); }

        /* Scroll fade */
        .scroll-fade {
          opacity: 0;
          transform: translateY(36px);
          transition: opacity 0.9s var(--ease-expo), transform 0.9s var(--ease-expo);
        }
        .scroll-fade.visible { opacity: 1; transform: translateY(0); }
        .delay-1 { transition-delay: 100ms; }
        .delay-2 { transition-delay: 200ms; }
        .delay-3 { transition-delay: 320ms; }
        .delay-4 { transition-delay: 440ms; }

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
        .work-section { padding: 6rem 0; }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3rem; }
        .section-big-num {
          font-family: 'Syne', sans-serif;
          font-size: clamp(3rem, 7vw, 6rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: rgba(255,255,255,0.06);
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
        .project-row:hover .project-arrow { transform: rotate(-45deg) translate(4px,-4px); }
        .project-row:hover .project-num { color: var(--amber); }

        .project-left { display: flex; align-items: center; gap: 2.5rem; flex: 1; }
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
          display: flex; align-items: center; gap: 2rem; flex-shrink: 0;
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
        .services-section { padding: 6rem 0; }
        .services-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 1px solid var(--border);
        }
        .service-card {
          padding: 3rem;
          border: 1px solid var(--border);
          margin: -1px 0 0 -1px;
          transition: background 0.4s ease;
          cursor: none;
        }
        .service-card:hover { background: var(--surface); }
        .service-card:hover .service-explore { color: var(--amber); }
        .service-icon {
          font-size: 2rem;
          color: var(--muted);
          margin-bottom: 1.5rem;
          display: block;
          transition: color 0.3s ease;
        }
        .service-card:hover .service-icon { color: var(--amber); }
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
        .exp-section { padding: 6rem 0; }
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
        .contact-section { padding: 6rem 0 8rem; }
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
          color: var(--muted);
        }

        /* ── Responsive ────────────────────────────────────────────── */
        @media (max-width: 900px) {
          #main-nav { padding: 1.25rem 1.5rem; }
          .nav-links, .nav-available { display: none; }
          .ed-container { padding: 0 1.5rem; }
          .hero-sub { grid-template-columns: 1fr; }
          .hero-actions-block { align-items: flex-start; }
          .hero-buttons { justify-content: flex-start; }
          .services-grid { grid-template-columns: 1fr; }
          .ed-footer { flex-direction: column; gap: 1rem; padding: 1.5rem; text-align: center; }
          .project-tags { display: none; }
        }

        /* ── Scroll bar ────────────────────────────────────────────── */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--border); }
      `}</style>

      {/* ── Custom Cursor ────────────────────────────────────────── */}
      <div id="ed-cursor" ref={cursorRef} />

      {/* ── Navbar ───────────────────────────────────────────────── */}
      <nav id="main-nav">
        <a href="#home" className="nav-logo">NK.</a>
        <div className="nav-links">
          <a href="#work" className="nav-link">Work</a>
          <a href="#services" className="nav-link">Service</a>
          <a href="#experience" className="nav-link">Experience</a>
          <a href="#contact" className="nav-link">Contact</a>
        </div>
        <a href="#contact" className="nav-available">Available →</a>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section id="home" className="hero ed-container">
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

        <h1 className="hero-headline">
          <span className="line-light reveal-text">AI Engineer</span>
          <span className="line-bold reveal-text delay-1">Building the</span>
          <span className="line-bold reveal-text delay-2">
            Future<span className="accent-dot">.</span>
          </span>
        </h1>

        <div className="hero-sub scroll-fade delay-3">
          <p className="hero-description">
            I build voice AI, autonomous agents, and reliable RAG systems — bridging cutting-edge research and production-ready intelligent products.
          </p>
          <div className="hero-actions-block">
            <div className="hero-buttons" ref={buttonsRef}>
              <a href="#work" className="btn-solid">View Work</a>
              <a href="#contact" className="btn-ghost">Get In Touch</a>
            </div>
            <div className="hero-stats" ref={statsRef}>
              <ContributionCalendar />
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── Marquee ──────────────────────────────────────────────── */}
      <div className="marquee-wrapper">
        <div id="marquee-track" className="marquee-track">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="marquee-item" style={{ display: "flex", alignItems: "center", gap: "3rem" }}>
              <span>Voice AI</span><span style={{ color: "#F5A623" }}>✦</span>
              <span>RAG Systems</span><span style={{ color: "#F5A623" }}>✦</span>
              <span>Autonomous Agents</span><span style={{ color: "#F5A623" }}>✦</span>
              <span>Computer Vision</span><span style={{ color: "#F5A623" }}>✦</span>
              <span>Full-Stack AI</span><span style={{ color: "#F5A623" }}>✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Work Section ─────────────────────────────────────────── */}
      <section id="work" className="work-section ed-container">
        <div className="section-header scroll-fade">
          <div>
            <p className="section-label">— Selected Work</p>
            <p className="section-big-num">01</p>
          </div>
          <a
            href="https://github.com/nithincodesx"
            target="_blank" rel="noreferrer"
            className="btn-ghost"
            style={{ alignSelf: "flex-end" }}
          >
            All Projects →
          </a>
        </div>

        <div className="project-list">
          {PROJECTS.map((p, i) => (
            <a
              key={p.num}
              href={p.href}
              target="_blank" rel="noreferrer"
              className={`project-row scroll-fade delay-${(i % 4) + 1}`}
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
                <span className="material-symbols-outlined project-arrow" style={{ fontSize: "1.5rem" }}>arrow_forward</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ── Project Gallery (sticky image stack) ─────────────────────── */}
      <ProjectGallery images={galleryImages} />

      <div className="divider" />

      {/* ── Services ─────────────────────────────────────────────── */}
      <section id="services" className="services-section ed-container">
        <div className="section-header scroll-fade" style={{ marginBottom: "2.5rem" }}>
          <div>
            <p className="section-label">— What I Build</p>
            <p className="section-big-num">02</p>
          </div>
        </div>

        <div className="services-grid scroll-fade delay-1">
          {SERVICES.map((s) => (
            <div key={s.title} className="service-card" data-hover="">
              <span className="material-symbols-outlined service-icon">{s.icon}</span>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-desc">{s.desc}</p>
              <span className="service-explore">Explore →</span>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ── Experience ───────────────────────────────────────────── */}
      <section id="experience" className="exp-section ed-container">
        <div className="section-header scroll-fade" style={{ marginBottom: "2.5rem" }}>
          <div>
            <p className="section-label">— Journey</p>
            <p className="section-big-num">03</p>
          </div>
        </div>

        <div className="divider" />
        <table className="exp-table scroll-fade delay-1">
          <tbody>
            {EXPERIENCE.map((e) => (
              <tr key={e.period} className="exp-row">
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

      <div className="divider" />

      {/* ── Contact ──────────────────────────────────────────────── */}
      <section id="contact" className="contact-section ed-container">
        <p className="section-label scroll-fade" style={{ marginBottom: "2rem" }}>— Let&apos;s Talk</p>

        <h2 className="contact-headline scroll-fade delay-1">
          Let&apos;s Build<br />
          Something<br />
          <em>Intelligent.</em>
        </h2>

        <a href="mailto:codesnithin@gmail.com" className="contact-email scroll-fade delay-2">
          codesnithin@gmail.com
        </a>

        <div className="contact-actions scroll-fade delay-3">
          <a href="mailto:codesnithin@gmail.com" className="btn-solid">Send a Message →</a>
          <a href="/resume.pdf" target="_blank" rel="noreferrer" className="btn-ghost">Download CV ↓</a>
        </div>

        <div className="social-row scroll-fade delay-4">
          {[
            { label: "GitHub", href: "https://github.com/nithincodesx" },
            { label: "LinkedIn", href: "https://linkedin.com/in/nithincodes" },
            { label: "Instagram", href: "https://instagram.com/nithincodez" },
            { label: "Buy Me a Coffee", href: "https://buymeacoffee.com/nithincodes" },
          ].map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="social-link">
              {s.label}
              <span className="material-symbols-outlined" style={{ fontSize: "0.9rem" }}>arrow_outward</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="ed-footer">
        <a href="#home" className="footer-logo">NK.</a>
        <p className="footer-copy">Nithin Krishna © 2026</p>
        <p className="footer-copy">Design &amp; Development by NK</p>
      </footer>
    </div>
  );
}
