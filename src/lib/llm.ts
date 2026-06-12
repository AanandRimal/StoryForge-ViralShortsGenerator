import Anthropic from "@anthropic-ai/sdk";

export type LlmProvider = "groq" | "anthropic";

const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const CLAUDE_MODEL = "claude-haiku-3-20240307";

let anthropicClient: Anthropic | null = null;

export function extractJson<T>(text: string): T {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(candidate) as T;
}

export function resolveLlmProvider(): LlmProvider {
  const explicit = process.env.LLM_PROVIDER?.toLowerCase();
  if (explicit === "groq" || explicit === "anthropic") {
    return explicit;
  }
  if (process.env.GROQ_API_KEY?.trim()) return "groq";
  if (process.env.ANTHROPIC_API_KEY?.trim()) return "anthropic";
  throw new Error(
    "No LLM API key configured — set GROQ_API_KEY or ANTHROPIC_API_KEY in .env",
  );
}

async function callGroq(params: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
      max_tokens: params.maxTokens ?? 4096,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errBody}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned no text content");
  }
  return content;
}

async function callAnthropic(params: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey });
  }

  const response = await anthropicClient.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: params.maxTokens ?? 4096,
    system: params.system,
    messages: [{ role: "user", content: params.user }],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("Claude returned no text content");
  }
  return block.text;
}

/** Unified LLM call — uses Groq or Anthropic based on LLM_PROVIDER / available keys. */
export async function callLlm(params: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const provider = resolveLlmProvider();
  if (provider === "groq") {
    return callGroq(params);
  }
  return callAnthropic(params);
}

export function getLlmProviderLabel(): string {
  try {
    return resolveLlmProvider() === "groq" ? "Groq" : "Claude Haiku";
  } catch {
    return "LLM";
  }
}
