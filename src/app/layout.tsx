import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "aniqqa",
  description: "Netflix-inspired anime streaming powered by AnimeKoto.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#050507",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <footer className="fixed inset-x-0 bottom-2 z-30 text-center text-[10px] text-white/35">
          niqqa shon
        </footer>
      </body>
    </html>
  );
}
