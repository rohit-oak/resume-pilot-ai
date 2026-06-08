import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

type ResumeRecord = {
  id: string;
  name: string;
  file_name: string;
};

function normalizeStorageName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findStoragePaths({
  fileName,
  resumeName,
  objectNames,
}: {
  fileName: string;
  resumeName: string;
  objectNames: string[];
}) {
  if (objectNames.includes(fileName)) {
    return [fileName];
  }

  const normalizedFileName = normalizeStorageName(fileName);
  const normalizedResumePdfName = normalizeStorageName(`${resumeName}.pdf`);

  return objectNames.filter((objectName) => {
    const normalizedObjectName = normalizeStorageName(objectName);

    return (
      Boolean(normalizedFileName) &&
      normalizedObjectName.includes(normalizedFileName)
    ) || (
      Boolean(normalizedResumePdfName) &&
      normalizedObjectName.includes(normalizedResumePdfName)
    );
  });
}

async function listRootStorageObjectNames(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
) {
  const { data, error } = await supabase.storage.from("resumes").list("", {
    limit: 1000,
  });

  if (error) {
    throw error;
  }

  return (data || []).map((object) => object.name);
}

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

    const supabase = createSupabaseAdminClient();
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id, name, file_name")
      .eq("id", resumeId)
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

    const objectNames = await listRootStorageObjectNames(supabase);
    const storagePaths = findStoragePaths({
      fileName: resume.file_name,
      resumeName: resume.name,
      objectNames,
    });

    console.log("[ResumePilot][delete-resume] Storage lookup completed", {
      databaseFileName: resume.file_name,
      storageObjectCount: objectNames.length,
      matchedStoragePaths: storagePaths,
    });

    if (!storagePaths.length) {
      return NextResponse.json(
        {
          error:
            "Resume PDF was not found in Supabase Storage. Database row was not deleted.",
          fileName: resume.file_name,
        },
        { status: 404 },
      );
    }

    const { data: removedObjects, error: storageError } = await supabase.storage
      .from("resumes")
      .remove(storagePaths);

    console.log("[ResumePilot][delete-resume] Storage remove completed", {
      requestedPaths: storagePaths,
      removedObjects,
      storageError,
    });

    if (storageError) {
      return NextResponse.json(
        { error: storageError.message },
        { status: 500 },
      );
    }

    const remainingObjectNames = await listRootStorageObjectNames(supabase);
    const remainingStoragePaths = storagePaths.filter((path) =>
      remainingObjectNames.includes(path),
    );

    console.log("[ResumePilot][delete-resume] Storage delete verified", {
      requestedPaths: storagePaths,
      remainingStoragePaths,
    });

    if (remainingStoragePaths.length) {
      return NextResponse.json(
        {
          error:
            "Supabase Storage did not delete the resume PDF. Database row was not deleted.",
          remainingStoragePaths,
        },
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
      deletedStoragePaths: storagePaths,
      deletedResumeId: resume.id,
    });
  } catch (reason) {
    const message =
      reason instanceof Error ? reason.message : "Unable to delete resume.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
