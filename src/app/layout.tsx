import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MoodProvider } from "@/lib/store";
import TopBar from "@/components/TopBar";
import TabBar from "@/components/TabBar";
import Toast from "@/components/Toast";
import TasteCardModal from "@/components/TasteCardModal";

export const metadata: Metadata = {
  title: "무드핏 MOODFIT — 취향 번역기",
  description: "취향이 없는 게 아니다. 이름을 몰랐을 뿐. 느낌만 적으면 무드로 보여준다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://fastly.jsdelivr.net/gh/wanteddev/wanted-sans@1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <MoodProvider>
          <div className="relative mx-auto flex min-h-screen max-w-frame flex-col bg-paper">
            <TopBar />
            <main className="flex-1">{children}</main>
            <TabBar />
          </div>
          <Toast />
          <TasteCardModal />
        </MoodProvider>
      </body>
    </html>
  );
}
