"use client";

import { useState } from "react";

export function ViewResumeButton({ resumeId }: { resumeId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  async function openResume() {
    setError(null);
    setIsOpening(true);

    try {
      const response = await fetch("/api/resume-signed-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeId }),
      });
      const payload = (await response.json()) as {
        signedUrl?: string;
        error?: string;
      };

      if (response.status === 401) {
        window.location.href = "/login?reason=personal-resumes";
        return;
      }

      if (!response.ok || !payload.signedUrl) {
        throw new Error(payload.error || "Unable to open resume.");
      }

      window.open(payload.signedUrl, "_blank", "noopener,noreferrer");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to open resume.");
    } finally {
      setIsOpening(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={openResume}
        disabled={isOpening}
        className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--brand-accent)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-primary)] transition-colors hover:bg-[var(--brand-accent-muted)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isOpening ? "Opening..." : "View"}
      </button>
      {error ? (
        <p className="mt-2 text-sm font-medium text-red-700">{error}</p>
      ) : null}
    </div>
  );
}
