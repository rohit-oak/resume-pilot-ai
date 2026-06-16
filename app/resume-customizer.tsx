"use client";

import { useState } from "react";

type ResumeOption = {
  id: string;
  name: string;
  file_name: string;
};

type CustomizedResumeResult = {
  resumeName: string;
  roleTitle: string;
  overallScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  tailoredResumeText: string;
  tailoringSummary: string[];
};

export function ResumeCustomizer({
  resumes,
  isAuthenticated,
}: {
  resumes: ResumeOption[];
  isAuthenticated: boolean;
}) {
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<CustomizedResumeResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generateCustomizedResume() {
    const trimmedJobDescription = jobDescription.trim();

    setMessage(null);
    setError(null);

    if (!isAuthenticated) {
      window.location.href = "/login?reason=personal-resumes";
      return;
    }

    if (!selectedResumeId) {
      setError("Select a resume before generating a customized version.");
      return;
    }

    if (!trimmedJobDescription) {
      setError("Paste a job description before generating a customized resume.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/customize-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobDescription: trimmedJobDescription,
        }),
      });
      const payload = (await response.json()) as CustomizedResumeResult & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to customize resume.");
      }

      setResult(payload);
      setMessage("Customized resume generated successfully.");
    } catch (reason) {
      const customizeMessage =
        reason instanceof Error ? reason.message : "Unable to customize resume.";
      setError(customizeMessage);
    } finally {
      setIsGenerating(false);
    }
  }

  async function downloadPdf() {
    if (!result) {
      return;
    }

    setMessage(null);
    setError(null);
    setIsExportingPdf(true);

    try {
      const response = await fetch("/api/export-resume-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeName: result.resumeName,
          tailoredResumeText: result.tailoredResumeText,
        }),
      });

      if (response.status === 401) {
        window.location.href = "/login?reason=personal-resumes";
        return;
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        throw new Error(payload?.error || "Unable to export resume PDF.");
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition") || "";
      const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);
      const fileName =
        fileNameMatch?.[1] || `${result.resumeName.replace(/[^a-zA-Z0-9]+/g, "_")}_Customized.pdf`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage("PDF downloaded successfully.");
    } catch (reason) {
      const exportMessage =
        reason instanceof Error ? reason.message : "Unable to export resume PDF.";
      setError(exportMessage);
    } finally {
      setIsExportingPdf(false);
    }
  }

  return (
    <section
      id="resume-customizer"
      className="border-t border-slate-200 bg-white px-6 py-16 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
            Resume Customizer
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Generate a tailored resume for the role
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Select a parsed resume, paste the target job description, and create
            an ATS-friendly version grounded in your existing experience.
          </p>
        </div>

        <div className="mt-12 flex flex-col items-start gap-8 lg:flex-row">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:w-[45%]">
            <label
              htmlFor="customizer-resume"
              className="text-sm font-semibold text-slate-800"
            >
              Resume
            </label>
            <select
              id="customizer-resume"
              value={selectedResumeId}
              onChange={(event) => setSelectedResumeId(event.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-[var(--brand-accent)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-accent-muted)]"
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
              htmlFor="customizer-job-description"
              className="mt-6 block text-sm font-semibold text-slate-800"
            >
              Job Description
            </label>
            <textarea
              id="customizer-job-description"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              rows={13}
              placeholder="Paste the target job description here..."
              className="mt-3 min-h-72 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[var(--brand-accent)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-accent-muted)]"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                {jobDescription.trim().length.toLocaleString()} characters
              </p>
              <button
                type="button"
                disabled={isGenerating}
                onClick={generateCustomizedResume}
                className="inline-flex items-center justify-center rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(68,55,66,0.22)] transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-[rgba(68,55,66,0.24)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
              >
                {isGenerating
                  ? "Generating..."
                  : "Generate Customized Resume"}
              </button>
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

          <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:w-[55%]">
            {isGenerating ? (
              <SkeletonCustomizerPanel />
            ) : result ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <SummaryCard
                    label="Target Role"
                    value={result.roleTitle}
                    helper={result.resumeName}
                  />
                  <SummaryCard
                    label="ATS Match"
                    value={`${result.overallScore}%`}
                    helper="Before customization"
                  />
                </div>

                <ChipCard
                  title="Matched Skills"
                  items={result.matchedSkills}
                  tone="success"
                />
                <ChipCard
                  title="Missing Skills"
                  items={result.missingSkills}
                  tone="warning"
                />
                <TextListCard
                  title="Tailoring Summary"
                  items={result.tailoringSummary}
                />

                <article className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Tailored Resume Text
                    </h3>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard.writeText(result.tailoredResumeText)
                        }
                        className="inline-flex items-center justify-center rounded-lg border border-[var(--brand-accent)] bg-white px-3 py-2 text-sm font-semibold text-[var(--brand-primary)] transition-colors hover:border-[var(--brand-accent)] hover:bg-[var(--brand-accent-muted)]"
                      >
                        Copy Text
                      </button>
                      <button
                        type="button"
                        disabled={isExportingPdf}
                        onClick={downloadPdf}
                        className="inline-flex items-center justify-center rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isExportingPdf ? "Downloading..." : "Download PDF"}
                      </button>
                    </div>
                  </div>
                  <textarea
                    readOnly
                    value={result.tailoredResumeText}
                    className="mt-4 h-[500px] max-h-[500px] min-h-80 w-full resize-none overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800 outline-none whitespace-pre-wrap break-words"
                  />
                </article>
              </div>
            ) : (
              <EmptyCustomizerPanel />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyCustomizerPanel() {
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
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14.25v4.5A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H9"
          />
        </svg>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        Tailored resume will appear here
      </h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
        Select a resume, paste a job description, and click Generate Customized
        Resume to create an ATS-friendly tailored draft.
      </p>
      <div className="mt-8 w-full max-w-md space-y-3">
        <div className="h-3 w-2/3 rounded-full bg-slate-100" />
        <div className="h-3 w-full rounded-full bg-slate-100" />
        <div className="h-3 w-5/6 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

function SkeletonCustomizerPanel() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="h-3 w-24 rounded-full bg-slate-200" />
          <div className="mt-4 h-8 w-36 rounded-lg bg-slate-100" />
          <div className="mt-3 h-3 w-28 rounded-full bg-slate-100" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="h-3 w-24 rounded-full bg-slate-200" />
          <div className="mt-4 h-8 w-24 rounded-lg bg-slate-100" />
          <div className="mt-3 h-3 w-32 rounded-full bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="h-3 w-36 rounded-full bg-slate-200" />
        <div className="mt-4 space-y-3">
          <div className="h-3 w-full rounded-full bg-slate-100" />
          <div className="h-3 w-11/12 rounded-full bg-slate-100" />
          <div className="h-3 w-4/5 rounded-full bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="h-3 w-40 rounded-full bg-slate-200" />
          <div className="h-9 w-24 rounded-lg bg-[var(--brand-accent-muted)]" />
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="space-y-3">
            <div className="h-3 w-1/2 rounded-full bg-slate-200" />
            <div className="h-3 w-full rounded-full bg-slate-100" />
            <div className="h-3 w-10/12 rounded-full bg-slate-100" />
            <div className="h-3 w-11/12 rounded-full bg-slate-100" />
            <div className="h-3 w-3/4 rounded-full bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-600">{helper}</p>
    </article>
  );
}

function ChipCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "success" | "warning";
}) {
  const visibleItems = items.length ? items : ["None found"];
  const toneClassName =
    tone === "success"
      ? "border-green-200 bg-green-50 text-[var(--brand-success)]"
      : "border-orange-200 bg-orange-50 text-[var(--brand-warning)]";

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-5">
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

function TextListCard({ title, items }: { title: string; items: string[] }) {
  const visibleItems = items.length ? items : ["Resume tailored for the role."];

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {visibleItems.map((item) => (
          <li
            key={item}
            className="rounded-lg bg-white px-3 py-2 text-sm leading-6 text-slate-700 ring-1 ring-slate-200"
          >
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
