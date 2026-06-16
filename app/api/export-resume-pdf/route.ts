import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { generateTailoredResumePdf } from "@/lib/resume-pdf";

export const runtime = "nodejs";

function sanitizeFileName(value: string) {
  return (
    value
      .replace(/\.pdf$/i, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80) || "Rohit_Oak_TPM_Resume"
  );
}

export async function POST(request: Request) {
  let debugStage = "route-start";

  try {
    console.error("[ResumePilot][pdf-export] Request received");
    debugStage = "create-server-client";

    const supabase = await createServerClient();
    debugStage = "get-user";

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      debugStage = "unauthenticated";
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    debugStage = "read-json-body";
    const body = (await request.json().catch(() => null)) as
      | { tailoredResumeText?: string; resumeName?: string }
      | null;
    const tailoredResumeText = body?.tailoredResumeText?.trim() || "";
    const resumeName = body?.resumeName?.trim() || "Rohit Oak TPM Resume";

    console.error("[ResumePilot][pdf-export] Request payload", {
      resumeName,
      textLength: tailoredResumeText.length,
    });

    if (!tailoredResumeText) {
      debugStage = "missing-tailored-resume-text";
      return NextResponse.json(
        { error: "Tailored resume text is required." },
        { status: 400 },
      );
    }

    debugStage = "generate-pdf";
    console.error("[ResumePilot][pdf-export] PDF generation started", {
      resumeName,
      textLength: tailoredResumeText.length,
    });

    const pdfBuffer = await generateTailoredResumePdf({
      tailoredResumeText,
      resumeName,
    });

    debugStage = "pdf-generated";
    console.error("[ResumePilot][pdf-export] PDF generation completed", {
      bytes: pdfBuffer.length,
    });

    debugStage = "create-response";
    const fileName = `${sanitizeFileName(resumeName)}_Customized.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to export resume PDF.";
    const stack = error instanceof Error ? error.stack : undefined;

    console.error(
      "[ResumePilot][pdf-export] PDF generation failed",
      {
        stage: debugStage,
        message,
        stack,
        error,
      },
    );

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
