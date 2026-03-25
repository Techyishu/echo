import Link from "next/link";

const FEATURED = [
  { name: "Albert Einstein", years: "1879–1955", tag: "Physicist", },
  { name: "Nikola Tesla", years: "1856–1943", tag: "Inventor" },
  { name: "Marie Curie", years: "1867–1934", tag: "Scientist" },
  { name: "Abraham Lincoln", years: "1809–1865", tag: "President" },
  { name: "Cleopatra", years: "69–30 BC", tag: "Pharaoh" },
  { name: "Leonardo da Vinci", years: "1452–1519", tag: "Polymath" },
  { name: "Napoleon Bonaparte", years: "1769–1821", tag: "Emperor" },
  { name: "Ada Lovelace", years: "1815–1852", tag: "Mathematician" },
];

const TICKER = [
  "ALBERT EINSTEIN", "CLEOPATRA", "NIKOLA TESLA", "MARIE CURIE",
  "ABRAHAM LINCOLN", "NAPOLEON BONAPARTE", "LEONARDO DA VINCI", "ADA LOVELACE",
  "JULIUS CAESAR", "CHARLES DARWIN", "ISAAC NEWTON", "SOCRATES",
];

export default function HomePage() {
  const tickerItems = [...TICKER, ...TICKER];

  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 border-b border-border">
        <p className="font-mono text-[11px] tracking-[0.25em] text-primary uppercase mb-6">
          ● Live — Voice AI × History
        </p>
        <h1
          className="font-display font-black text-foreground leading-[0.9] mb-8 uppercase"
          style={{ fontSize: "clamp(4rem, 13vw, 10rem)" }}
        >
          Hear<br />
          History<span className="text-primary">.</span><br />
          Speak<span className="text-primary">.</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl leading-relaxed mb-10">
          Have a real voice conversation with any historical figure — powered by live research
          and AI voice synthesis. Ask Einstein about relativity. Debate Lincoln on democracy.
          Hear Cleopatra&apos;s side of history.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/explore"
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground font-display font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors"
          >
            Start a Conversation →
          </Link>
          <p className="font-mono text-[11px] text-muted-foreground tracking-wider">
            No login required — free to try
          </p>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="border-b border-border py-3 overflow-hidden bg-primary/5">
        <div className="flex animate-marquee whitespace-nowrap">
          {tickerItems.map((name, i) => (
            <span key={i} className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase mx-8">
              {name} ◆
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED FIGURES ── */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-b border-border">
        <div className="flex items-baseline justify-between mb-10">
          <p className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
            Featured Figures
          </p>
          <Link href="/explore" className="font-mono text-[11px] tracking-wider text-primary hover:text-primary/80 uppercase transition-colors">
            Search any figure →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          {FEATURED.map((figure) => (
            <Link
              key={figure.name}
              href={`/explore?q=${encodeURIComponent(figure.name)}`}
              className="group bg-background p-6 hover:bg-primary/5 transition-colors flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-widest text-primary uppercase border border-primary/30 px-2 py-0.5">
                  {figure.tag}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground/40 group-hover:text-primary transition-colors">
                  →
                </span>
              </div>
              <div>
                <p className="font-display font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors">
                  {figure.name}
                </p>
                <p className="font-mono text-[11px] text-muted-foreground mt-1">
                  {figure.years}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-b border-border">
        <p className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground uppercase mb-10">
          How It Works
        </p>
        <div className="grid md:grid-cols-3 gap-px bg-border">
          {[
            {
              step: "01",
              title: "Research",
              body: "We scrape Wikipedia and historical records to build a deep, accurate persona grounded in documented facts.",
              tag: "Powered by Firecrawl",
            },
            {
              step: "02",
              title: "Synthesize",
              body: "GPT-4o extracts their personality, speech patterns, beliefs, and era-accurate vocabulary to construct a faithful persona.",
              tag: "Powered by GPT-4o",
            },
            {
              step: "03",
              title: "Converse",
              body: "Talk to them in real time via voice. Ask anything — they respond as themselves, from their own time and perspective.",
              tag: "Powered by ElevenLabs",
            },
          ].map(({ step, title, body, tag }) => (
            <div key={step} className="bg-background p-8 group">
              <span
                className="font-display font-black text-primary/10 group-hover:text-primary/25 transition-colors block leading-none mb-6"
                style={{ fontSize: "clamp(4rem, 8vw, 6rem)" }}
              >
                {step}
              </span>
              <p className="font-display font-bold text-foreground text-xl mb-3">{title}</p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{body}</p>
              <span className="font-mono text-[10px] tracking-wider text-primary/60 uppercase border border-primary/20 px-2 py-0.5">
                {tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-3 gap-px bg-border">
          {[
            { value: "∞", label: "Historical Figures" },
            { value: "3", label: "APIs, One Experience" },
            { value: "~15s", label: "To First Response" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-background p-8 text-center">
              <p className="font-display font-black text-primary text-5xl md:text-6xl mb-2">{value}</p>
              <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">{label}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
