import type { ReactNode } from "react";
import { Noto_Sans_KR, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { ImpersonationBanner } from "../components/ImpersonationBanner";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"]
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"]
});

export const metadata = {
  title: "ITEM ODIN",
  description:
    "게임 아이템, 게임머니, 계정 거래를 위한 마켓 서비스"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable} ${plusJakartaSans.variable}`}>
        <ImpersonationBanner />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
