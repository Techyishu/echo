import { NextRequest } from "next/server";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rl = checkRateLimit("start-conversation", getIP(request));
  if (!rl.allowed) {
    return Response.json(
      { error: rl.reason },
      { status: 429, headers: rl.retryAfterSeconds ? { "Retry-After": String(rl.retryAfterSeconds) } : {} }
    );
  }

  const { figureId } = await request.json();
  if (!figureId) {
    return Response.json({ error: "Figure ID is required." }, { status: 400 });
  }

  if (!process.env.ELEVENLABS_API_KEY) {
    return Response.json({ error: "ElevenLabs API key not configured." }, { status: 500 });
  }

  const agentId = process.env.ELEVENLABS_AGENT_ID;
  if (!agentId) {
    return Response.json({ error: "ElevenLabs Agent ID not configured." }, { status: 500 });
  }

  // Get a signed WebSocket URL from ElevenLabs
  const elevenRes = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${encodeURIComponent(agentId)}`,
    { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY } }
  );

  if (!elevenRes.ok) {
    const err = await elevenRes.json().catch(() => ({}));
    return Response.json(
      { error: `ElevenLabs error: ${(err as { detail?: string })?.detail ?? elevenRes.statusText}` },
      { status: 500 }
    );
  }

  const { signed_url } = await elevenRes.json() as { signed_url: string };

  return Response.json({ signedUrl: signed_url });
}
