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
  return value.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").replace(/\s+/g, " ").trim();
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

  if (!normalizedTerm) {
    return false;
  }

  return normalizedResume.includes(normalizedTerm);
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

async function callGemini(prompt: string, responseSchema?: object) {
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
          temperature: 0.2,
          response_mime_type: "application/json",
          ...(responseSchema ? { response_schema: responseSchema } : {}),
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
      "Analyze this job description for resume ATS matching.",
      "Return only JSON matching the provided schema.",
      "Keep skills and keywords concise, specific, and deduplicated.",
      "",
      jobDescription,
    ].join("\n"),
    analysisSchema,
  );

  return normalizeAnalysis(response);
}

async function getRecommendations({
  roleTitle,
  overallScore,
  matchedSkills,
  missingSkills,
}: {
  roleTitle: string;
  overallScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}) {
  const response = await callGemini(
    [
      "Create concise resume improvement recommendations based on this ATS match result.",
      "Return JSON only with a recommendations array of 3 to 5 strings.",
      "",
      `Role title: ${roleTitle}`,
      `Overall match score: ${overallScore}`,
      `Matched skills: ${matchedSkills.join(", ") || "None"}`,
      `Missing skills: ${missingSkills.join(", ") || "None"}`,
    ].join("\n"),
    {
      type: "OBJECT",
      properties: {
        recommendations: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
      },
      required: ["recommendations"],
    },
  );

  const record =
    response && typeof response === "object"
      ? (response as Record<string, unknown>)
      : {};

  return asStringArray(record.recommendations).slice(0, 5);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { resumeId?: string; jobDescription?: string }
      | null;

    const resumeId = body?.resumeId?.trim();
    const jobDescription = body?.jobDescription?.trim();

    console.log("[ResumePilot][ats-match] Score request received", {
      resumeId,
      jobDescriptionLength: jobDescription?.length || 0,
    });

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

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id, name, parsed_text")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json(
        { error: resumeError?.message || "Resume not found." },
        { status: 404 },
      );
    }

    const resumeText =
      typeof resume.parsed_text === "string" ? resume.parsed_text : "";

    console.log("[ResumePilot][ats-match] Resume loaded", {
      resumeId: resume.id,
      resumeName: resume.name,
      parsedTextLength: resumeText.length,
      hasParsedText: resumeText.trim().length > 0,
    });

    if (!resumeText.trim()) {
      console.error("[ResumePilot][ats-match] Selected resume has empty parsed_text", {
        resumeId: resume.id,
        resumeName: resume.name,
      });

      return NextResponse.json(
        { error: "Selected resume does not have parsed text yet." },
        { status: 400 },
      );
    }

    const analysis = await analyzeJobDescription(jobDescription);
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
    const matchedSkills = uniqueTerms([
      ...required.matched,
      ...preferred.matched,
      ...keywords.matched,
    ]);
    const missingSkills = uniqueTerms([
      ...required.missing,
      ...preferred.missing,
      ...keywords.missing,
    ]);
    const recommendations = await getRecommendations({
      roleTitle: analysis.roleTitle,
      overallScore,
      matchedSkills,
      missingSkills,
    });

    return NextResponse.json({
      roleTitle: analysis.roleTitle,
      overallScore,
      matchedSkills,
      missingSkills,
      recommendations,
    });
  } catch (reason) {
    const message =
      reason instanceof Error ? reason.message : "Unable to calculate ATS score.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
