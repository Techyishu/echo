import { NextRequest } from "next/server";
import { devStore } from "@/lib/dev-store";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { randomUUID } from "crypto";

function toSlug(name: string) {
  return name.trim().replace(/\s+/g, "_");
}

function getEraStyle(yearStr: string): string {
  const match = yearStr.match(/(\d{3,4})/);
  if (!match) return "formal and period-appropriate language";
  const year = parseInt(match[1]);
  if (yearStr.includes("BC") || year < 500) return "ancient formal speech, translated into eloquent English, dignified and measured";
  if (year < 1500) return "medieval formal English, declarative and authoritative";
  if (year < 1700) return "Renaissance English, eloquent and philosophical";
  if (year < 1850) return "formal 18th/early-19th century English prose, refined and measured";
  if (year < 1950) return "formal late-19th/early-20th century speech, precise and authoritative";
  return "mid-20th century educated speech, thoughtful and articulate";
}

export async function POST(request: NextRequest) {
  const rl = checkRateLimit("research-figure", getIP(request));
  if (!rl.allowed) {
    return Response.json(
      { error: rl.reason },
      { status: 429, headers: rl.retryAfterSeconds ? { "Retry-After": String(rl.retryAfterSeconds) } : {} }
    );
  }

  const { name } = await request.json();
  if (!name?.trim()) {
    return Response.json({ error: "Name is required." }, { status: 400 });
  }

  const slug = toSlug(name.trim());

  // Return existing figure if already researched
  const existingId = devStore.slugs.get(slug);
  if (existingId) {
    const existing = devStore.figures.get(existingId);
    if (existing?.status === "ready") {
      return Response.json({ figureId: existingId });
    }
  }

  const figureId = randomUUID();
  const now = new Date().toISOString();

  // Create a placeholder record so the UI can show "researching..."
  devStore.figures.set(figureId, {
    id: figureId,
    name: name.trim(),
    slug,
    status: "researching",
    fullName: name.trim(),
    era: "",
    years: "",
    nationality: "",
    occupation: "",
    summary: "",
    personality: [],
    speechStyle: "",
    keyBeliefs: [],
    famousQuotes: [],
    suggestedTopics: [],
    systemPrompt: "",
    created_at: now,
  });
  devStore.slugs.set(slug, figureId);

  // ── 1. Firecrawl: scrape Wikipedia ──
  const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(slug)}`;
  let wikiMarkdown = "";

  try {
    const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: wikiUrl, formats: ["markdown"] }),
    });
    const scrapeData = await scrapeRes.json();
    if (scrapeData.success && scrapeData.data?.markdown) {
      // Trim to ~8000 chars to stay within GPT-4o context limits
      wikiMarkdown = (scrapeData.data.markdown as string).slice(0, 8000);
    }
  } catch {
    // Fall through — GPT-4o will use training data
  }

  // ── 2. Wikipedia: get photo ──
  let imageUrl = "";
  try {
    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,
      { headers: { "User-Agent": "Echo/1.0 (historical-figure chatbot)" } }
    );
    if (summaryRes.ok) {
      const summary = await summaryRes.json() as {
        thumbnail?: { source: string };
        originalimage?: { source: string };
      };
      imageUrl = summary.originalimage?.source ?? summary.thumbnail?.source ?? "";
    }
  } catch {
    // no photo — silently fall through
  }

  // ── 3. GPT-4o: extract persona ──
  const eraStyle = getEraStyle(""); // will be refined by GPT output

  const extractionPrompt = wikiMarkdown
    ? `Use the following Wikipedia content about ${name} to extract their persona:\n\n${wikiMarkdown}`
    : `Use your knowledge to describe ${name} accurately.`;

  const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are building a conversational AI persona for a historical figure. Extract accurate biographical data and write a rich system prompt that will make an AI voice agent convincingly embody this person.

Return ONLY valid JSON in this exact format:
{
  "fullName": "full historical name",
  "era": "era label e.g. '19th-century America'",
  "years": "e.g. '1809–1865'",
  "nationality": "nationality",
  "occupation": "primary role/occupation",
  "summary": "2–3 sentence factual biography",
  "personality": ["trait1", "trait2", "trait3", "trait4"],
  "speechStyle": "description of how they spoke and wrote",
  "keyBeliefs": ["belief1", "belief2", "belief3", "belief4", "belief5"],
  "famousQuotes": ["quote1", "quote2", "quote3"],
  "suggestedTopics": ["topic to ask them about 1", "topic 2", "topic 3", "topic 4", "topic 5"],
  "systemPrompt": "A detailed system prompt (400–600 words) that instructs an AI to speak AS this person in first person. Include: their speech patterns, era-appropriate vocabulary (${eraStyle}), core beliefs, how they would respond to questions, what topics excite them, what they would refuse to discuss or find puzzling (things from after their time). They must NEVER break character. They must speak as if it is their own era — they do not know about events after their death. They can speculate philosophically but cannot reference future technology or events."
}`,
        },
        {
          role: "user",
          content: extractionPrompt,
        },
      ],
    }),
  });

  if (!gptRes.ok) {
    devStore.figures.delete(figureId);
    devStore.slugs.delete(slug);
    return Response.json({ error: "Failed to research this figure. Check your OpenAI API key." }, { status: 500 });
  }

  const gptData = await gptRes.json();
  const raw = gptData.choices?.[0]?.message?.content ?? "";

  let parsed: {
    fullName: string; era: string; years: string; nationality: string;
    occupation: string; summary: string; personality: string[];
    speechStyle: string; keyBeliefs: string[]; famousQuotes: string[];
    suggestedTopics: string[]; systemPrompt: string;
  };

  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("no JSON");
    parsed = JSON.parse(match[0]);
  } catch {
    devStore.figures.delete(figureId);
    devStore.slugs.delete(slug);
    return Response.json({ error: "Failed to parse persona. Please try again." }, { status: 500 });
  }

  // Update the figure record with full data
  devStore.figures.set(figureId, {
    id: figureId,
    name: name.trim(),
    slug,
    status: "ready",
    ...parsed,
    imageUrl,
    created_at: now,
  });

  return Response.json({ figureId });
}
