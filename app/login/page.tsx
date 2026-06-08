import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { GoogleSignInButton } from "./google-sign-in-button";

export default async function LoginPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 py-12 text-slate-900">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-sm font-bold text-white">
            RP
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign in to ResumePilot AI
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Use your Google account to manage resumes, match scores, and tailored
            drafts securely.
          </p>
        </div>
        <GoogleSignInButton />
      </section>
    </main>
  );
}
