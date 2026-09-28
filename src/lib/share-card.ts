/**
 * Share cards: a square picture made on this device (a canvas), for the
 * person to send wherever they choose. Nothing is uploaded by the app. The
 * picture always uses the light palette, so it looks the same everywhere.
 */

export const CARD_SIZE = 1080;

/** What goes in the round sticker at the top of the card. */
export type CardArt =
  | { type: "image"; src: string }
  | { type: "icon"; svg: string; ink: string }
  | { type: "number"; n: number };

export type CardContent = {
  /** Small line above the title, e.g. "New badge" or "Sam's courage". */
  kicker: string;
  title: string;
  line: string;
  art: CardArt;
};

const INK = "#13262b";
const MUTED = "#4c6166";
const CANVAS = "#f2f6f5";
const LINE = "#d4e1df";
const TEAL = "#2ec4b6";

/** Sticker inks by their Tailwind class, as in globals.css. */
export const INK_HEX: Record<string, string> = {
  "bg-sun": "#ffc83d",
  "bg-sky": "#7cc4ff",
  "bg-grape": "#b8a4ff",
  "bg-coral": "#ff8a6b",
  "bg-lime": "#b8e62e",
  "bg-accent": TEAL,
};

/** Splits text into lines that fit `width` at the current font. At most `max` lines; the last one ends with an ellipsis if cut. */
export function wrapText(measure: (s: string) => number, text: string, width: number, max: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (measure(next) <= width || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length <= max) return lines;
  const kept = lines.slice(0, max);
  let last = kept[max - 1];
  while (last && measure(`${last}...`) > width) last = last.split(" ").slice(0, -1).join(" ");
  kept[max - 1] = `${last}...`;
  return kept;
}

function fontFamily(varName: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Turns an inline Phosphor SVG into an image, drawn in ink. */
function svgImage(svg: string): Promise<HTMLImageElement> {
  let markup = svg.replace(/currentColor/g, INK);
  if (!/xmlns=/.test(markup)) markup = markup.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  return loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`);
}

/**
 * Draws the card onto `canvas` (resized to CARD_SIZE square). It is drawn
 * on a canvas of its own first and copied at the end, so two draws in a
 * row can never mix.
 */
export async function drawCard(canvas: HTMLCanvasElement, card: CardContent): Promise<void> {
  const S = CARD_SIZE;
  const off = document.createElement("canvas");
  off.width = S;
  off.height = S;
  const ctx = off.getContext("2d");
  if (!ctx) return;
  const display = fontFamily("--font-bricolage", "ui-sans-serif, system-ui, sans-serif");
  const body = fontFamily("--font-atkinson", "ui-sans-serif, system-ui, sans-serif");
  try {
    await Promise.all([document.fonts.load(`700 80px ${display}`), document.fonts.load(`400 40px ${body}`)]);
  } catch {
    // The system font will do.
  }

  // Page and the white card.
  ctx.fillStyle = CANVAS;
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 4;
  roundRect(ctx, 56, 56, S - 112, S - 112, 48);
  ctx.fill();
  ctx.stroke();

  // Wordmark sticker, slightly tilted.
  ctx.save();
  ctx.translate(120, 128);
  ctx.rotate((-2 * Math.PI) / 180);
  ctx.font = `700 34px ${display}`;
  const mark = "Rehearse Courage";
  const mw = ctx.measureText(mark).width + 52;
  ctx.fillStyle = TEAL;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 8;
  roundRect(ctx, 0, -34, mw, 68, 34);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(mark, 26, 2);
  ctx.restore();

  // The round sticker.
  const cx = S / 2;
  const cy = 360;
  const r = 150;
  ctx.save();
  ctx.shadowColor = "rgba(19, 38, 43, 0.22)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 12, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const art = card.art;
  if (art.type === "image") {
    try {
      const img = await loadImage(art.src);
      ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
    } catch {
      ctx.fillStyle = TEAL;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
  } else if (art.type === "icon") {
    ctx.fillStyle = INK_HEX[art.ink] ?? TEAL;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    try {
      const img = await svgImage(art.svg);
      ctx.drawImage(img, cx - 80, cy - 80, 160, 160);
    } catch {
      // The coloured circle alone is fine.
    }
  } else {
    ctx.fillStyle = TEAL;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `750 150px ${display}`;
    ctx.fillText(String(art.n), cx, cy + 8);
  }
  ctx.restore();

  // Words.
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const width = S - 240;
  let y = 590;
  ctx.fillStyle = MUTED;
  ctx.font = `400 38px ${body}`;
  ctx.fillText(wrapText((s) => ctx.measureText(s).width, card.kicker, width, 1)[0] ?? "", cx, y);
  y += 96;
  ctx.fillStyle = INK;
  ctx.font = `700 76px ${display}`;
  const title = wrapText((s) => ctx.measureText(s).width, card.title, width, 2);
  for (const t of title) {
    ctx.fillText(t, cx, y);
    y += 86;
  }
  y += 10;
  ctx.font = `400 40px ${body}`;
  for (const t of wrapText((s) => ctx.measureText(s).width, card.line, width, 3)) {
    ctx.fillText(t, cx, y);
    y += 54;
  }

  ctx.fillStyle = MUTED;
  ctx.font = `400 30px ${body}`;
  ctx.fillText("rehearse-courage.sayamdev.workers.dev", cx, S - 104);

  canvas.width = S;
  canvas.height = S;
  canvas.getContext("2d")?.drawImage(off, 0, 0);
}

export function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

/** A tidy file name from a title: "rehearse-courage-tiny-dare.png". */
export function cardFileName(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `rehearse-courage-${slug || "courage"}.png`;
}
