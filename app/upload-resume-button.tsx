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

  function openFilePicker() {
    console.log("[ResumePilot][upload] File picker opened", {
      hasInputRef: Boolean(fileInputRef.current),
    });
    fileInputRef.current?.click();
  }

  async function parseResume(file: File) {
    try {
      console.log("[ResumePilot][upload] Parse started", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      console.log("[ResumePilot][upload] Calling parse API", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        parsedText?: string;
        parseError?: string;
        error?: string;
      };

      console.log("[ResumePilot][upload] Parse API response", {
        ok: response.ok,
        status: response.status,
        parsedTextLength: result.parsedText?.length || 0,
        parseError: result.parseError || result.error || null,
      });

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
    const input = event.currentTarget;
    const file = input.files?.[0];

    console.log("[ResumePilot][upload] File selected", {
      hasFile: Boolean(file),
      name: file?.name || null,
      type: file?.type || null,
      size: file?.size || null,
    });

    if (!file) {
      return;
    }

    setMessage(null);
    setError(null);

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Only PDF resumes can be uploaded.");
      input.value = "";
      return;
    }

    setIsUploading(true);
    console.log("[ResumePilot][upload] Upload started", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("[ResumePilot][upload] Upload blocked: missing session", {
          hasUser: Boolean(user),
          userError,
        });
        router.push("/login?reason=personal-resumes");
        return;
      }

      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
      const storagePath = `${user.id}/${Date.now()}-${safeFileName}`;
      const resumeName = file.name.replace(/\.pdf$/i, "").trim() || "Untitled Resume";

      console.log("[ResumePilot][upload] Starting resume upload", {
        originalFileName: file.name,
        storagePath,
        resumeName,
        size: file.size,
      });

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

      console.log("[ResumePilot][upload] Storage upload succeeded", {
        storagePath,
      });
      console.log("[ResumePilot][upload] Storage upload completed", {
        storagePath,
      });

      const parsedText = await parseResume(file);

      console.log("[ResumePilot][upload] Inserting resume row", {
        name: resumeName,
        file_name: storagePath,
        parsedTextLength: parsedText.length,
        hasParsedText: parsedText.length > 0,
      });

      const { data: insertedResume, error: insertError } = await supabase
        .from("resumes")
        .insert({
          name: resumeName,
          file_name: storagePath,
          user_id: user.id,
          parsed_text: parsedText,
          created_at: new Date().toISOString(),
        })
        .select("id, parsed_text")
        .single();

      if (insertError) {
        console.error("Resume upload failed during database insert", insertError);
        throw insertError;
      }

      console.log("[ResumePilot][upload] Database insert succeeded", {
        id: insertedResume?.id,
        storedParsedTextLength: insertedResume?.parsed_text?.length || 0,
      });
      console.log("[ResumePilot][upload] Database insert completed", {
        id: insertedResume?.id,
        storedParsedTextLength: insertedResume?.parsed_text?.length || 0,
      });

      setMessage("Resume uploaded successfully.");
      router.refresh();
    } catch (reason) {
      const uploadMessage =
        reason instanceof Error ? reason.message : "Unable to upload resume.";
      setError(uploadMessage);
    } finally {
      setIsUploading(false);
      input.value = "";
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
        onClick={openFilePicker}
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(68,55,66,0.22)] transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-[rgba(68,55,66,0.24)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
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
      {message ? <p className="text-sm font-medium text-[var(--brand-success)]">{message}</p> : null}
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
