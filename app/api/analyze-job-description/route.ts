import { NextResponse } from "next/server";

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

type JobDescriptionAnalysis = {
  roleTitle: string;
  requiredSkills: string[];
  preferredSkills: string[];
  keywords: string[];
  experienceRequirements: string[];
  responsibilities: string[];
};

const analysisSchema = {
  type: "OBJECT",
  properties: {
    roleTitle: { type: "STRING" },
    requiredSkills: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    preferredSkills: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    keywords: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    experienceRequirements: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    responsibilities: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
  },
  required: [
    "roleTitle",
    "requiredSkills",
    "preferredSkills",
    "keywords",
    "experienceRequirements",
    "responsibilities",
  ],
};

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function normalizeAnalysis(value: unknown): JobDescriptionAnalysis {
  const data = value && typeof value === "object" ? value : {};
  const record = data as Record<string, unknown>;

  return {
    roleTitle:
      typeof record.roleTitle === "string" ? record.roleTitle : "Not specified",
    requiredSkills: asStringArray(record.requiredSkills),
    preferredSkills: asStringArray(record.preferredSkills),
    keywords: asStringArray(record.keywords),
    experienceRequirements: asStringArray(record.experienceRequirements),
    responsibilities: asStringArray(record.responsibilities),
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY environment variable." },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const jobDescription =
    body && typeof body.jobDescription === "string"
      ? body.jobDescription.trim()
      : "";

  if (!jobDescription) {
    return NextResponse.json(
      { error: "Job description is required." },
      { status: 400 },
    );
  }

  if (jobDescription.length > 20000) {
    return NextResponse.json(
      { error: "Job description is too long. Please keep it under 20,000 characters." },
      { status: 400 },
    );
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
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
            parts: [
              {
                text: [
                  "Analyze this job description for resume tailoring.",
                  "Return only JSON matching the provided schema.",
                  "Keep items concise, specific, and useful for ATS matching.",
                  "",
                  jobDescription,
                ].join("\n"),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          response_mime_type: "application/json",
          response_schema: analysisSchema,
        },
      }),
    },
  );

  const geminiResponse = (await response.json().catch(() => null)) as
    | GeminiResponse
    | null;

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          geminiResponse?.error?.message ||
          "Gemini could not analyze the job description.",
      },
      { status: response.status },
    );
  }

  const text = geminiResponse?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    return NextResponse.json(
      { error: "Gemini returned an empty analysis." },
      { status: 502 },
    );
  }

  try {
    return NextResponse.json({
      analysis: normalizeAnalysis(JSON.parse(text)),
    });
  } catch {
    return NextResponse.json(
      { error: "Gemini returned invalid JSON." },
      { status: 502 },
    );
  }
}
