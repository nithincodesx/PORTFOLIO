import type { SiteConfig } from "@/lib/cms/types";

/**
 * Shipped defaults — these mirror the portfolio's original hardcoded content
 * exactly, so the public site looks identical whether or not Firebase is
 * connected. Any value not present in Firestore falls back to these.
 */
export const DEFAULT_SITE_CONFIG: SiteConfig = {
  hero: {
    headline: {
      line1: "AI Engineer",
      line2: "Building the",
      line3: "Future",
      accent: ".",
    },
    description:
      "I build voice AI, autonomous agents, and reliable RAG systems — bridging cutting-edge research and production-ready intelligent products.",
    primaryCta: { label: "View Work", href: "#work" },
    secondaryCta: { label: "Get In Touch", href: "#contact" },
  },

  about: {
    headline: "I build useful intelligence.",
    body: "I am an AI engineer focused on turning research ideas into dependable products. My work spans retrieval systems, autonomous workflows, voice interfaces, and the full-stack tooling that makes them useful in the real world.",
  },

  projects: {
    label: "— Selected Work",
    number: "01",
    allProjectsLabel: "All Projects →",
    allProjectsHref: "https://github.com/nithincodesx",
    items: [
      {
        num: "01",
        title: "Verified-Hybrid-Multi-Agent-RAG-System",
        tags: ["Retrieval", "Vector DB", "Agents"],
        year: "2026",
        url: "https://github.com/nithincodesx/Verified-Hybrid-Multi-Agent-RAG-System-v1",
        desc: "Hybrid BM25 + vector RAG with a verification agent that validates every claim — reducing hallucinations by 94%.",
      },
      {
        num: "02",
        title: "AI-Agile-Retrospective-Facilitator",
        tags: ["LLM", "Workflow"],
        year: "2025",
        url: "https://github.com/nithincodesx/AI-Agile-Retrospective-Facilitator",
        desc: "AI facilitator that surfaces emotional bottlenecks in Agile sprints using sentiment and commit velocity.",
      },
      {
        num: "03",
        title: "Coraxis",
        tags: ["Autonomous Agents", "FastAPI", "Python"],
        year: "2026",
        url: "https://github.com/nithincodesx/Coraxis",
        desc: "Four specialised agents research a topic end to end — decompose, search, cross-check sources, and hand back a cited report, streamed live.",
      },
      {
        num: "04",
        title: "CloudPulse-AI",
        tags: ["Python", "Supabase", "Analytics"],
        year: "2026",
        url: "https://github.com/nithincodesx/CloudPulse-AI",
        desc: "SaaS-style infrastructure dashboard that turns real-time telemetry into server utilization and cost-saving signals.",
      },
      {
        num: "05",
        title: "Cozy-Coffee-v1",
        tags: ["Next.js", "Supabase", "TypeScript"],
        year: "2026",
        url: "https://github.com/nithincodesx/Cozy-Coffee-v1",
        desc: "A full-stack community for coffee lovers — share favourite brews, review cafes on an interactive map, and hold rich-text forum discussions.",
      },
    ],
  },

  gallery: {
    enabled: true,
    label: "— Project Gallery",
    title: "Project Gallery",
    hint: "Scroll to stack ↓",
  },

  services: {
    label: "— What I Build",
    number: "02",
    items: [
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
    ],
  },

  experience: {
    label: "— Journey",
    number: "03",
    items: [
      {
        period: "2024 — Present",
        role: "AI Engineer",
        company: "Independent Projects",
        location: "Remote",
        stack: ["LLMs", "LangChain", "RAG", "Python"],
      },
      {
        period: "2023 — 2024",
        role: "Full-Stack Developer",
        company: "Applied AI Labs",
        location: "Remote",
        stack: ["Next.js", "FastAPI", "Supabase"],
      },
      {
        period: "2022 — 2023",
        role: "ML Builder",
        company: "Research & Experiments",
        location: "India",
        stack: ["Python", "PyTorch", "OpenCV"],
        summary:
          "Built and evaluated computer-vision and NLP prototypes, then translated experiments into clear, interactive demos.",
      },
    ],
  },

  skills: {
    items: [
      { name: "Python", level: "Core" },
      { name: "LLM Applications", level: "Core" },
      { name: "RAG & Retrieval", level: "Core" },
      { name: "FastAPI", level: "Working" },
      { name: "Next.js", level: "Working" },
      { name: "Docker", level: "Working" },
      { name: "Supabase", level: "Working" },
      { name: "Computer Vision", level: "Exploring" },
    ],
  },

  socials: {
    items: [
      { label: "GitHub", href: "https://github.com/nithincodesx" },
      { label: "LinkedIn", href: "https://linkedin.com/in/nithincodes" },
      { label: "Instagram", href: "https://instagram.com/nithincodez" },
      { label: "Buy Me a Coffee", href: "https://buymeacoffee.com/nithincodes" },
    ],
  },

  contact: {
    label: "— Let's Talk",
    headline: ["Let's Build", "Something", "Intelligent."],
    email: "codesnithin@gmail.com",
    messageLabel: "Send a Message →",
    cvLabel: "Download CV ↓",
    resumeUrl: "/resume.pdf",
  },

  content: {
    marquee: [
      "Voice AI",
      "RAG Systems",
      "Autonomous Agents",
      "Computer Vision",
      "Full-Stack AI",
    ],
    footer: {
      logo: "NK.",
      copyright: "Nithin Krishna © 2026",
      credit: "Design & Development by NK",
    },
  },

  theme: {
    accent: "#F5A623",
    accentDim: "#C78419",
    bg: "#0C0C0C",
    surface: "#141414",
  },

  music: {
    enabled: true,
    src: "/music/portfolio.mp3",
    label: "portfolio.mp3",
    defaultVolume: 0.6,
    loop: true,
    autoplay: true,
  },

  sections: [
    { id: "hero", label: "Hero", visible: true, order: 0, dividerAfter: true },
    { id: "marquee", label: "Marquee", visible: true, order: 1, dividerAfter: false },
    { id: "about", label: "About", visible: true, order: 2, dividerAfter: true },
    { id: "work", label: "Work / Projects", visible: true, order: 3, dividerAfter: true },
    { id: "gallery", label: "Project Gallery", visible: true, order: 4, dividerAfter: true },
    { id: "services", label: "Services", visible: true, order: 5, dividerAfter: true },
    { id: "experience", label: "Experience", visible: true, order: 6, dividerAfter: true },
    { id: "skills", label: "Skills", visible: true, order: 7, dividerAfter: true },
    { id: "contact", label: "Contact", visible: true, order: 8, dividerAfter: false },
  ],
};




