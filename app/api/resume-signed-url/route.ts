import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { resumeId?: string }
    | null;
  const resumeId = body?.resumeId?.trim();

  if (!resumeId) {
    return NextResponse.json({ error: "Resume id is required." }, { status: 400 });
  }

  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("id, file_name")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (resumeError || !resume) {
    return NextResponse.json(
      { error: resumeError?.message || "Resume not found." },
      { status: 404 },
    );
  }

  const { data, error } = await supabase.storage
    .from("resumes")
    .createSignedUrl(resume.file_name, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: error?.message || "Unable to create signed URL." },
      { status: 500 },
    );
  }

  return NextResponse.json({ signedUrl: data.signedUrl });
}
