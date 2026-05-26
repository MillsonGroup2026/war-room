import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import QueryProvider from "@/components/QueryProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The WAR Room — MLB Analytics",
  description: "Advanced MLB analytics for General Managers and Fantasy Baseball players",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10 py-4 text-center text-xs text-muted-foreground">
            <p>
              The WAR Room — Data provided by{" "}
              <a href="https://statsapi.mlb.com" className="text-red-400 hover:underline">
                MLB Stats API
              </a>{" "}
              &amp;{" "}
              <a href="https://baseballsavant.mlb.com" className="text-red-400 hover:underline">
                Baseball Savant
              </a>
              . WAR values are approximated.
            </p>
          </footer>
        </QueryProvider>
      </body>
    </html>
  );
}
