"use client";

import Link from "next/link";
import { User } from "@supabase/supabase-js";

interface NavbarProps {
  user: User | null;
}

export function Navbar({ user: _user }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-6 h-6 bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-display font-black text-[10px] leading-none">
              EC
            </span>
          </div>
          <span className="font-mono text-[11px] tracking-[0.14em] text-foreground/80 uppercase group-hover:text-foreground transition-colors">
            Echo
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/explore"
            className="px-3 py-1.5 font-mono text-[11px] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/explore"
            className="px-4 py-1.5 font-mono text-[11px] tracking-[0.1em] uppercase bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
          >
            Start Talking →
          </Link>
        </div>
      </div>
    </nav>
  );
}
