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

const CARD_SIZE = 1080;
const SITE_URL = "the-unshaken-self-site-hcp1.vercel.app";
const GOLD = "#dfb15b";
const CREAM = "#f5f1e8";
const SANS = "'Segoe UI', Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

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

// Shrinks the quote's font size until it wraps within maxLines, so a long
// teaching never overflows or gets clipped off the card.
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

export async function generateWisdomShareCard(data: WisdomCardData): Promise<Blob | null> {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = CARD_SIZE;
  canvas.height = CARD_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Background
  const bg = ctx.createLinearGradient(0, 0, CARD_SIZE, CARD_SIZE);
  bg.addColorStop(0, "#16311a");
  bg.addColorStop(1, "#070b09");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);

  // Soft center glow
  const glow = ctx.createRadialGradient(CARD_SIZE / 2, CARD_SIZE / 2, 80, CARD_SIZE / 2, CARD_SIZE / 2, 560);
  glow.addColorStop(0, "rgba(223,177,91,0.10)");
  glow.addColorStop(1, "rgba(223,177,91,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);

  // Decorative frame
  ctx.strokeStyle = "rgba(223,177,91,0.35)";
  ctx.lineWidth = 2;
  const inset = 44;
  ctx.strokeRect(inset, inset, CARD_SIZE - inset * 2, CARD_SIZE - inset * 2);

  ctx.textAlign = "center";

  // Kicker
  ctx.fillStyle = GOLD;
  ctx.font = `700 28px ${SANS}`;
  fillTextSpaced(ctx, "THE UNSHAKEN SELF", CARD_SIZE / 2, 168, 6);

  // Subtitle
  ctx.fillStyle = "rgba(245,241,232,0.7)";
  ctx.font = `400 22px ${SANS}`;
  ctx.fillText("A Book by Ketul Shah", CARD_SIZE / 2, 208);

  // Chapter label
  ctx.fillStyle = GOLD;
  ctx.font = `700 22px ${SANS}`;
  fillTextSpaced(ctx, `CHAPTER ${data.num} • ${data.theme.toUpperCase()}`, CARD_SIZE / 2, 318, 2);

  // Quote — fit, wrap, vertically center in the middle band
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

  // Ornament
  ctx.fillStyle = "rgba(223,177,91,0.6)";
  ctx.font = `400 32px ${SERIF}`;
  ctx.fillText("✦", CARD_SIZE / 2, y + 24);

  // Footer
  ctx.fillStyle = GOLD;
  ctx.font = `700 22px ${SANS}`;
  fillTextSpaced(ctx, "EARLY ACCESS AVAILABLE NOW", CARD_SIZE / 2, CARD_SIZE - 110, 2);

  ctx.fillStyle = "rgba(245,241,232,0.65)";
  ctx.font = `400 20px ${SANS}`;
  ctx.fillText(SITE_URL, CARD_SIZE / 2, CARD_SIZE - 78);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}
