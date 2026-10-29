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
  // PWA 설치(FEAT-018) — manifest 자체는 app/manifest.ts가 자동 연결, 여기선 iOS 전용 메타만.
  // iOS Safari는 manifest.icons를 안 읽고 apple-touch-icon을 따로 봐서 명시가 필요하다.
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "무드핏",
  },
  icons: {
    // 루트 경로(코드리뷰 P2-2) — iOS 등이 <link> 없이도 기본으로 찾는 경로라 여기 하나로
    // 통일한다(바꿀 땐 이 파일 하나만 교체하면 됨, public/icons/apple-touch-icon.png 사본 없음).
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // manifest.ts의 theme_color와 동일(코드리뷰 P2-1) — 앱 배경(paper)과 같은 톤.
  themeColor: "#FAFAF8",
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
