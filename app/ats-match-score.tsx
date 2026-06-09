"use client";

import { useState } from "react";

type ResumeOption = {
  id: string;
  name: string;
  file_name: string;
};

type AtsMatchResult = {
  roleTitle: string;
  overallScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
};

export function AtsMatchScore({
  resumes,
  isAuthenticated,
}: {
  resumes: ResumeOption[];
  isAuthenticated: boolean;
}) {
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AtsMatchResult | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function calculateScore() {
    setMessage(null);
    setError(null);

    if (!isAuthenticated) {
      window.location.href = "/login?reason=personal-resumes";
      return;
    }

    if (!selectedResumeId) {
      setError("Select a resume before calculating a match score.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Paste a job description before calculating a match score.");
      return;
    }

    setIsScoring(true);

    try {
      const response = await fetch("/api/ats-match-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobDescription,
        }),
      });
      const payload = (await response.json()) as AtsMatchResult & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to calculate ATS score.");
      }

      setResult(payload);
      setMessage("ATS match score calculated successfully.");
    } catch (reason) {
      const scoreMessage =
        reason instanceof Error ? reason.message : "Unable to calculate ATS score.";
      setError(scoreMessage);
    } finally {
      setIsScoring(false);
    }
  }

  return (
    <section
      id="ats-match-score"
      className="border-t border-slate-200 bg-slate-50 px-6 py-16 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
            ATS Match Score
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Compare your resume to a job description
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Select a parsed resume, paste a job description, and see deterministic
            skill matching with AI-powered recommendations.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <label
              htmlFor="ats-resume"
              className="text-sm font-semibold text-slate-800"
            >
              Resume
            </label>
            <select
              id="ats-resume"
              value={selectedResumeId}
              onChange={(event) => setSelectedResumeId(event.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-[var(--brand-accent)] focus:ring-4 focus:ring-[var(--brand-accent-muted)]"
            >
              {resumes.length ? (
                resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.name}
                  </option>
                ))
              ) : (
                <option value="">Upload a resume first</option>
              )}
            </select>

            <label
              htmlFor="ats-job-description"
              className="mt-6 block text-sm font-semibold text-slate-800"
            >
              Job Description
            </label>
            <textarea
              id="ats-job-description"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              rows={13}
              placeholder="Paste the target job description here..."
              className="mt-3 min-h-72 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[var(--brand-accent)] focus:ring-4 focus:ring-[var(--brand-accent-muted)]"
            />

            <button
              type="button"
              disabled={isScoring}
              onClick={calculateScore}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(68,55,66,0.22)] transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-[rgba(68,55,66,0.24)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
              {isScoring ? "Calculating..." : "Calculate Match Score"}
            </button>

            {message ? (
              <p className="mt-3 text-sm font-medium text-[var(--brand-success)]">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="mt-3 text-sm font-medium text-red-700">{error}</p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            {isScoring ? (
              <SkeletonScorePanel />
            ) : result ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Overall Match Score
                  </p>
                  <div className="mt-4 flex items-end gap-3">
                    <p className="text-6xl font-bold tracking-tight text-slate-900">
                      {result.overallScore}
                    </p>
                    <p className="pb-2 text-2xl font-semibold text-slate-500">%</p>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    Target role: {result.roleTitle}
                  </p>
                </div>

                <ResultCard
                  title="Matched Skills"
                  items={result.matchedSkills}
                  tone="success"
                />
                <ResultCard
                  title="Missing Skills"
                  items={result.missingSkills}
                  tone="warning"
                />
                <ResultCard
                  title="Recommendations"
                  items={result.recommendations}
                  tone="neutral"
                />
              </div>
            ) : (
              <EmptyScorePanel />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyScorePanel() {
  return (
    <div className="flex min-h-[560px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--brand-accent)] bg-[var(--brand-accent-muted)] text-[var(--brand-primary)]">
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.7}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
          />
        </svg>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        ATS match results will appear here
      </h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
        Select a resume, paste a job description, and click Calculate Match
        Score to see matched skills, missing skills, and recommendations.
      </p>
      <div className="mt-8 w-full max-w-md space-y-3">
        <div className="h-3 w-2/3 rounded-full bg-slate-100" />
        <div className="h-3 w-full rounded-full bg-slate-100" />
        <div className="h-3 w-5/6 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

function SkeletonScorePanel() {
  return (
    <div className="min-h-[560px] rounded-xl border border-slate-200 bg-white p-5">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="h-3 w-40 rounded-full bg-slate-200" />
        <div className="mt-5 flex items-end gap-3">
          <div className="h-16 w-24 rounded-xl bg-slate-200" />
          <div className="h-8 w-8 rounded-lg bg-slate-100" />
        </div>
        <div className="mt-4 h-3 w-56 rounded-full bg-slate-100" />
      </div>
      <div className="mt-4 space-y-4">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="h-3 w-32 rounded-full bg-slate-200" />
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="h-7 w-24 rounded-full bg-slate-100" />
              <div className="h-7 w-28 rounded-full bg-slate-100" />
              <div className="h-7 w-20 rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "success" | "warning" | "neutral";
}) {
  const visibleItems = items.length ? items : ["None found"];
  const toneClassName =
    tone === "success"
      ? "border-green-200 bg-green-50 text-[var(--brand-success)]"
      : tone === "warning"
        ? "border-orange-200 bg-orange-50 text-[var(--brand-warning)]"
        : "border-[var(--brand-accent)] bg-[var(--brand-accent-muted)] text-[var(--brand-primary)]";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {visibleItems.map((item) => (
          <span
            key={item}
            className={`rounded-full border px-3 py-1 text-sm font-medium ${toneClassName}`}
          >
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}
