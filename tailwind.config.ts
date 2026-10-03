import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#1A1A1A",
        surface: "#F5F5F5",
        "surface-dark": "#242424",
        "surface-darker": "#1A1A1A",
        accent: "#4ADE80",
        "accent-foreground": "#1A1A1A",
        muted: "#6B7280",
        border: "#E5E5E5",
        "border-dark": "#333333"
      },
      borderRadius: {
        glass: "24px",
        frame: "16px"
      },
      boxShadow: {
        frame: "0 25px 80px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08)",
        card: "0 2px 12px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 30px rgba(0, 0, 0, 0.12)",
        glow: "0 0 42px rgba(74, 222, 128, 0.24)"
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["SFMono-Regular", "Cascadia Code", "Consolas", "monospace"],
        display: ["Inter", "SF Pro Display", "system-ui", "sans-serif"]
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" }
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.4s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
