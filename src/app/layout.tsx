import type { Metadata } from "next";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoriDrop",
  description: "友達の『今どんなノリ？』がわかるアプリ",
  icons: {
    icon: "/app-icon.png",
    apple: "/app-icon.png"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <LoadingOverlay />
        {children}
      </body>
    </html>
  );
}
