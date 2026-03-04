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
        red: "var(--color-red)",
        "red-dark": "var(--color-red-dark)",
        navy: "var(--color-navy)",
        steel: "var(--color-steel)",
        cream: "var(--color-cream)",
        "gray-warm": "var(--color-gray-warm)",
        "gray-mid": "var(--color-gray-mid)",
        charcoal: "var(--color-charcoal)",
        white: "var(--color-white)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        ui: ["var(--font-ui)"],
      },
    },
  },
  plugins: [],
};
export default config;
