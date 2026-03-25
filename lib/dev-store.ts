/**
 * In-memory store for Echo — persists across Next.js hot reloads via a Node.js global.
 */

export interface StoredFigure {
  id: string;
  name: string;
  slug: string;              // URL-safe version of name
  status: "researching" | "ready";

  // Research output
  fullName: string;
  era: string;               // e.g. "19th-century America"
  years: string;             // e.g. "1809–1865"
  nationality: string;
  occupation: string;
  summary: string;           // 2–3 sentence bio
  personality: string[];     // trait list
  speechStyle: string;       // description of how they spoke
  keyBeliefs: string[];
  famousQuotes: string[];
  suggestedTopics: string[];
  systemPrompt: string;      // full prompt sent to ElevenLabs agent

  // Transcript (saved after conversation)
  transcript?: { role: "user" | "ai"; message: string }[];

  created_at: string;
}

interface Store {
  figures: Map<string, StoredFigure>;   // keyed by figureId
  slugs: Map<string, string>;           // slug → figureId (for dedup)
}

declare global {
  // eslint-disable-next-line no-var
  var __echoStore: Store | undefined;
}

const devStore: Store = global.__echoStore ?? {
  figures: new Map(),
  slugs: new Map(),
};

if (!global.__echoStore) global.__echoStore = devStore;

export { devStore };

export const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_project_url" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your_supabase_anon_key";
