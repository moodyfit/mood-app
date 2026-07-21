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
        // UI 가이드라인 v2 §3 — 무성의 갤러리(무채·웜오프화이트), 액센트=잉크 블랙
        paper: "#FAFAF8", // bg-primary
        "paper-2": "#F2F1EE", // bg-secondary (박스·시트)
        "paper-3": "#ECEAE4", // hover
        ink: "#1A1A1A", // ink-primary
        "ink-soft": "#8A8A86", // ink-secondary
        "ink-faint": "#B0AFA9",
        line: "#E7E5DF",
        accent: "#1A1A1A", // 잉크 블랙 (하트·CTA)
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
