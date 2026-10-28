// ### importação do tipo de configuração do tailwind ###
import type { Config } from "tailwindcss";

// ### definição do design system sonora com estética dark premium ###
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        obsidian: {
          950: "#040508",
          900: "#07090E",
          850: "#0B0E17",
          800: "#101522",
          750: "#151C2D",
          700: "#1C253B",
          600: "#273352",
        },
        sonora: {
          purple: "#7C3AED",
          indigo: "#6366F1",
          fuchsia: "#C026D3",
          rose: "#F43F5E",
          amber: "#F59E0B",
          orange: "#EA580C",
          cyan: "#06B6D4",
          emerald: "#10B981",
        },
      },
      boxShadow: {
        glow: "0 0 50px -10px rgba(124, 58, 237, 0.45)",
        "glow-lg": "0 0 80px -15px rgba(124, 58, 237, 0.5)",
        "glow-orange": "0 0 50px -10px rgba(234, 88, 12, 0.4)",
        "glow-cyan": "0 0 50px -10px rgba(6, 182, 212, 0.35)",
        card: "0 24px 60px -20px rgba(0, 0, 0, 0.8)",
      },
      backgroundImage: {
        "grad-sonora": "linear-gradient(135deg, #7C3AED 0%, #C026D3 50%, #F43F5E 100%)",
        "grad-voice": "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
        "grad-scribe": "linear-gradient(135deg, #EA580C 0%, #F59E0B 100%)",
        "grad-cool": "linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)",
        "grad-surface": "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-up": "slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        wave: "wave 1.2s ease-in-out infinite",
        shimmer: "shimmer 5s linear infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};

// ### exportação da configuração para o compilador tailwind ###
export default config;
