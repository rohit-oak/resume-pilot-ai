import { createServerClient } from "@/lib/supabase";
import { UploadResumeButton } from "./upload-resume-button";

type Resume = {
  id: string;
  name: string;
  file_name: string;
};

export default async function Home() {
  const supabase = await createServerClient();
  const { data: resumes, error } = await supabase
    .from("resumes")
    .select("id, name, file_name")
    .order("name");

  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-bold text-white">
              RP
            </span>
            <span className="text-lg font-semibold tracking-tight">
              ResumePilot <span className="text-blue-600">AI</span>
            </span>
          </a>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition-colors hover:text-blue-600">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-blue-600">
              How It Works
            </a>
            <a href="#benefits" className="transition-colors hover:text-blue-600">
              Benefits
            </a>
            <a href="#resumes" className="transition-colors hover:text-blue-600">
              Resumes
            </a>
          </div>
          <a
            href="#cta"
            className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:shadow-lg hover:shadow-purple-500/30"
          >
            Get Started
          </a>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pb-20 pt-16 md:pb-28 md:pt-24">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-24 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-400/20 via-purple-400/15 to-transparent blur-3xl" />
            <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-purple-400/10 blur-3xl" />
          </div>

          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                AI-powered resume tailoring
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                Land more interviews with{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  tailored resumes
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
                ResumePilot AI helps job seekers tailor resumes for specific job
                descriptions. Get ATS match scores, customize for every role, and
                download optimized PDFs — all in one place.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  id="cta"
                  href="#"
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/30 sm:w-auto"
                >
                  Start Tailoring Free
                </a>
                <a
                  href="#how-it-works"
                  className="w-full rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-center text-base font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-600 sm:w-auto"
                >
                  See How It Works
                </a>
              </div>
              <div className="mt-5 inline-flex rounded-full bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-blue-500/40 p-[1px] shadow-sm shadow-blue-500/10">
                <div className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-medium text-slate-700 backdrop-blur">
                  Built by{" "}
                  <span className="font-semibold text-slate-900">Rohit Oak</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                No credit card required · Free ATS analysis
              </p>
            </div>

            {/* Hero visual */}
            <div className="mx-auto mt-16 max-w-4xl">
              <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200/50">
                <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Senior Product Manager
                        </p>
                        <p className="text-xs text-slate-500">Acme Corp · Remote</p>
                      </div>
                    </div>
                    <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                      92% ATS Match
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-3/4 rounded-full bg-slate-200" />
                    <div className="h-3 w-full rounded-full bg-slate-200" />
                    <div className="h-3 w-5/6 rounded-full bg-slate-200" />
                    <div className="mt-4 flex gap-2">
                      <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        Product Strategy
                      </span>
                      <span className="rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                        Agile
                      </span>
                      <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        Stakeholder Mgmt
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Resumes */}
        <section id="resumes" className="border-t border-slate-200 bg-white px-6 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Your{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Resumes
                </span>
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                All resumes stored in your account, ready to tailor for any job.
              </p>
            </div>

            <UploadResumeButton />

            {error ? (
              <div className="mx-auto mt-12 max-w-lg rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
                <p className="font-medium">Unable to load resumes</p>
                <p className="mt-1 text-sm">{error.message}</p>
              </div>
            ) : !resumes?.length ? (
              <div className="mx-auto mt-12 max-w-lg rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <p className="font-medium text-slate-900">No resumes yet</p>
                <p className="mt-1 text-sm text-slate-600">
                  Upload your first resume to get started.
                </p>
              </div>
            ) : (
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(resumes as Resume[]).map((resume) => {
                  const {
                    data: { publicUrl },
                  } = supabase.storage.from("resumes").getPublicUrl(resume.file_name);

                  return (
                    <article
                      key={resume.id}
                      className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-500/5"
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white transition-transform group-hover:scale-105">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {resume.name}
                      </h3>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Resume Name
                      </p>
                      <div className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <p className="truncate text-sm font-medium text-slate-700">
                          {resume.file_name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">File Name</p>
                      </div>
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
                      >
                        View
                      </a>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-slate-200 bg-white px-6 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Everything you need to{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  stand out
                </span>
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Powerful tools designed to help you craft the perfect resume for
                every application.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2">
              <FeatureCard
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                }
                title="Multiple Resumes"
                description="Store and manage multiple resume versions. Switch between profiles for different industries or career levels effortlessly."
              />
              <FeatureCard
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                }
                title="ATS Match Score"
                description="Get instant ATS compatibility analysis. See exactly how well your resume matches each job description before you apply."
              />
              <FeatureCard
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                  </svg>
                }
                title="Job-Specific Customization"
                description="AI tailors your resume for each job description. Highlight the right skills and keywords recruiters are looking for."
              />
              <FeatureCard
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                }
                title="Optimized PDF Export"
                description="Download polished, ATS-friendly PDF resumes ready to submit. Professional formatting that passes automated screening."
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="px-6 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                How it works
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Three simple steps from job posting to optimized resume.
              </p>
            </div>

            <div className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
              <div className="pointer-events-none absolute top-16 hidden h-0.5 w-full bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 md:block" />

              <StepCard
                step={1}
                title="Upload Your Resume"
                description="Import your existing resume or create a new one. Store multiple versions for different career paths."
              />
              <StepCard
                step={2}
                title="Paste the Job Description"
                description="Add the job posting you're targeting. Our AI analyzes requirements and identifies key keywords."
              />
              <StepCard
                step={3}
                title="Download & Apply"
                description="Review your ATS match score, accept AI suggestions, and download your tailored PDF resume."
              />
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="border-t border-slate-200 bg-white px-6 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Why job seekers choose{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ResumePilot AI
                  </span>
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  Stop sending generic resumes into the void. Tailor every
                  application and track your progress over time.
                </p>

                <ul className="mt-10 space-y-6">
                  <BenefitItem
                    title="Beat the ATS"
                    description="75% of resumes never reach a human. Our match scoring ensures yours gets through automated filters."
                  />
                  <BenefitItem
                    title="Save hours per application"
                    description="What used to take 30+ minutes of manual editing now takes seconds with AI-powered suggestions."
                  />
                  <BenefitItem
                    title="Version history"
                    description="Track every change with full resume version history. Revert, compare, and refine over time."
                  />
                  <BenefitItem
                    title="Higher response rates"
                    description="Candidates using tailored resumes see up to 3x more interview callbacks compared to generic applications."
                  />
                </ul>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-2xl" />
                <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-xl">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Average ATS Score
                        </p>
                        <p className="text-3xl font-bold text-slate-900">87%</p>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Time Saved per Application
                        </p>
                        <p className="text-3xl font-bold text-slate-900">28 min</p>
                      </div>
                      <div className="text-4xl">⏱️</div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Resumes Managed
                        </p>
                        <p className="text-3xl font-bold text-slate-900">Unlimited</p>
                      </div>
                      <div className="text-4xl">📄</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="px-6 pb-20 md:pb-28">
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-16 text-center shadow-2xl shadow-blue-500/30 md:px-16">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
              <h2 className="relative text-3xl font-bold text-white md:text-4xl">
                Ready to land your dream job?
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-lg text-blue-100">
                Join thousands of job seekers who use ResumePilot AI to craft
                winning resumes for every application.
              </p>
              <a
                href="#"
                className="relative mt-8 inline-block rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-blue-600 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
              >
                Get Started for Free
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 px-6 py-12 text-slate-400">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
            <div className="text-center md:text-left">
              <a href="#" className="flex items-center justify-center gap-2 md:justify-start">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold text-white">
                  RP
                </span>
                <span className="text-lg font-semibold text-white">
                  ResumePilot AI
                </span>
              </a>
              <p className="mt-3 max-w-xs text-sm">
                AI-powered resume tailoring for modern job seekers.
              </p>
            </div>

            <div className="flex gap-16 text-sm">
              <div>
                <p className="mb-3 font-semibold text-white">Product</p>
                <ul className="space-y-2">
                  <li>
                    <a href="#features" className="transition-colors hover:text-white">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#how-it-works" className="transition-colors hover:text-white">
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a href="#benefits" className="transition-colors hover:text-white">
                      Benefits
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <p className="mb-3 font-semibold text-white">Company</p>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="transition-colors hover:text-white">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="transition-colors hover:text-white">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="transition-colors hover:text-white">
                      Terms
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-800 pt-8">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="text-center sm:text-left">
                <p className="text-sm text-slate-500">
                  Built by{" "}
                  <span className="font-medium text-slate-300">Rohit Oak</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Enterprise Technology Leader | Building AI-Powered Products
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  title="LinkedIn placeholder"
                  aria-label="Rohit Oak on LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="#"
                  title="GitHub placeholder"
                  aria-label="Rohit Oak on GitHub"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              &copy; {new Date().getFullYear()} ResumePilot AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-slate-50 p-8 transition-all hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-500/5">
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="relative text-center">
      <div className="relative z-10 mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
        {step}
      </div>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-xs leading-relaxed text-slate-600">
        {description}
      </p>
    </div>
  );
}

function BenefitItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <li className="flex gap-4">
      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
        <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-slate-600">{description}</p>
      </div>
    </li>
  );
}
