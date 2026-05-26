"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "🏟️" },
  { href: "/team-war-room", label: "Team War Room", icon: "⚾" },
  { href: "/fantasy-war-room", label: "Fantasy War Room", icon: "🏆" },
  { href: "/ballpark-rank", label: "Ballpark Rank", icon: "🎯" },
  { href: "/goats", label: "GOATs", icon: "🐐" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[oklch(0.11_0.025_145)]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="text-2xl">⚾</span>
            <span className="text-white">The{" "}</span>
            <span className="text-red-500">WAR</span>
            <span className="text-white">{" "}Room</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-red-600/20 text-red-400"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-md p-2 text-gray-300 hover:bg-white/5"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-white/10 pb-3 pt-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-red-600/20 text-red-400"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
