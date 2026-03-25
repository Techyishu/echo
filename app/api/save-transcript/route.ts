import { NextRequest } from "next/server";
import { devStore } from "@/lib/dev-store";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rl = checkRateLimit("save-transcript", getIP(request));
  if (!rl.allowed) {
    return Response.json({ error: rl.reason }, { status: 429 });
  }

  const { figureId, transcript } = await request.json();

  if (!figureId) {
    return Response.json({ error: "Figure ID is required." }, { status: 400 });
  }

  const figure = devStore.figures.get(figureId);
  if (!figure) {
    return Response.json({ error: "Figure not found." }, { status: 404 });
  }

  figure.transcript = Array.isArray(transcript) ? transcript : [];
  devStore.figures.set(figureId, figure);

  return Response.json({ success: true, shareUrl: `/figure/${figureId}/transcript` });
}
