import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

type ResumeRecord = {
  id: string;
  name: string;
  file_name: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { resumeId?: string }
      | null;
    const resumeId = body?.resumeId?.trim();

    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume id is required." },
        { status: 400 },
      );
    }

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id, name, file_name")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single<ResumeRecord>();

    console.log("[ResumePilot][delete-resume] Delete request received", {
      resumeId,
      loadedResume: resume
        ? {
            id: resume.id,
            name: resume.name,
            fileName: resume.file_name,
          }
        : null,
      resumeError,
    });

    if (resumeError || !resume) {
      return NextResponse.json(
        { error: resumeError?.message || "Resume not found." },
        { status: 404 },
      );
    }

    const { data: removedObjects, error: storageError } = await supabase.storage
      .from("resumes")
      .remove([resume.file_name]);

    console.log("[ResumePilot][delete-resume] Storage remove completed", {
      requestedPaths: [resume.file_name],
      removedObjects,
      storageError,
    });

    if (storageError) {
      return NextResponse.json(
        { error: storageError.message },
        { status: 500 },
      );
    }

    const { error: deleteError } = await supabase
      .from("resumes")
      .delete()
      .eq("id", resume.id);

    if (deleteError) {
      return NextResponse.json(
        {
          error:
            "PDF was deleted from Storage, but the database row could not be deleted.",
          details: deleteError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      deletedStoragePaths: [resume.file_name],
      deletedResumeId: resume.id,
    });
  } catch (reason) {
    const message =
      reason instanceof Error ? reason.message : "Unable to delete resume.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
