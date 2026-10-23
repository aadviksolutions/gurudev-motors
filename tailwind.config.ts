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
        gm: {
          navy: "#071B49",
          "navy-dark": "#031330",
          "navy-darker": "#020B1D",
          "navy-light": "#0E2866",
          red: "#E30613",
          "red-dark": "#B7050F",
          "red-light": "#FF2432",
          ink: "#101827",
          muted: "#667085",
          soft: "#F4F7FB",
          line: "#E3E8F0",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        gm: "0 20px 50px rgba(7, 27, 73, 0.12)",
        "gm-hover": "0 25px 60px rgba(7, 27, 73, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
