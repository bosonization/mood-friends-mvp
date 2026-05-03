import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "eMoodition",
  description: "友達だけに10分セッションの気分を共有するアプリ",
  icons: {
    icon: "/app-icon.png",
    apple: "/app-icon.png"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
