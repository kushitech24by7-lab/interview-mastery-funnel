import type { Config } from "tailwindcss";

/**
 * Visual identity (brief §42): premium career education / professional publishing.
 * Deep navy + professional blue + muted teal, with a single warm accent reserved
 * for CTAs and key concepts so the accent never loses its meaning.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f2f5fa",
          100: "#e3eaf4",
          200: "#c3d2e7",
          300: "#94aed2",
          400: "#5e82b7",
          500: "#3d629d",
          600: "#2e4d82",
          700: "#263e69",
          800: "#1d2f4f",
          900: "#132038",
          950: "#0b1424",
        },
        blue: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        teal: {
          50: "#f0fbf9",
          100: "#d7f3ee",
          200: "#b0e6de",
          300: "#7fd2c8",
          400: "#4bb5ab",
          500: "#2f9992",
          600: "#237b77",
          700: "#1f6260",
          800: "#1c4e4d",
          900: "#194140",
        },
        amber: {
          50: "#fff9ed",
          100: "#fff1d4",
          200: "#ffdfa8",
          300: "#ffc771",
          400: "#ffa738",
          500: "#fb8c12",
          600: "#ec6d08",
          700: "#c35109",
          800: "#9b400f",
          900: "#7d3610",
        },
        ink: {
          DEFAULT: "#1a2230",
          soft: "#46536b",
          faint: "#6b7891",
        },
sand: "#f7f8fb",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        // Mobile-first fluid scale (brief §40): readable at 360px without media queries.
        "fluid-xs": "clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem)",
        "fluid-sm": "clamp(0.875rem, 0.85rem + 0.15vw, 0.9375rem)",
        "fluid-base": "clamp(1rem, 0.96rem + 0.2vw, 1.0625rem)",
        "fluid-lg": "clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem)",
        "fluid-xl": "clamp(1.25rem, 1.12rem + 0.6vw, 1.5rem)",
        "fluid-2xl": "clamp(1.5rem, 1.3rem + 0.95vw, 2rem)",
        "fluid-3xl": "clamp(1.875rem, 1.55rem + 1.5vw, 2.75rem)",
        "fluid-4xl": "clamp(2.125rem, 1.6rem + 2.4vw, 3.5rem)",
      },
      maxWidth: {
        prose: "68ch",
      },
      borderRadius: {
        xl2: "1.125rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(11, 20, 36, 0.04), 0 8px 24px -12px rgba(11, 20, 36, 0.18)",
        lift: "0 2px 6px rgba(11, 20, 36, 0.06), 0 24px 48px -24px rgba(11, 20, 36, 0.35)",
        cover: "0 12px 28px -12px rgba(11, 20, 36, 0.55)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
