import type { Config } from "tailwindcss";

// UI 가이드라인 §1~§2 토큰을 Tailwind 테마로 노출
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FFFFFF",
        "paper-2": "#F4F4F5",
        "paper-3": "#ECECEE",
        ink: "#0E0E10",
        "ink-soft": "#6A6A6E",
        "ink-faint": "#A0A0A4",
        line: "#E6E6E8",
        accent: "#000000",
      },
      fontFamily: {
        // 국문: Wanted Sans / 영문·숫자: Space Grotesk
        sans: [
          "Wanted Sans Variable",
          "Wanted Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
        latin: ["Space Grotesk", "Wanted Sans Variable", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "12px",
      },
      maxWidth: {
        frame: "430px",
      },
    },
  },
  plugins: [],
};

export default config;
