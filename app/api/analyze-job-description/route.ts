import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { generateGeminiJson, logGeminiModel } from "@/lib/gemini";

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
  logGeminiModel();

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

  try {
    const analysis = await generateGeminiJson({
      prompt: [
        "Analyze this job description for resume tailoring.",
        "Return only JSON matching the provided schema.",
        "Keep items concise, specific, and useful for ATS matching.",
        "",
        jobDescription,
      ].join("\n"),
      responseSchema: analysisSchema,
      temperature: 0.2,
    });

    return NextResponse.json({
      analysis: normalizeAnalysis(analysis),
    });
  } catch (reason) {
    const message =
      reason instanceof Error
        ? reason.message
        : "Gemini could not analyze the job description.";

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
