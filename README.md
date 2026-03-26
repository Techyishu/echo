# Echo

Talk to any historical figure — live, with your voice.

Echo is a web app that researches any historical figure in seconds and connects you to a real-time voice conversation with them, powered by their actual biography, beliefs, and speech patterns.

**Built for ElevenHacks** with:
- **Firecrawl** — scrapes Wikipedia for real biographical data
- **GPT-4o** — builds a complete persona with speech style and personality
- **ElevenLabs Conversational AI** — hosts live two-way voice conversation

## How It Works

1. Type any historical figure's name
2. Firecrawl scrapes their Wikipedia page → returns structured markdown
3. GPT-4o extracts personality, beliefs, speech style → generates a system prompt
4. ElevenLabs Conversational AI becomes that person → you talk, they respond
5. Every conversation gets a shareable public URL

## Tech Stack

- Next.js (App Router) · TypeScript · Tailwind CSS v4
- Firecrawl API · OpenAI · ElevenLabs Conversational AI
