const workflowSteps = [
  {
    step: "Step 1",
    title: "Analyze Job Description",
    description: "Extract role signals, skills, keywords, and responsibilities.",
  },
  {
    step: "Step 2",
    title: "ATS Match Score",
    description: "Compare the selected resume against the target role.",
  },
  {
    step: "Step 3",
    title: "Generate Tailored Resume",
    description: "Generate an ATS-friendly version grounded in your experience.",
  },
];

const kpis = [
  {
    label: "Resume Analysis",
    value: "Parsed",
    helper: "PDF text ready for matching",
  },
  {
    label: "ATS Match",
    value: "Weighted",
    helper: "Skills and keywords scored",
  },
  {
    label: "Resume Tailoring",
    value: "AI Draft",
    helper: "Customized text with copy support",
  },
];

export function WorkflowOverview() {
  return (
    <section className="border-t border-slate-200 bg-white px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-4 md:grid-cols-3">
          {kpis.map((kpi) => (
            <article
              key={kpi.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {kpi.label}
              </p>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                {kpi.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {kpi.helper}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--brand-accent-muted)] bg-[var(--brand-accent-muted)] p-5 shadow-sm md:p-6">
          <div className="space-y-5">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
                Guided Workflow
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                Analyze Job Description &rarr; ATS Match Score &rarr; Generate Tailored Resume
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {workflowSteps.map((item) => (
                <article
                  key={item.step}
                  className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white/90 p-5 text-center shadow-sm"
                >
                  <span className="flex h-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-primary)] px-3 text-xs font-bold text-white">
                    {item.step}
                  </span>
                  <h3 className="mt-4 text-base font-semibold leading-6 text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
