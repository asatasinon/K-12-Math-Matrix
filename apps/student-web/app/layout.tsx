import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "K-12 Math Matrix Student",
  description: "Student-facing learning portal for the K-12 Math Matrix platform."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

