import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export type ModelProvider = "openai" | "anthropic";

const DEFAULT_MODEL_NAMES: Record<ModelProvider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-sonnet-5",
};

function getProvider(): ModelProvider {
  const provider = (process.env.MODEL_PROVIDER || "anthropic").toLowerCase();
  if (provider === "openai" || provider === "anthropic") return provider;
  throw new Error(
    `Unsupported MODEL_PROVIDER "${provider}". Use "openai" or "anthropic".`,
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
  }
}

export function isAiConfigured(): boolean {
  try {
    const provider = getProvider();
    return provider === "openai"
      ? Boolean(process.env.OPENAI_API_KEY)
      : Boolean(process.env.ANTHROPIC_API_KEY);
  } catch {
    return false;
  }
}
