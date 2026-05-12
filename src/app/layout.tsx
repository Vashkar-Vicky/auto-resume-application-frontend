import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "AutoApply — LinkedIn auto-apply on autopilot",
  description:
    "Run LinkedIn auto-apply with live progress streaming and screenshot capture.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
