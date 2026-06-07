"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export function UploadResumeButton() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function parseResume(file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        parsedText?: string;
      };

      if (!response.ok) {
        return "";
      }

      return result.parsedText || "";
    } catch (reason) {
      console.error("Resume parsing failed during upload", reason);
      return "";
    }
  }

  async function uploadResume(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setMessage(null);
    setError(null);

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Only PDF resumes can be uploaded.");
      event.target.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
      const storagePath = safeFileName;
      const resumeName = file.name.replace(/\.pdf$/i, "").trim() || "Untitled Resume";

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(storagePath, file, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        console.error("Resume upload failed during Storage upload", uploadError);
        throw uploadError;
      }

      const parsedText = await parseResume(file);

      const { error: insertError } = await supabase.from("resumes").insert({
        name: resumeName,
        file_name: storagePath,
        parsed_text: parsedText,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Resume upload failed during database insert", insertError);
        throw insertError;
      }

      setMessage("Resume uploaded successfully.");
      router.refresh();
    } catch (reason) {
      const uploadMessage =
        reason instanceof Error ? reason.message : "Unable to upload resume.";
      setError(uploadMessage);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={uploadResume}
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/25 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16.5V3.75m0 0L7.5 8.25M12 3.75l4.5 4.5M4.5 16.5v2.25A2.25 2.25 0 0 0 6.75 21h10.5a2.25 2.25 0 0 0 2.25-2.25V16.5"
          />
        </svg>
        {isUploading ? "Uploading..." : "Upload Resume"}
      </button>
      {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
