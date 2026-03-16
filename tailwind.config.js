/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold:    { DEFAULT: "#F5C518", light: "#FFD740", dark: "#C49A00" },
        navy:    { DEFAULT: "#0A0E1A", light: "#111827", card: "#141B2D" },
        accent:  { DEFAULT: "#00E5FF", dim: "#00B8CC" },
        success: "#00C853",
        danger:  "#FF1744",
      },
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "pulse-gold":  "pulseGold 2s ease-in-out infinite",
        "spin-slow":   "spin 8s linear infinite",
        "float":       "float 3s ease-in-out infinite",
        "countdown":   "countdownPop 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        "slide-up":    "slideUp 0.5s ease-out forwards",
        "glow":        "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        pulseGold: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(245,197,24,0.4)" },
          "50%":     { boxShadow: "0 0 0 16px rgba(245,197,24,0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%":     { transform: "translateY(-8px)" },
        },
        countdownPop: {
          "0%":   { transform: "scale(0.7)", opacity: "0" },
          "100%": { transform: "scale(1)",   opacity: "1" },
        },
        slideUp: {
          "0%":   { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        glow: {
          "0%":   { textShadow: "0 0 10px #F5C518, 0 0 20px #F5C518" },
          "100%": { textShadow: "0 0 20px #FFD740, 0 0 40px #FFD740, 0 0 60px #C49A00" },
        },
      },
      backgroundImage: {
        "hero-gradient":  "radial-gradient(ellipse at top, #1a1f35 0%, #0A0E1A 60%)",
        "card-gradient":  "linear-gradient(135deg, #141B2D 0%, #0d1220 100%)",
        "gold-gradient":  "linear-gradient(135deg, #F5C518 0%, #FFD740 50%, #C49A00 100%)",
        "ticket-pattern": "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(245,197,24,0.03) 10px, rgba(245,197,24,0.03) 20px)",
      },
    },
  },
  plugins: [],
};
