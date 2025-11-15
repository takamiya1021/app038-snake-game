import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "スネークゲーム",
  description: "AI搭載スネークゲーム - プレイスタイル分析とAI対戦機能",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased bg-gradient-to-b from-slate-900 to-black text-white">
        {children}
      </body>
    </html>
  );
}
