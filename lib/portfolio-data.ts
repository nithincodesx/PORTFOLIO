import {
  Coffee,
  Eye,
  Github,
  Instagram,
  Linkedin,
  Mail,
  Mic,
  Network,
  Rocket
} from "lucide-react";
import type {
  Certification,
  ExperienceRow,
  NavItem,
  Project,
  Service,
  SocialLink,
  Stat
} from "@/types/portfolio";

export const navItems: NavItem[] = [
  { label: "Work", href: "#work" },
  { label: "Service", href: "#service" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" }
];

export const heroStats: Stat[] = [
  { label: "Open-source repos", value: "45+" },
  { label: "GitHub stars", value: "88+" },
  { label: "AI focus areas", value: "03" }
];

export const services: Service[] = [
  {
    number: "01",
    title: "Voice AI & Autonomous Agents",
    tagline: "Voice interfaces, tool-using agents, and multi-step workflows.",
    description:
      "I design voice-first experiences and agentic systems that can listen, reason, act, and verify their own output. From speech pipelines to planning loops, the goal is software that behaves like a capable teammate.",
    points: ["Voice assistants and audio pipelines", "Tool-using autonomous agents", "Planning, memory, and self-verification loops"],
    icon: Mic
  },
  {
    number: "02",
    title: "RAG & Reliable Retrieval",
    tagline: "Grounded answers from your own documents, without the hallucinations.",
    description:
      "Hybrid retrieval that combines dense vectors with BM25, layered over a verification agent that checks every claim against its source. Built for trust, not just relevance.",
    points: ["Hybrid BM25 + vector search", "Independent claim verification", "Evaluation-first retrieval tuning"],
    icon: Network
  },
  {
    number: "03",
    title: "Computer Vision Prototypes",
    tagline: "From raw video and images to working detection and tracking.",
    description:
      "Rapid vision prototypes — object detection, segmentation, and OCR — shipped as clean APIs with the monitoring habits of production ML.",
    points: ["Detection and segmentation", "OCR and document parsing", "On-device and cloud inference"],
    icon: Eye
  },
  {
    number: "04",
    title: "Full-Stack AI Products",
    tagline: "Polished interfaces and reliable backends around your models.",
    description:
      "End-to-end product build: Next.js frontends, FastAPI services, realtime data, and deployment. The kind of experience that lets an experiment graduate to production.",
    points: ["Next.js and FastAPI architecture", "Realtime data and Supabase", "CI/CD, Docker, and observability"],
    icon: Rocket
  }
];

export const projects: Project[] = [
  {
    number: "01",
    title: "Verified-Hybrid-Multi-Agent-RAG-System-v1",
    description:
      "Hybrid RAG combining BM25 and vector search with an LLM, plus an independent verification agent that checks claims against source documents to prevent hallucinations.",
    tags: ["RAG", "BM25", "Vector DB"],
    year: "2026",
    url: "https://github.com/nithincodesx/Verified-Hybrid-Multi-Agent-RAG-System-v1",
    points: [
      "Hybrid retrieval: BM25 + dense vectors fused into a single ranked result set",
      "Independent verification agent validates every claim against cited sources",
      "Built to be evaluated: retrieval and generation scored separately"
    ]
  },
  {
    number: "02",
    title: "AI-Agile-Retrospective-Facilitator",
    description:
      "RetroVibe: an AI facilitator that helps Agile teams surface emotional bottlenecks and build psychological safety through data-driven insights.",
    tags: ["Agents", "LLM"],
    year: "2025",
    url: "https://github.com/nithincodesx/AI-Agile-Retrospective-Facilitator",
    points: [
      "Analyzes retro transcripts for emotional signals and friction points",
      "Generates safe, specific discussion prompts for the team",
      "Tracks team health metrics across retros over time"
    ]
  },
  {
    number: "03",
    title: "Coraxis",
    description:
      "Autonomous multi-agent research platform: four specialised agents decompose a question, search and cross-check sources, score claims, and hand back a fully cited report you can watch stream live.",
    tags: ["Python", "FastAPI", "Multi-Agent"],
    year: "2026",
    url: "https://github.com/nithincodesx/Coraxis",
    points: [
      "Four-agent pipeline: Researcher → Web Searcher → Synthesis Analyst → Report Writer",
      "Resumable live progress — every event persisted with a sequence number before broadcast",
      "Stable citations, encrypted provider keys, and per-user semantic memory"
    ]
  },
  {
    number: "04",
    title: "CloudPulse-AI",
    description:
      "A SaaS-style infrastructure dashboard that turns real-time server telemetry into clear utilization and cost-saving signals.",
    tags: ["Python", "Supabase", "Analytics"],
    year: "2026",
    url: "https://github.com/nithincodesx/CloudPulse-AI",
    points: [
      "Tracks real-time server utilization and resource telemetry",
      "Flags budget anomalies and idle or over-provisioned infrastructure",
      "Logs operational data to Supabase for a clear audit trail"
    ]
  },
  {
    number: "05",
    title: "Cozy-Coffee-v1",
    description:
      "A full-stack community for coffee lovers: share favourite brews, review cafes on an interactive global map, and hold rich-text forum discussions.",
    tags: ["Next.js", "Supabase", "TypeScript"],
    year: "2026",
    url: "https://github.com/nithincodesx/Cozy-Coffee-v1",
    points: [
      "Interactive global cafe map built with Leaflet and react-leaflet",
      "Rich-text forums powered by Tiptap, animated with Framer Motion and GSAP",
      "Supabase for PostgreSQL data, realtime subscriptions, and authentication"
    ]
  }
];

export const experience: ExperienceRow[] = [
  {
    period: "2024 — Present",
    role: "AI Engineer",
    company: "Independent Projects",
    location: "Remote",
    stack: ["LLMs", "LangChain", "RAG", "Python"],
    points: [
      "Built hybrid RAG systems with verification agents to cut hallucinations",
      "Shipped voice AI and autonomous agent prototypes",
      "Adopted an evaluation-first workflow for every retrieval pipeline"
    ]
  },
  {
    period: "2023 — 2024",
    role: "Full-Stack Developer",
    company: "Applied AI Labs",
    location: "Remote",
    stack: ["Next.js", "FastAPI", "Supabase"],
    points: [
      "Delivered end-to-end AI apps from API to interface",
      "Built realtime data flows with Supabase",
      "Wrapped ML services in fast, reliable FastAPI endpoints"
    ]
  },
  {
    period: "2022 — 2023",
    role: "ML Builder",
    company: "Research and Experiments",
    location: "India",
    stack: ["Python", "PyTorch", "OpenCV"],
    points: [
      "Built and evaluated computer-vision and NLP prototypes from raw datasets",
      "Created repeatable data-preparation, training, and experiment-tracking workflows",
      "Turned research findings into clear, interactive demos for real-world feedback"
    ]
  }
];

export const certifications: Certification[] = [
  { title: "Machine Learning Foundations", issuer: "AI Track", year: "2022" },
  { title: "Deep Learning Systems", issuer: "Research Sprint", year: "2023" },
  { title: "Full-Stack AI Apps", issuer: "Build Lab", year: "2024" },
  { title: "Cloud and DevOps", issuer: "Engineering Core", year: "2025" }
];

export const socials: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/nithincodesx", icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/nithincodes/", icon: Linkedin },
  { label: "Instagram", href: "https://instagram.com/nithincodez", icon: Instagram },
  { label: "Buy Me a Coffee", href: "https://buymeacoffee.com/nithincodes", icon: Coffee },
  { label: "Email", href: "mailto:codesnithin@gmail.com", icon: Mail }
];

export const email = "codesnithin@gmail.com";
export const resumeUrl = "/resume.pdf";
