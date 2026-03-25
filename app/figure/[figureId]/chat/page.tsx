import { devStore } from "@/lib/dev-store";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChatClient } from "./chat-client";

export default async function ChatPage(props: { params: Promise<{ figureId: string }> }) {
  const { figureId } = await props.params;
  const figure = devStore.figures.get(figureId);

  if (!figure || figure.status !== "ready") redirect(`/figure/${figureId}`);

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">

      <div className="flex items-center justify-between mb-8">
        <Link
          href={`/figure/${figureId}`}
          className="font-mono text-[11px] tracking-wider text-muted-foreground hover:text-foreground uppercase transition-colors"
        >
          ← {figure.fullName}
        </Link>
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          {figure.era}
        </span>
      </div>

      <ChatClient
        figureId={figureId}
        figureName={figure.fullName}
        occupation={figure.occupation}
        suggestedTopics={figure.suggestedTopics}
      />
    </div>
  );
}
