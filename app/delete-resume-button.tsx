"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type DeleteResumeButtonProps = {
  resumeId: string;
  fileName: string;
  resumeName: string;
};

export function DeleteResumeButton({
  resumeId,
  fileName,
  resumeName,
}: DeleteResumeButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function closeModal() {
    if (isDeleting) {
      return;
    }

    setIsModalOpen(false);
  }

  async function deleteResume() {
    setIsDeleting(true);
    setMessage(null);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();

      const { error: storageError } = await supabase.storage
        .from("resumes")
        .remove([fileName]);

      if (storageError) {
        throw storageError;
      }

      const { error: deleteError } = await supabase
        .from("resumes")
        .delete()
        .eq("id", resumeId);

      if (deleteError) {
        throw deleteError;
      }

      setMessage("Resume deleted successfully.");
      setIsModalOpen(false);
      router.refresh();
    } catch (reason) {
      const deleteMessage =
        reason instanceof Error ? reason.message : "Unable to delete resume.";
      setError(deleteMessage);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="mt-3">
        <button
          type="button"
          onClick={() => {
            setMessage(null);
            setError(null);
            setIsModalOpen(true);
          }}
          className="inline-flex w-full items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-50"
        >
          Delete
        </button>
        {message ? (
          <p className="mt-2 text-sm font-medium text-emerald-700">{message}</p>
        ) : null}
        {error ? (
          <p className="mt-2 text-sm font-medium text-red-700">{error}</p>
        ) : null}
      </div>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-resume-${resumeId}`}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/20">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166M19.228 5.79 18.16 19.673A2.25 2.25 0 0 1 15.916 21.75H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .563c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a49.04 49.04 0 0 0-7.5 0"
                  />
                </svg>
              </div>
              <div>
                <h3
                  id={`delete-resume-${resumeId}`}
                  className="text-lg font-semibold text-slate-900"
                >
                  Delete Resume?
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Are you sure you want to delete this resume? This action cannot
                  be undone.
                </p>
                <p className="mt-3 truncate text-sm font-medium text-slate-500">
                  {resumeName}
                </p>
              </div>
            </div>

            {error ? (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={closeModal}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={deleteResume}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeleting ? "Deleting..." : "Delete Resume"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
