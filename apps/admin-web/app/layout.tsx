import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "K-12 Math Matrix Admin",
  description: "Admin console for content authoring, review, and publishing."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

