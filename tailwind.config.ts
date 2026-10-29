import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: "#ffffff",
          surface: "#f8fafc",
          dark: "#0b1329",
          navy: "#0f172a",
          border: "#000000",
          lime: "#c4f128",
          limeLight: "#d8fb48",
          blue: "#1d4ed8",
          blueDark: "#1e40af",
          blueLight: "#3b82f6",
          yellow: "#fbbf24",
          lavender: "#818cf8",
          lavenderLight: "#93c5fd",
          mint: "#86efac",
          coral: "#f87171",
        },
      },
      boxShadow: {
        neo: "4px 4px 0px 0px #000000",
        "neo-sm": "2px 2px 0px 0px #000000",
        "neo-lg": "6px 6px 0px 0px #000000",
        "neo-xl": "8px 8px 0px 0px #000000",
        "neo-hover": "6px 6px 0px 0px #000000",
        "neo-active": "1px 1px 0px 0px #000000",
        "neo-lime": "4px 4px 0px 0px #c4f128",
      },
      borderWidth: {
        neo: "2px",
        "neo-thick": "3px",
      },
      fontFamily: {
        heading: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-plus-jakarta-sans)", "sans-serif"],
        sans: ["var(--font-plus-jakarta-sans)", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
