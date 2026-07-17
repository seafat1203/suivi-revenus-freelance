import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f3efe4",
        vellum: "#e5ddcc",
        ink: "#26352f",
        moss: "#3f5d49",
        clay: "#b35f3d",
        brass: "#c18a37"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Arial", "sans-serif"]
      },
      boxShadow: {
        ledger: "0 18px 45px rgba(38, 53, 47, 0.11)"
      }
    }
  },
  plugins: []
};

export default config;
