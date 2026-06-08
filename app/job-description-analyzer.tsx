"use client";

import { useState } from "react";

type JobDescriptionAnalysis = {
  roleTitle: string;
  requiredSkills: string[];
  preferredSkills: string[];
  keywords: string[];
  experienceRequirements: string[];
  responsibilities: string[];
};

const emptyAnalysis: JobDescriptionAnalysis = {
  roleTitle: "",
  requiredSkills: [],
  preferredSkills: [],
  keywords: [],
  experienceRequirements: [],
  responsibilities: [],
};

export function JobDescriptionAnalyzer() {
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] =
    useState<JobDescriptionAnalysis>(emptyAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyzeJobDescription() {
    const trimmedJobDescription = jobDescription.trim();

    setMessage(null);
    setError(null);

    if (!trimmedJobDescription) {
      setError("Paste a job description before analyzing.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze-job-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobDescription: trimmedJobDescription }),
      });

      const result = (await response.json()) as {
        analysis?: JobDescriptionAnalysis;
        error?: string;
      };

      if (!response.ok || !result.analysis) {
        throw new Error(result.error || "Unable to analyze job description.");
      }

      setAnalysis(result.analysis);
      setMessage("Job description analyzed successfully.");
    } catch (reason) {
      const analyzeMessage =
        reason instanceof Error
          ? reason.message
          : "Unable to analyze job description.";
      setError(analyzeMessage);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const hasAnalysis = Boolean(analysis.roleTitle);

  return (
    <section
      id="job-description-analyzer"
      className="border-t border-slate-200 bg-white px-6 py-16 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
            Job Description Analyzer
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Extract the signals that matter
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Paste a job description and ResumePilot AI will identify the role,
            skills, keywords, experience needs, and responsibilities to guide
            resume tailoring.
          </p>
        </div>

        <div className="mt-12 flex flex-col items-start gap-8 lg:flex-row">
          <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:w-[45%]">
            <label
              htmlFor="job-description"
              className="text-sm font-semibold text-slate-800"
            >
              Job Description
            </label>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              rows={12}
              placeholder="Paste the full job description here..."
              className="mt-3 min-h-72 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[var(--brand-accent)] focus:ring-4 focus:ring-[var(--brand-accent-muted)]"
            />
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={analyzeJobDescription}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(68,55,66,0.22)] transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-[rgba(68,55,66,0.24)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze JD"}
            </button>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                {jobDescription.trim().length.toLocaleString()} characters
              </p>
              <p className="text-xs text-slate-500">Step 1 of 3</p>
            </div>
            {message ? (
              <p className="mt-3 text-sm font-medium text-[var(--brand-success)]">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="mt-3 text-sm font-medium text-red-700">{error}</p>
            ) : null}
          </div>

          <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:w-[55%]">
            {hasAnalysis ? (
              <div className="space-y-4">
                <AnalysisCard title="Role Title" items={[analysis.roleTitle]} />
                <AnalysisCard title="Required Skills" items={analysis.requiredSkills} />
                <AnalysisCard title="Preferred Skills" items={analysis.preferredSkills} />
                <AnalysisCard title="Keywords" items={analysis.keywords} isCompact />
                <AnalysisCard
                  title="Experience Requirements"
                  items={analysis.experienceRequirements}
                />
                <AnalysisCard
                  title="Responsibilities"
                  items={analysis.responsibilities}
                />
              </div>
            ) : (
              <SkeletonResultPanel title="JD analysis preview" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SkeletonResultPanel({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-xs text-slate-500">
            Results populate here after analysis.
          </p>
        </div>
        <div className="h-9 w-9 rounded-lg bg-[var(--brand-accent-muted)]" />
      </div>
      <div className="mt-5 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="h-3 w-28 rounded-full bg-slate-200" />
          <div className="mt-4 h-4 w-3/4 rounded-full bg-slate-100" />
        </div>
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="h-3 w-32 rounded-full bg-slate-200" />
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="h-7 w-24 rounded-full bg-slate-100" />
              <div className="h-7 w-32 rounded-full bg-slate-100" />
              <div className="h-7 w-20 rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalysisCard({
  title,
  items,
  isCompact = false,
}: {
  title: string;
  items: string[];
  isCompact?: boolean;
}) {
  const visibleItems = items.length ? items : ["Not specified"];

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      <div className={isCompact ? "mt-3 flex flex-wrap gap-2" : "mt-3 space-y-2"}>
        {visibleItems.map((item) =>
          isCompact ? (
            <span
              key={item}
              className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
            >
              {item}
            </span>
          ) : (
            <p
              key={item}
              className="rounded-lg bg-white px-3 py-2 text-sm leading-6 text-slate-700 ring-1 ring-slate-200"
            >
              {item}
            </p>
          ),
        )}
      </div>
    </article>
  );
}
