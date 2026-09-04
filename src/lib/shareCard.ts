// Client-side branded share-card generator. Draws directly onto a
// <canvas> and exports a PNG Blob, rather than rendering DOM-to-image —
// no extra dependency, no cross-origin taint concerns, full control over
// layout. Deliberately uses safe system fonts (Georgia / a system sans
// stack) instead of the site's webfonts: canvas text needs fonts fully
// loaded via the Font Loading API, and next/font's internally-scoped
// family names aren't reliable to reference directly — a well-set
// system serif reads perfectly well in a shared image and never risks a
// silent fallback-to-blurry-text bug.

export type WisdomCardData = {
  num: number;
  theme: string;
  line: string;
};

export type ArchetypeCardData = {
  name: string;
  chapterRef: string;
  line: string;
};

const CARD_SIZE = 1080;
const SITE_URL = "the-unshaken-self-site-hcp1.vercel.app";
const GOLD = "#dfb15b";
const CREAM = "#f5f1e8";
const SANS = "'Segoe UI', Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";
// The book is live — kept in sync with the rest of the site so a share
// card never says something the site itself doesn't currently say.
const FOOTER_LINE = "AVAILABLE NOW · AMAZON & NOTION PRESS";

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Shrinks a quote's font size until it wraps within maxLines, so long
// text never overflows or gets clipped off the card.
function fitQuote(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  let fontSize = 64;
  let lines: string[] = [];
  while (fontSize > 36) {
    ctx.font = `italic 600 ${fontSize}px ${SERIF}`;
    lines = wrapText(ctx, text, maxWidth);
    if (lines.length <= maxLines) break;
    fontSize -= 4;
  }
  return { fontSize, lines };
}

// Manual letter-spacing — avoids relying on the newer, inconsistently
// supported CanvasRenderingContext2D.letterSpacing property.
function fillTextSpaced(ctx: CanvasRenderingContext2D, text: string, centerX: number, y: number, spacing: number) {
  const chars = text.split("");
  const widths = chars.map((c) => ctx.measureText(c).width);
  const totalWidth = widths.reduce((sum, w) => sum + w, 0) + spacing * Math.max(0, chars.length - 1);
  let x = centerX - totalWidth / 2;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = "left";
  chars.forEach((c, i) => {
    ctx.fillText(c, x, y);
    x += widths[i] + spacing;
  });
  ctx.textAlign = prevAlign;
}

// Shared background + frame + kicker/subtitle + footer used by every
// card variant, so each generator only has to draw its own middle
// content. Returns the ready canvas + context for the caller to finish.
function createCardShell(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = CARD_SIZE;
  canvas.height = CARD_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const bg = ctx.createLinearGradient(0, 0, CARD_SIZE, CARD_SIZE);
  bg.addColorStop(0, "#16311a");
  bg.addColorStop(1, "#070b09");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);

  const glow = ctx.createRadialGradient(CARD_SIZE / 2, CARD_SIZE / 2, 80, CARD_SIZE / 2, CARD_SIZE / 2, 560);
  glow.addColorStop(0, "rgba(223,177,91,0.10)");
  glow.addColorStop(1, "rgba(223,177,91,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);

  ctx.strokeStyle = "rgba(223,177,91,0.35)";
  ctx.lineWidth = 2;
  const inset = 44;
  ctx.strokeRect(inset, inset, CARD_SIZE - inset * 2, CARD_SIZE - inset * 2);

  ctx.textAlign = "center";
  ctx.fillStyle = GOLD;
  ctx.font = `700 28px ${SANS}`;
  fillTextSpaced(ctx, "THE UNSHAKEN SELF", CARD_SIZE / 2, 168, 6);

  ctx.fillStyle = "rgba(245,241,232,0.7)";
  ctx.font = `400 22px ${SANS}`;
  ctx.fillText("A Book by Ketul Shah", CARD_SIZE / 2, 208);

  return { canvas, ctx };
}

function drawFooter(ctx: CanvasRenderingContext2D) {
  ctx.textAlign = "center";
  ctx.fillStyle = GOLD;
  ctx.font = `700 22px ${SANS}`;
  fillTextSpaced(ctx, FOOTER_LINE, CARD_SIZE / 2, CARD_SIZE - 110, 2);

  ctx.fillStyle = "rgba(245,241,232,0.65)";
  ctx.font = `400 20px ${SANS}`;
  ctx.fillText(SITE_URL, CARD_SIZE / 2, CARD_SIZE - 78);
}

function toPngBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export async function generateWisdomShareCard(data: WisdomCardData): Promise<Blob | null> {
  const shell = createCardShell();
  if (!shell) return null;
  const { canvas, ctx } = shell;

  ctx.fillStyle = GOLD;
  ctx.font = `700 22px ${SANS}`;
  fillTextSpaced(ctx, `CHAPTER ${data.num} • ${data.theme.toUpperCase()}`, CARD_SIZE / 2, 318, 2);

  const quoteText = `“${data.line}”`;
  const { fontSize, lines } = fitQuote(ctx, quoteText, 820, 6);
  ctx.font = `italic 600 ${fontSize}px ${SERIF}`;
  ctx.fillStyle = CREAM;
  const lineHeight = fontSize * 1.35;
  const totalHeight = lines.length * lineHeight;
  let y = CARD_SIZE / 2 - totalHeight / 2 + fontSize / 2;
  for (const line of lines) {
    ctx.fillText(line, CARD_SIZE / 2, y);
    y += lineHeight;
  }

  ctx.fillStyle = "rgba(223,177,91,0.6)";
  ctx.font = `400 32px ${SERIF}`;
  ctx.fillText("✦", CARD_SIZE / 2, y + 24);

  drawFooter(ctx);
  return toPngBlob(canvas);
}

export async function generateArchetypeShareCard(data: ArchetypeCardData): Promise<Blob | null> {
  const shell = createCardShell();
  if (!shell) return null;
  const { canvas, ctx } = shell;

  ctx.fillStyle = GOLD;
  ctx.font = `700 20px ${SANS}`;
  fillTextSpaced(ctx, "MY UNSHAKEN ARCHETYPE IS", CARD_SIZE / 2, 320, 2);

  ctx.fillStyle = CREAM;
  ctx.font = `700 72px ${SERIF}`;
  const nameLines = wrapText(ctx, data.name, 880);
  let y = 430;
  for (const line of nameLines) {
    ctx.fillText(line, CARD_SIZE / 2, y);
    y += 84;
  }

  ctx.fillStyle = GOLD;
  ctx.font = `700 22px ${SANS}`;
  fillTextSpaced(ctx, data.chapterRef.toUpperCase(), CARD_SIZE / 2, y + 30, 2);

  ctx.fillStyle = "rgba(245,241,232,0.85)";
  const { fontSize, lines } = fitQuote(ctx, data.line, 780, 3);
  ctx.font = `italic 500 ${fontSize}px ${SERIF}`;
  const lineHeight = fontSize * 1.4;
  let qy = y + 110;
  for (const line of lines) {
    ctx.fillText(line, CARD_SIZE / 2, qy);
    qy += lineHeight;
  }

  ctx.fillStyle = "rgba(223,177,91,0.6)";
  ctx.font = `400 32px ${SERIF}`;
  ctx.fillText("✦", CARD_SIZE / 2, qy + 30);

  drawFooter(ctx);
  return toPngBlob(canvas);
}

export async function generateLaunchShareCard(): Promise<Blob | null> {
  const shell = createCardShell();
  if (!shell) return null;
  const { canvas, ctx } = shell;

  ctx.fillStyle = GOLD;
  ctx.font = `700 22px ${SANS}`;
  fillTextSpaced(ctx, "IT'S HERE", CARD_SIZE / 2, 400, 3);

  ctx.fillStyle = CREAM;
  ctx.font = `700 96px ${SERIF}`;
  const headlineLines = wrapText(ctx, "Now Live", 880);
  let y = 520;
  for (const line of headlineLines) {
    ctx.fillText(line, CARD_SIZE / 2, y);
    y += 108;
  }

  ctx.fillStyle = "rgba(245,241,232,0.8)";
  ctx.font = `italic 400 32px ${SERIF}`;
  ctx.fillText("Paperback & Hardcover, on Amazon and Notion Press", CARD_SIZE / 2, y + 30);

  ctx.fillStyle = "rgba(223,177,91,0.6)";
  ctx.font = `400 34px ${SERIF}`;
  ctx.fillText("✦", CARD_SIZE / 2, y + 90);

  drawFooter(ctx);
  return toPngBlob(canvas);
}
