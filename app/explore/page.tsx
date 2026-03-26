import { Suspense } from "react";
import { ExploreClient } from "./explore-client";

export default function ExplorePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground uppercase mb-4">
        Echo — Explore
      </p>
      <h1 className="font-display font-black text-4xl md:text-5xl text-foreground uppercase leading-none mb-3">
        Who do you want<br />to talk to<span className="text-primary">?</span>
      </h1>
      <p className="text-muted-foreground text-sm mb-12 max-w-lg">
        Enter any historical figure — politician, scientist, artist, philosopher, ruler.
        We&apos;ll research them and connect you in seconds.
      </p>

      <Suspense>
        <ExploreClient />
      </Suspense>

      {/* Suggestions */}
      <div className="mt-16">
        <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase mb-4">
          Popular choices
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "Albert Einstein", "Marie Curie", "Nikola Tesla", "Abraham Lincoln",
            "Cleopatra", "Leonardo da Vinci", "Napoleon Bonaparte", "Ada Lovelace",
            "Charles Darwin", "Socrates", "Julius Caesar", "Isaac Newton",
            "Galileo Galilei", "Martin Luther King Jr.", "Winston Churchill",
          ].map((name) => (
            <ExploreChip key={name} name={name} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ExploreChip({ name }: { name: string }) {
  return (
    <span
      data-name={name}
      className="explore-chip font-mono text-[11px] tracking-wider border border-border text-muted-foreground px-3 py-1.5 uppercase cursor-pointer hover:border-primary hover:text-primary transition-colors"
    >
      {name}
    </span>
  );
}
