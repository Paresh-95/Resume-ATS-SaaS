import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export type ModelProvider = "openai" | "anthropic" | "groq";

const DEFAULT_MODEL_NAMES: Record<ModelProvider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-sonnet-5",
  groq: "llama-3.3-70b-versatile",
};

function getProvider(): ModelProvider {
  const provider = (process.env.MODEL_PROVIDER || "anthropic").toLowerCase();
  if (provider === "openai" || provider === "anthropic" || provider === "groq")
    return provider;
  throw new Error(
    `Unsupported MODEL_PROVIDER "${provider}". Use "openai", "anthropic", or "groq".`,
  );
}

/**
 * Vendor-agnostic chat model factory. Swapping providers is a single env var
 * change (MODEL_PROVIDER + MODEL_NAME) — no application code depends on the
 * concrete LangChain integration package.
 */
export async function getChatModel(options?: {
  temperature?: number;
}): Promise<BaseChatModel> {
  const provider = getProvider();
  const modelName = process.env.MODEL_NAME || DEFAULT_MODEL_NAMES[provider];
  const temperature = options?.temperature ?? 0.3;

  switch (provider) {
    case "openai": {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error(
          "OPENAI_API_KEY is not set. Add it to .env to use MODEL_PROVIDER=openai.",
        );
      }
      const { ChatOpenAI } = await import("@langchain/openai");
      return new ChatOpenAI({
        model: modelName,
        temperature,
        apiKey: process.env.OPENAI_API_KEY,
      }) as unknown as BaseChatModel;
    }
    case "anthropic": {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error(
          "ANTHROPIC_API_KEY is not set. Add it to .env to use MODEL_PROVIDER=anthropic.",
        );
      }
      const { ChatAnthropic } = await import("@langchain/anthropic");
      return new ChatAnthropic({
        model: modelName,
        temperature,
        apiKey: process.env.ANTHROPIC_API_KEY,
      }) as unknown as BaseChatModel;
    }
    case "groq": {
      if (!process.env.GROQ_API_KEY) {
        throw new Error(
          "GROQ_API_KEY is not set. Add it to .env to use MODEL_PROVIDER=groq.",
        );
      }
      const { ChatGroq } = await import("@langchain/groq");
      return new ChatGroq({
        model: modelName,
        temperature,
        apiKey: process.env.GROQ_API_KEY,
      }) as unknown as BaseChatModel;
    }
  }
}

const API_KEY_ENV_VAR: Record<ModelProvider, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  groq: "GROQ_API_KEY",
};

export function isAiConfigured(): boolean {
  try {
    const provider = getProvider();
    return Boolean(process.env[API_KEY_ENV_VAR[provider]]);
  } catch {
    return false;
  }
}
