type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const RETRY_DELAYS_MS = [0, 2000, 4000];

let hasLoggedGeminiModel = false;

export function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export function logGeminiModel() {
  if (hasLoggedGeminiModel) {
    return;
  }

  const model = getGeminiModel();
  const source = process.env.GEMINI_MODEL?.trim() ? "GEMINI_MODEL" : "fallback";

  console.log(`[ResumePilot][gemini] Using model: ${model}`, { source });
  hasLoggedGeminiModel = true;
}

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function isTemporaryGeminiError(status: number, message: string) {
  const normalizedMessage = message.toLowerCase();

  return (
    status === 429 ||
    status === 503 ||
    status === 504 ||
    normalizedMessage.includes("overloaded") ||
    normalizedMessage.includes("overload") ||
    normalizedMessage.includes("high demand") ||
    normalizedMessage.includes("temporarily unavailable") ||
    normalizedMessage.includes("try again later")
  );
}

export async function generateGeminiJson({
  prompt,
  responseSchema,
  temperature,
}: {
  prompt: string;
  responseSchema?: object;
  temperature: number;
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  logGeminiModel();

  const model = getGeminiModel();
  let lastErrorMessage = "The AI model could not complete the request.";

  for (let attemptIndex = 0; attemptIndex < RETRY_DELAYS_MS.length; attemptIndex += 1) {
    const attempt = attemptIndex + 1;
    const delayMs = RETRY_DELAYS_MS[attemptIndex];

    if (delayMs > 0) {
      console.log("[ResumePilot][gemini] Retrying Gemini request", {
        model,
        attempt,
        delayMs,
      });
      await delay(delayMs);
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature,
            response_mime_type: "application/json",
            ...(responseSchema ? { response_schema: responseSchema } : {}),
          },
        }),
      },
    );

    const body = (await response.json().catch(() => null)) as GeminiResponse | null;
    const errorMessage =
      body?.error?.message || "The AI model could not complete the request.";

    if (!response.ok) {
      lastErrorMessage = errorMessage;

      if (
        attempt < RETRY_DELAYS_MS.length &&
        isTemporaryGeminiError(response.status, errorMessage)
      ) {
        console.warn("[ResumePilot][gemini] Temporary Gemini error", {
          model,
          attempt,
          status: response.status,
          error: errorMessage,
        });
        continue;
      }

      throw new Error(errorMessage);
    }

    const text = body?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!text) {
      throw new Error("The AI model returned an empty response.");
    }

    return JSON.parse(text) as unknown;
  }

  throw new Error(lastErrorMessage);
}
