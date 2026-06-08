import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

type JobDescriptionAnalysis = {
  roleTitle: string;
  requiredSkills: string[];
  preferredSkills: string[];
  keywords: string[];
  experienceRequirements: string[];
  responsibilities: string[];
};

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

const analysisSchema = {
  type: "OBJECT",
  properties: {
    roleTitle: { type: "STRING" },
    requiredSkills: { type: "ARRAY", items: { type: "STRING" } },
    preferredSkills: { type: "ARRAY", items: { type: "STRING" } },
    keywords: { type: "ARRAY", items: { type: "STRING" } },
    experienceRequirements: { type: "ARRAY", items: { type: "STRING" } },
    responsibilities: { type: "ARRAY", items: { type: "STRING" } },
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

const customizedResumeSchema = {
  type: "OBJECT",
  properties: {
    tailoredResumeText: { type: "STRING" },
    tailoringSummary: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["tailoredResumeText", "tailoringSummary"],
};

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function normalizeAnalysis(value: unknown): JobDescriptionAnalysis {
  const record =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};

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

function normalizeTerm(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueTerms(terms: string[]) {
  const seen = new Set<string>();

  return terms
    .map((term) => term.trim())
    .filter(Boolean)
    .filter((term) => {
      const normalized = normalizeTerm(term);

      if (!normalized || seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    });
}

function termExistsInResume(resumeText: string, term: string) {
  const normalizedResume = normalizeTerm(resumeText);
  const normalizedTerm = normalizeTerm(term);

  return Boolean(normalizedTerm && normalizedResume.includes(normalizedTerm));
}

function scoreTerms(resumeText: string, terms: string[]) {
  const unique = uniqueTerms(terms);
  const matched = unique.filter((term) => termExistsInResume(resumeText, term));
  const missing = unique.filter((term) => !termExistsInResume(resumeText, term));

  return {
    matched,
    missing,
    total: unique.length,
  };
}

async function callGemini(prompt: string, responseSchema: object) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
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
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.25,
          response_mime_type: "application/json",
          response_schema: responseSchema,
        },
      }),
    },
  );

  const body = (await response.json().catch(() => null)) as GeminiResponse | null;

  if (!response.ok) {
    throw new Error(
      body?.error?.message || "Gemini could not complete the request.",
    );
  }

  const text = body?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return JSON.parse(text) as unknown;
}

async function analyzeJobDescription(jobDescription: string) {
  const response = await callGemini(
    [
      "Analyze this job description for resume customization.",
      "Return only JSON matching the provided schema.",
      "Keep skills and keywords concise, specific, and deduplicated.",
      "",
      jobDescription,
    ].join("\n"),
    analysisSchema,
  );

  return normalizeAnalysis(response);
}

function calculateAtsMatch(resumeText: string, analysis: JobDescriptionAnalysis) {
  const required = scoreTerms(resumeText, analysis.requiredSkills);
  const preferred = scoreTerms(resumeText, analysis.preferredSkills);
  const keywords = scoreTerms(resumeText, analysis.keywords);
  const weightedTotal =
    required.total * 0.55 + preferred.total * 0.2 + keywords.total * 0.25;
  const weightedMatched =
    required.matched.length * 0.55 +
    preferred.matched.length * 0.2 +
    keywords.matched.length * 0.25;
  const overallScore =
    weightedTotal > 0 ? Math.round((weightedMatched / weightedTotal) * 100) : 0;

  return {
    overallScore,
    matchedSkills: uniqueTerms([
      ...required.matched,
      ...preferred.matched,
      ...keywords.matched,
    ]),
    missingSkills: uniqueTerms([
      ...required.missing,
      ...preferred.missing,
      ...keywords.missing,
    ]),
  };
}

function normalizeCustomizedResume(value: unknown) {
  const record =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    tailoredResumeText:
      typeof record.tailoredResumeText === "string"
        ? record.tailoredResumeText.trim()
        : "",
    tailoringSummary: asStringArray(record.tailoringSummary).slice(0, 5),
  };
}

async function customizeResume({
  resumeText,
  analysis,
  overallScore,
  matchedSkills,
  missingSkills,
}: {
  resumeText: string;
  analysis: JobDescriptionAnalysis;
  overallScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}) {
  const response = await callGemini(
    [
      "Create an ATS-friendly customized resume from the provided parsed resume text.",
      "Preserve factual experience. Do not invent employers, titles, dates, degrees, certifications, tools, metrics, or responsibilities that are not supported by the resume text.",
      "Improve keyword coverage only where the resume text supports it.",
      "Highlight relevant skills and experience for the target job description.",
      "Use clean plain-text resume formatting with clear section headings and concise bullets.",
      "Return only JSON matching the provided schema.",
      "",
      `Target role: ${analysis.roleTitle}`,
      `ATS match score: ${overallScore}`,
      `Required skills: ${analysis.requiredSkills.join(", ") || "None"}`,
      `Preferred skills: ${analysis.preferredSkills.join(", ") || "None"}`,
      `Keywords: ${analysis.keywords.join(", ") || "None"}`,
      `Experience requirements: ${analysis.experienceRequirements.join("; ") || "None"}`,
      `Responsibilities: ${analysis.responsibilities.join("; ") || "None"}`,
      `Matched skills: ${matchedSkills.join(", ") || "None"}`,
      `Missing skills: ${missingSkills.join(", ") || "None"}`,
      "",
      "Parsed resume text:",
      resumeText,
    ].join("\n"),
    customizedResumeSchema,
  );

  const customized = normalizeCustomizedResume(response);

  if (!customized.tailoredResumeText) {
    throw new Error("Gemini returned an empty customized resume.");
  }

  return customized;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { resumeId?: string; jobDescription?: string }
      | null;

    const resumeId = body?.resumeId?.trim();
    const jobDescription = body?.jobDescription?.trim();

    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume selection is required." },
        { status: 400 },
      );
    }

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required." },
        { status: 400 },
      );
    }

    if (jobDescription.length > 20000) {
      return NextResponse.json(
        {
          error:
            "Job description is too long. Please keep it under 20,000 characters.",
        },
        { status: 400 },
      );
    }

    const supabase = await createServerClient();
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id, name, parsed_text")
      .eq("id", resumeId)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json(
        { error: resumeError?.message || "Resume not found." },
        { status: 404 },
      );
    }

    const resumeText =
      typeof resume.parsed_text === "string" ? resume.parsed_text : "";

    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: "Selected resume does not have parsed text yet." },
        { status: 400 },
      );
    }

    const analysis = await analyzeJobDescription(jobDescription);
    const match = calculateAtsMatch(resumeText, analysis);
    const customized = await customizeResume({
      resumeText,
      analysis,
      overallScore: match.overallScore,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
    });

    return NextResponse.json({
      resumeName: resume.name,
      roleTitle: analysis.roleTitle,
      overallScore: match.overallScore,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      tailoredResumeText: customized.tailoredResumeText,
      tailoringSummary: customized.tailoringSummary,
    });
  } catch (reason) {
    const message =
      reason instanceof Error
        ? reason.message
        : "Unable to customize resume.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
