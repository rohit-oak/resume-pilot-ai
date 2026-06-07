import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { parsedText: "", error: "PDF file is required." },
        { status: 400 },
      );
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        { parsedText: "", error: "Only PDF files can be parsed." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });

    try {
      const parsedPdf = await parser.getText();

      return NextResponse.json({
        parsedText: parsedPdf.text.trim(),
      });
    } finally {
      await parser.destroy();
    }
  } catch (reason) {
    console.error("Resume PDF parsing failed", reason);

    return NextResponse.json({
      parsedText: "",
    });
  }
}
