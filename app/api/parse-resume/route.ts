import { NextResponse } from "next/server";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    console.log("===== PARSE ROUTE HIT =====");
    console.log("[ResumePilot][parse-resume] Parse request received");

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      console.error("[ResumePilot][parse-resume] Missing file in form data");

      return NextResponse.json(
        { parsedText: "", error: "PDF file is required." },
        { status: 400 },
      );
    }

    console.log("[ResumePilot][parse-resume] File received", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      console.error("[ResumePilot][parse-resume] Rejected non-PDF file", {
        name: file.name,
        type: file.type,
      });

      return NextResponse.json(
        { parsedText: "", error: "Only PDF files can be parsed." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("[ResumePilot][parse-resume] PDF buffer created", {
      bytes: buffer.length,
    });

    const parsedPdf = await pdfParse(buffer);
    const parsedText = parsedPdf.text.trim();

    console.log("[ResumePilot][parse-resume] PDF text extracted", {
      textLength: parsedText.length,
      hasText: parsedText.length > 0,
    });
    console.log("===== PARSE SUCCESS =====", {
      textLength: parsedText.length,
      first200Chars: parsedText.slice(0, 200),
    });

    return NextResponse.json({
      parsedText,
    });
  } catch (reason) {
    const parseError =
      reason instanceof Error ? reason.message : "Unknown parsing error.";

    console.error("[ResumePilot][parse-resume] Resume PDF parsing failed", reason);
    console.log("===== PARSE FAILED =====", parseError);

    return NextResponse.json(
      {
        success: false,
        error: parseError,
      },
      { status: 500 },
    );
  }
}
