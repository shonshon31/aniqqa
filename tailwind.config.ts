import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050507",
        panel: "#111116",
        line: "rgba(255,255,255,0.1)",
        brand: "#e50914",
        gold: "#f5c85c"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(229, 9, 20, 0.22)"
      },
      backgroundImage: {
        "cinema-fade": "linear-gradient(90deg, rgba(5,5,7,.98) 0%, rgba(5,5,7,.76) 45%, rgba(5,5,7,.18) 100%)",
        "bottom-fade": "linear-gradient(180deg, rgba(5,5,7,0) 0%, #050507 100%)"
      }
    }
  },
  plugins: []
};

export default config;
