"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function ExploreClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState(searchParams.get("q") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-submit if ?q= param is set
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setName(q);
      handleResearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wire up the chip buttons rendered by the server component
  useEffect(() => {
    const chips = document.querySelectorAll(".explore-chip");
    const handler = (e: Event) => {
      const chipName = (e.currentTarget as HTMLElement).dataset.name ?? "";
      setName(chipName);
      inputRef.current?.focus();
    };
    chips.forEach((c) => c.addEventListener("click", handler));
    return () => chips.forEach((c) => c.removeEventListener("click", handler));
  }, []);

  async function handleResearch(overrideName?: string) {
    const target = (overrideName ?? name).trim();
    if (!target) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/research-figure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: target }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      router.push(`/figure/${data.figureId}`);
    } catch {
      setError("Could not connect. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Terminal-style input */}
      <div className="border border-border focus-within:border-primary/60 transition-colors">
        <div className="flex items-center px-5 py-4 gap-4">
          <span className="font-mono text-primary text-sm shrink-0">›</span>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleResearch()}
            placeholder="Type a historical figure's name…"
            className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
            autoFocus
          />
          <button
            onClick={() => handleResearch()}
            disabled={loading || !name.trim()}
            className="shrink-0 bg-primary text-primary-foreground font-display font-bold px-6 py-2 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                Researching…
              </span>
            ) : (
              "Research →"
            )}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-3 font-mono text-xs text-destructive border border-destructive/20 bg-destructive/5 px-4 py-2">
          ERROR — {error}
        </p>
      )}

      {loading && (
        <div className="mt-6 border border-border p-5 space-y-2">
          <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            Researching…
          </p>
          {[
            "Scraping Wikipedia via Firecrawl",
            "Extracting personality & speech patterns",
            "Building era-accurate persona",
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin" style={{ animationDelay: `${i * 0.2}s` }} />
              <span className="font-mono text-[11px] text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
