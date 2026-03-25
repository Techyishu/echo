import { devStore } from "@/lib/dev-store";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TranscriptPage(props: { params: Promise<{ figureId: string }> }) {
  const { figureId } = await props.params;
  const figure = devStore.figures.get(figureId);

  if (!figure) redirect("/explore");

  const transcript = figure.transcript ?? [];
  const firstName = figure.fullName.split(" ")[0];

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">

      <Link
        href={`/figure/${figureId}`}
        className="font-mono text-[11px] tracking-wider text-muted-foreground hover:text-foreground uppercase transition-colors mb-8 inline-block"
      >
        ← {figure.fullName}
      </Link>

      {/* Header */}
      <div className="border-b border-border pb-6 mb-8">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase mb-2">
          Conversation Transcript
        </p>
        <h1 className="font-display font-black text-4xl text-foreground uppercase leading-none mb-1">
          {figure.fullName}<span className="text-primary">.</span>
        </h1>
        <p className="font-mono text-sm text-muted-foreground">
          {figure.years} · {figure.era}
        </p>
      </div>

      {/* Share URL */}
      <div className="border border-border p-4 mb-8 flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase shrink-0">
          Share
        </span>
        <code className="font-mono text-xs text-primary flex-1 truncate">
          /figure/{figureId}/transcript
        </code>
        <span className="font-mono text-[10px] text-muted-foreground/40">Public</span>
      </div>

      {/* Transcript */}
      {transcript.length === 0 ? (
        <div className="border border-dashed border-border p-10 text-center">
          <p className="font-mono text-[11px] text-muted-foreground tracking-wider">
            No transcript recorded for this conversation.
          </p>
        </div>
      ) : (
        <div className="border border-border divide-y divide-border mb-10">
          {transcript.map((entry, i) => (
            <div key={i} className={`px-5 py-4 flex gap-4 ${entry.role === "ai" ? "bg-primary/3" : ""}`}>
              <span className="font-mono text-[11px] text-muted-foreground/60 shrink-0 uppercase w-16 pt-0.5">
                {entry.role === "ai" ? firstName : "You"}
              </span>
              <p className="text-foreground/80 text-sm leading-relaxed">{entry.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/figure/${figureId}/chat`}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold px-8 py-3 text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors"
        >
          Talk to {firstName} again →
        </Link>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 border border-border text-muted-foreground font-mono text-[11px] tracking-widest uppercase px-6 py-3 hover:text-foreground hover:border-foreground/40 transition-colors"
        >
          Explore more figures
        </Link>
      </div>

    </div>
  );
}
