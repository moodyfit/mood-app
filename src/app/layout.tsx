import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MoodProvider } from "@/lib/store";
import TopBar from "@/components/TopBar";
import TabBar from "@/components/TabBar";
import Toast from "@/components/Toast";
import TasteCardModal from "@/components/TasteCardModal";
import CapacitorInit from "@/components/CapacitorInit";

export const metadata: Metadata = {
  title: "무드핏 MOODFIT — 취향 번역기",
  description: "취향이 없는 게 아니다. 이름을 몰랐을 뿐. 느낌만 적으면 무드로 보여준다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head />
      <body className="font-sans">
        <MoodProvider>
          <div className="relative mx-auto flex min-h-screen max-w-frame flex-col bg-paper">
            <TopBar />
            <main className="flex-1 pb-24">{children}</main>
            <TabBar />
          </div>
          <Toast />
          <TasteCardModal />
          <CapacitorInit />
        </MoodProvider>
      </body>
    </html>
  );
}
