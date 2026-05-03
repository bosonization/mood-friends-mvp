import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mood Friends MVP",
  description: "友達だけに今の気分とラストログインを共有するMVP"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
