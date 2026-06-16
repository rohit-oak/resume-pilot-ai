import PDFDocument from "pdfkit";

type ResumeSectionKey =
  | "contact"
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "certifications";

type ParsedResume = {
  name: string;
  sections: Record<ResumeSectionKey, string[]>;
};

const SECTION_ORDER: Array<{ key: ResumeSectionKey; title: string }> = [
  { key: "contact", title: "Contact Information" },
  { key: "summary", title: "Professional Summary" },
  { key: "skills", title: "Skills" },
  { key: "experience", title: "Experience" },
  { key: "projects", title: "Projects" },
  { key: "education", title: "Education" },
  { key: "certifications", title: "Certifications" },
];

const SECTION_ALIASES: Record<string, ResumeSectionKey> = {
  contact: "contact",
  "contact information": "contact",
  summary: "summary",
  "professional summary": "summary",
  profile: "summary",
  skills: "skills",
  "technical skills": "skills",
  "core skills": "skills",
  experience: "experience",
  "professional experience": "experience",
  "work experience": "experience",
  employment: "experience",
  projects: "projects",
  "key projects": "projects",
  education: "education",
  certifications: "certifications",
  certification: "certifications",
  certificates: "certifications",
};

function createEmptySections(): Record<ResumeSectionKey, string[]> {
  return {
    contact: [],
    summary: [],
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
  };
}

function normalizeHeading(line: string) {
  return line
    .replace(/[:#*-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getSectionKey(line: string) {
  return SECTION_ALIASES[normalizeHeading(line)];
}

function isLikelyHeading(line: string) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.length > 60) {
    return false;
  }

  return Boolean(getSectionKey(trimmed));
}

function parseTailoredResumeText(text: string, fallbackName: string): ParsedResume {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const sections = createEmptySections();
  const firstLine = lines[0] || fallbackName;
  const name = firstLine.length <= 80 ? firstLine : fallbackName;
  let currentSection: ResumeSectionKey = "contact";

  for (const line of lines.slice(name === firstLine ? 1 : 0)) {
    if (isLikelyHeading(line)) {
      currentSection = getSectionKey(line) || currentSection;
      continue;
    }

    sections[currentSection].push(line);
  }

  if (!sections.summary.length && !Object.values(sections).some((items) => items.length)) {
    sections.summary.push(text);
  }

  return { name, sections };
}

function addSectionHeading(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.65);
  doc.font("Helvetica-Bold").fontSize(11).fillColor("black").text(title.toUpperCase());
  doc.moveTo(doc.x, doc.y + 2).lineTo(doc.page.width - doc.page.margins.right, doc.y + 2).stroke();
  doc.moveDown(0.45);
}

function addSectionLines(doc: PDFKit.PDFDocument, lines: string[]) {
  for (const line of lines) {
    const cleanedLine = line.replace(/^[-*•]\s*/, "").trim();
    const isBullet = /^[-*•]/.test(line) || cleanedLine !== line;

    if (isBullet) {
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("black")
        .text(`- ${cleanedLine}`, {
          lineGap: 2,
          paragraphGap: 3,
        });
    } else {
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("black")
        .text(cleanedLine, {
          lineGap: 2,
          paragraphGap: 3,
        });
    }
  }
}

export async function generateTailoredResumePdf({
  tailoredResumeText,
  resumeName,
}: {
  tailoredResumeText: string;
  resumeName: string;
}) {
  const parsedResume = parseTailoredResumeText(tailoredResumeText, resumeName);
  const doc = new PDFDocument({
    size: "LETTER",
    margins: {
      top: 54,
      right: 54,
      bottom: 54,
      left: 54,
    },
  });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer | Uint8Array) => chunks.push(Buffer.from(chunk)));

  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.font("Helvetica-Bold").fontSize(18).fillColor("black").text(parsedResume.name.toUpperCase(), {
    align: "center",
  });
  doc.moveDown(0.4);

  for (const section of SECTION_ORDER) {
    const lines = parsedResume.sections[section.key];

    if (!lines.length) {
      continue;
    }

    addSectionHeading(doc, section.title);
    addSectionLines(doc, lines);
  }

  doc.end();

  return finished;
}
