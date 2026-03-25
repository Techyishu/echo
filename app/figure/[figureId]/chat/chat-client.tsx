"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Conversation } from "@11labs/client";

interface ChatClientProps {
  figureId: string;
  figureName: string;
  occupation: string;
  suggestedTopics: string[];
}

type Phase = "ready" | "loading" | "active" | "ended";
type Mode = "listening" | "speaking" | "idle";
interface TranscriptEntry { role: "user" | "ai"; message: string; }

export function ChatClient({ figureId, figureName, occupation, suggestedTopics }: ChatClientProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [mode, setMode] = useState<Mode>("idle");
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const conversationRef = useRef<Awaited<ReturnType<typeof Conversation.startSession>> | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const firstName = figureName.split(" ")[0];

  const startConversation = useCallback(async () => {
    setPhase("loading");
    setError("");

    // Microphone permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access is required. Please allow it in your browser and try again.");
      setPhase("ready");
      return;
    }

    // Get signed URL + persona from our API
    let signedUrl: string;
    let personaPrompt: string;
    let firstMessage: string;
    try {
      const res = await fetch("/api/start-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ figureId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not start the conversation.");
        setPhase("ready");
        return;
      }
      signedUrl = data.signedUrl;
      personaPrompt = data.personaPrompt;
      firstMessage = data.firstMessage;
    } catch {
      setError("Could not connect to the voice service.");
      setPhase("ready");
      return;
    }

    transcriptRef.current = [];

    // Connect to ElevenLabs
    try {
      const conv = await Conversation.startSession({
        signedUrl,
        overrides: {
          agent: {
            prompt: { prompt: personaPrompt },
            firstMessage,
          },
        },
        onConnect: ({ conversationId }) => {
          console.log("[Echo] connected:", conversationId);
          setPhase("active");
        },
        onMessage: ({ message, source }) => {
          const entry: TranscriptEntry = { role: source, message };
          transcriptRef.current.push(entry);
          setTranscript([...transcriptRef.current]);
        },
        onStatusChange: ({ status }) => {
          console.log("[Echo] status:", status);
          if (status === "disconnected") {
            setPhase((prev) => {
              if (prev === "active") return "ended";
              if (prev === "loading") {
                setError("Could not connect. Please try again.");
                return "ready";
              }
              return prev;
            });
            setMode("idle");
          }
        },
        onModeChange: ({ mode: m }) => {
          setMode(m as unknown as Mode);
        },
        onDebug: (info) => console.log("[Echo] debug:", info),
        onError: (msg, ctx) => {
          console.error("[Echo] error:", msg, ctx);
          setError(`Connection error: ${String(msg)}`);
          setPhase("ready");
        },
      });
      conversationRef.current = conv;
      setPhase((prev) => prev === "loading" ? "active" : prev);
    } catch {
      setError("Failed to connect. Please try again.");
      setPhase("ready");
    }
  }, [figureId]);

  const endConversation = useCallback(async () => {
    await conversationRef.current?.endSession();
    conversationRef.current = null;
    setPhase("ended");
  }, []);

  const getTranscript = useCallback(() => transcriptRef.current, []);

  // ── READY ──
  if (phase === "ready") {
    return (
      <div className="space-y-8">
        <div className="border border-border p-8 text-center">
          <div className="w-20 h-20 border-2 border-primary/30 rounded-full mx-auto flex items-center justify-center mb-6">
            <span className="font-display font-black text-2xl text-primary/60">
              {firstName.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <h2 className="font-display font-black text-3xl md:text-4xl text-foreground uppercase leading-none mb-3">
            {firstName}<span className="text-primary">.</span>
          </h2>
          <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase mb-6">
            {occupation}
          </p>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed mb-8">
            Speak naturally. Ask anything — about their life, work, beliefs, or their era.
            They will respond as themselves.
          </p>

          {error && (
            <div className="mb-4 font-mono text-xs text-destructive border border-destructive/20 bg-destructive/5 px-4 py-3 text-left max-w-sm mx-auto">
              ERROR — {error}
            </div>
          )}

          <button
            onClick={startConversation}
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground font-display font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors"
          >
            Connect to {firstName} →
          </button>
        </div>

        {suggestedTopics.length > 0 && (
          <div>
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase mb-3">
              Ask them about
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedTopics.map((topic) => (
                <span key={topic} className="font-mono text-[11px] tracking-wider border border-border text-muted-foreground px-3 py-1.5 uppercase">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── LOADING ──
  if (phase === "loading") {
    return (
      <div className="border border-border p-16 flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="font-mono text-xs text-muted-foreground tracking-wider">
          Connecting to {firstName}…
        </p>
      </div>
    );
  }

  // ── ACTIVE ──
  if (phase === "active") {
    return (
      <div className="space-y-4">
        <div className="border border-primary/30 bg-primary/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="font-mono text-[11px] tracking-wider text-primary uppercase">
                Live — Speaking with {firstName}
              </span>
            </div>
            <button
              onClick={endConversation}
              className="font-mono text-[11px] tracking-wider uppercase border border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground px-3 py-1.5 transition-colors"
            >
              End
            </button>
          </div>

          {/* Voice indicator */}
          <div className="flex flex-col items-center gap-4 py-6">
            <div
              className={`w-24 h-24 border-2 rounded-full flex items-center justify-center transition-all duration-300 ${
                mode === "speaking"
                  ? "border-primary bg-primary/10 scale-110"
                  : mode === "listening"
                  ? "border-foreground/40 bg-foreground/5 scale-105"
                  : "border-border"
              }`}
            >
              {mode === "speaking" && (
                <div className="flex gap-1 items-end h-8">
                  {[3, 5, 7, 5, 3].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-primary rounded-sm animate-pulse"
                      style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
              {mode === "listening" && (
                <div className="w-8 h-8 border-2 border-foreground/40 rounded-full animate-pulse" />
              )}
              {mode === "idle" && (
                <span className="font-display font-black text-xl text-border">
                  {firstName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <p className="font-display font-bold text-foreground text-lg">
              {mode === "speaking" && `${firstName} is speaking…`}
              {mode === "listening" && "Your turn — speak now"}
              {mode === "idle" && "Waiting…"}
            </p>
          </div>
        </div>

        {/* Live transcript */}
        {transcript.length > 0 && (
          <div className="border border-border divide-y divide-border max-h-64 overflow-y-auto">
            {transcript.map((entry, i) => (
              <div key={i} className={`px-4 py-3 flex gap-3 ${entry.role === "ai" ? "bg-primary/3" : ""}`}>
                <span className="font-mono text-[10px] text-muted-foreground/60 shrink-0 uppercase w-16 pt-0.5">
                  {entry.role === "ai" ? firstName : "You"}
                </span>
                <p className="text-sm text-foreground/80 leading-relaxed">{entry.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── ENDED ──
  return (
    <ConversationEnded
      figureId={figureId}
      firstName={firstName}
      getTranscript={getTranscript}
    />
  );
}

function ConversationEnded({
  figureId,
  firstName,
  getTranscript,
}: {
  figureId: string;
  firstName: string;
  getTranscript: () => TranscriptEntry[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveAndShare() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/save-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ figureId, transcript: getTranscript() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save.");
        setSaving(false);
        return;
      }
      router.push(`/figure/${figureId}/transcript`);
    } catch {
      setError("Failed to save. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="border border-border p-12 text-center">
      <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase mb-4">
        Conversation Ended
      </p>
      <h2 className="font-display font-black text-3xl md:text-4xl text-foreground uppercase leading-none mb-4">
        Back to the present<span className="text-primary">.</span>
      </h2>
      <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto">
        Your conversation with {firstName} has ended. Save and share the transcript, or start another.
      </p>
      {error && (
        <p className="mb-4 font-mono text-xs text-destructive border border-destructive/20 bg-destructive/5 px-4 py-2 max-w-sm mx-auto">
          ERROR — {error}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={saveAndShare}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold px-8 py-3 text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save & Share Transcript →"}
        </button>
        <a
          href="/explore"
          className="inline-flex items-center gap-2 border border-border text-muted-foreground font-mono text-[11px] tracking-widest uppercase px-6 py-3 hover:text-foreground hover:border-foreground/40 transition-colors"
        >
          Talk to someone else
        </a>
      </div>
    </div>
  );
}
