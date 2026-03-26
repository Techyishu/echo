import { devStore } from "@/lib/dev-store";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function FigurePage(props: { params: Promise<{ figureId: string }> }) {
  const { figureId } = await props.params;
  const figure = devStore.figures.get(figureId);

  if (!figure) redirect("/explore");
  if (figure.status === "researching") {
    // Still loading — client will poll
    redirect(`/figure/${figureId}/loading`);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">

      {/* Back */}
      <Link
        href="/explore"
        className="font-mono text-[11px] tracking-wider text-muted-foreground hover:text-foreground uppercase transition-colors mb-8 inline-block"
      >
        ← Back to Explore
      </Link>

      {/* Header */}
      <div className="border-b border-border pb-8 mb-8">
        <div className="flex flex-wrap items-start gap-8">

          {/* Portrait */}
          {figure.imageUrl && (
            <div className="shrink-0 w-36 h-44 border border-border overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={figure.imageUrl}
                alt={figure.fullName}
                className="w-full h-full object-cover object-top"
              />
            </div>
          )}

          {/* Meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-[10px] tracking-widest text-primary uppercase border border-primary/30 px-2 py-0.5">
                {figure.occupation}
              </span>
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                {figure.nationality}
              </span>
            </div>
            <h1 className="font-display font-black text-4xl md:text-5xl text-foreground uppercase leading-none mb-2">
              {figure.fullName}
            </h1>
            <p className="font-mono text-sm text-muted-foreground mb-6">
              {figure.years} · {figure.era}
            </p>
            <Link
              href={`/figure/${figureId}/chat`}
              className="inline-flex items-center gap-3 bg-primary text-primary-foreground font-display font-bold px-8 py-4 text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors"
            >
              Start Conversation →
            </Link>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="mb-8 border border-border p-6">
        <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase mb-3">Biography</p>
        <p className="text-foreground/80 text-sm leading-relaxed">{figure.summary}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-px bg-border mb-8">
        {/* Personality */}
        <div className="bg-background p-6">
          <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase mb-4">Personality</p>
          <div className="flex flex-wrap gap-2">
            {figure.personality.map((trait) => (
              <span key={trait} className="font-mono text-[11px] tracking-wider border border-border text-muted-foreground px-2.5 py-1 uppercase">
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* Speech style */}
        <div className="bg-background p-6">
          <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase mb-4">Speech Style</p>
          <p className="text-muted-foreground text-sm leading-relaxed">{figure.speechStyle}</p>
        </div>
      </div>

      {/* Key beliefs */}
      <div className="border border-border p-6 mb-8">
        <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase mb-4">Key Beliefs</p>
        <div className="space-y-2">
          {figure.keyBeliefs.map((belief, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="font-mono text-[11px] text-primary shrink-0 mt-0.5">◆</span>
              <p className="text-foreground/80 text-sm leading-relaxed">{belief}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Famous quotes */}
      <div className="border border-border p-6 mb-8">
        <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase mb-4">Famous Quotes</p>
        <div className="space-y-4">
          {figure.famousQuotes.map((quote, i) => (
            <blockquote key={i} className="border-l-2 border-primary pl-4">
              <p className="text-foreground/80 text-sm leading-relaxed italic">&ldquo;{quote}&rdquo;</p>
            </blockquote>
          ))}
        </div>
      </div>

      {/* Suggested topics */}
      <div className="border border-border p-6 mb-10">
        <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase mb-4">Ask them about</p>
        <div className="flex flex-wrap gap-2">
          {figure.suggestedTopics.map((topic) => (
            <span key={topic} className="font-mono text-[11px] tracking-wider border border-border text-muted-foreground px-3 py-1.5 uppercase">
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border border-primary/20 bg-primary/5 p-8 text-center">
        <p className="font-mono text-[11px] tracking-widest text-primary uppercase mb-3">Ready?</p>
        <h2 className="font-display font-black text-3xl text-foreground uppercase mb-4">
          Talk to {figure.fullName.split(" ")[0]}<span className="text-primary">.</span>
        </h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
          Speak naturally — ask about their life, beliefs, discoveries, or anything you&apos;re curious about.
          They will respond as themselves, from their own time.
        </p>
        <Link
          href={`/figure/${figureId}/chat`}
          className="inline-flex items-center gap-3 bg-primary text-primary-foreground font-display font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors"
        >
          Start Voice Conversation →
        </Link>
      </div>

    </div>
  );
}
