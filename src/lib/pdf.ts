import "server-only";
import { readFileSync } from "fs";
import { join } from "path";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export interface QAItem { q: string; a: string }
export interface PdfInput {
  formName: string;
  name?: string;
  email?: string;
  qa: QAItem[];
  summary?: string;
  createdAt?: Date;
}

function loadFont(file: string): Uint8Array {
  return new Uint8Array(readFileSync(join(process.cwd(), "src/lib/fonts", file)));
}

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 56;
const CONTENT_W = PAGE_W - MARGIN * 2;

const INK = rgb(0.06, 0.09, 0.16);
const MUTED = rgb(0.39, 0.45, 0.55);
const ACCENT = rgb(0.486, 0.227, 0.929); // #7c3aed
const LINE = rgb(0.9, 0.91, 0.94);

/** Łamie tekst na linie mieszczące się w danej szerokości. */
function wrap(font: PDFFont, text: string, size: number, maxW: number): string[] {
  const out: string[] = [];
  for (const raw of text.split("\n")) {
    const words = raw.split(/\s+/);
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        out.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    out.push(line);
  }
  return out;
}

/** Buduje czytelny PDF ze zgłoszenia konwersacyjnego (pytania → odpowiedzi + streszczenie). */
export async function buildConversationPdf(input: PdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const regular = await doc.embedFont(loadFont("Inter-Regular.ttf"), { subset: true });
  const bold = await doc.embedFont(loadFont("Inter-Bold.ttf"), { subset: true });

  let page: PDFPage = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  function ensure(space: number) {
    if (y - space < MARGIN) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  }

  function text(str: string, opts: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; gap?: number; indent?: number } = {}) {
    const font = opts.font ?? regular;
    const size = opts.size ?? 11;
    const color = opts.color ?? INK;
    const indent = opts.indent ?? 0;
    const lh = size * 1.45;
    for (const line of wrap(font, str, size, CONTENT_W - indent)) {
      ensure(lh);
      page.drawText(line, { x: MARGIN + indent, y: y - size, size, font, color });
      y -= lh;
    }
    y -= opts.gap ?? 0;
  }

  // Nagłówek
  text("Zgłoszenie z formularza", { font: bold, size: 20, color: INK, gap: 2 });
  text(input.formName, { size: 12, color: MUTED, gap: 6 });
  const meta: string[] = [];
  if (input.name) meta.push(input.name);
  if (input.email) meta.push(input.email);
  if (input.createdAt) meta.push(input.createdAt.toLocaleString("pl-PL"));
  if (meta.length) text(meta.join("  ·  "), { size: 10, color: MUTED });

  // Linia
  ensure(20);
  y -= 6;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 1, color: LINE });
  y -= 18;

  // Streszczenie (na górze, najważniejsze)
  if (input.summary) {
    text("Streszczenie", { font: bold, size: 13, color: ACCENT, gap: 4 });
    text(input.summary, { size: 11, color: INK, gap: 16 });
  }

  // Pytania i odpowiedzi
  text("Pytania i odpowiedzi", { font: bold, size: 13, color: INK, gap: 8 });
  input.qa.forEach((item, i) => {
    ensure(40);
    text(`${i + 1}. ${item.q}`, { font: bold, size: 11, color: MUTED, gap: 2 });
    text(item.a || "—", { size: 12, color: INK, gap: 12, indent: 12 });
  });

  // Stopka
  ensure(30);
  y = Math.max(y, MARGIN + 14);
  page.drawText("Wygenerowano przez Mulbox.ch", {
    x: MARGIN, y: MARGIN - 8, size: 8, font: regular, color: MUTED,
  });

  return doc.save();
}
