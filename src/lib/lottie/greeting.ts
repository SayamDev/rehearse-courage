/**
 * Builds the Home greeting as a Lottie document in the browser, from the
 * glyph atlas (public/lottie/glyphs.json, Bricolage Grotesque as vector
 * paths): "Hi Sam," stamps in letter by letter over a sun sweep, then
 * "today's one step" rises in. Returns null when the name has a letter the
 * atlas does not have, so the page falls back to plain text.
 */

type Shape = Record<string, unknown>;
export type GlyphAtlas = { size: number; capHeight: number; glyphs: Record<string, { w: number; s: Shape[] }> };

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).concat(1);
const INK = { light: hex("#13262b"), dark: hex("#eaf4f3") };
const MUTED = { light: hex("#4c6166"), dark: hex("#a7bbbd") };
const SUN = hex("#ffc83d");
const WHITE = hex("#ffffff");

type Ease = [number, number, number, number];
const SETTLE: Ease = [0, 0.65, 0.51, 0.99];
const POP: Ease = [0.34, 0.75, 0.34, 1];

const fixed = (k: unknown) => ({ a: 0, k });
function anim(stops: [number, number | number[], Ease?][]) {
  return {
    a: 1,
    k: stops.map(([t, v, e = SETTLE], i) => {
      const s = Array.isArray(v) ? v : [v];
      return i === stops.length - 1 ? { t, s } : { t, s, o: { x: e[0], y: e[1] }, i: { x: e[2], y: e[3] } };
    }),
  };
}
const val = (v: unknown) => (v && typeof v === "object" && "a" in (v as object) ? v : fixed(v));
function tr(t: { p?: unknown; a?: unknown; s?: unknown; r?: unknown; o?: unknown } = {}) {
  return { ty: "tr", p: val(t.p ?? [0, 0]), a: val(t.a ?? [0, 0]), s: val(t.s ?? [100, 100]), r: val(t.r ?? 0), o: val(t.o ?? 100), sk: fixed(0), sa: fixed(0) };
}
const fill = (c: number[]) => ({ ty: "fl", c: fixed(c), o: fixed(100), r: 1 });
const group = (nm: string, items: unknown[], t?: Parameters<typeof tr>[0]) => ({ ty: "gr", nm, it: [...items, tr(t)] });

/** Moves a glyph's paths (authored at size 100, baseline 0) to x, scaled. */
function place(shapes: Shape[], x: number, k: number): Shape[] {
  return shapes.map((sh) => {
    const ks = (sh as { ks: { k: { c: boolean; v: number[][]; i: number[][]; o: number[][] } } }).ks.k;
    return {
      ty: "sh",
      ks: { a: 0, k: { c: ks.c, v: ks.v.map(([a, b]) => [x + a * k, b * k]), i: ks.i.map(([a, b]) => [a * k, b * k]), o: ks.o.map(([a, b]) => [a * k, b * k]) } },
    };
  });
}

function measure(atlas: GlyphAtlas, text: string, size: number): number | null {
  let w = 0;
  for (const c of text) {
    const g = atlas.glyphs[c];
    if (!g) return null;
    w += g.w * (size / atlas.size);
  }
  return w;
}

let ind = 0;
function typeLayer(atlas: GlyphAtlas, text: string, o: { x: number; y: number; size: number; color: number[]; start: number; stagger: number; motion: "pop" | "rise"; op: number }) {
  const k = o.size / atlas.size;
  const cy = (-atlas.capHeight * k) / 2;
  let x = 0;
  const letters: unknown[] = [];
  [...text].forEach((c, n) => {
    const g = atlas.glyphs[c];
    const w = g.w * k;
    if (g.s.length) {
      const cx = x + w / 2;
      const t0 = o.start + n * o.stagger;
      const motion =
        o.motion === "pop"
          ? { p: [cx, cy], s: anim([[t0, [20, 20], POP], [t0 + 12, [116, 116]], [t0 + 22, [100, 100]]]), r: anim([[t0, n % 2 ? 12 : -12], [t0 + 22, 0]]) }
          : { p: anim([[t0, [cx, cy + o.size * 0.45]], [t0 + 22, [cx, cy]]]) };
      letters.push(group(`letter ${c}`, [...place(g.s, x, k), fill(o.color)], { a: [cx, cy], o: anim([[t0, 0], [t0 + 10, 100]]), ...motion }));
    }
    x += w;
  });
  return { ddd: 0, ind: ++ind, ty: 4, nm: text, sr: 1, ks: { o: fixed(100), r: fixed(0), p: fixed([o.x, o.y, 0]), a: fixed([0, 0, 0]), s: fixed([100, 100, 100]) }, ao: 0, shapes: letters, ip: 0, op: o.op, st: 0, bm: 0 };
}

export function greetingLottie(atlas: GlyphAtlas, name: string | null, theme: "light" | "dark", rest = "today’s one step") {
  ind = 0;
  const op = 110;
  const big = 96;
  const small = 58;
  const pad = 16;
  const hi = "Hi ";
  const who = name ? `${name},` : "Hello,";
  const wHi = measure(atlas, hi, big);
  const wWho = measure(atlas, who, big);
  const wRest = measure(atlas, rest, small);
  if (wHi === null || wWho === null || wRest === null) return null;
  const capBig = atlas.capHeight * (big / atlas.size);
  const y1 = pad + capBig + 18;
  const y2 = y1 + small + 36;
  const w = Math.ceil(Math.max(wHi + wWho, wRest) + pad * 2 + 16);
  const h = Math.ceil(y2 + 26);
  const barW = wWho + 20;
  const barH = capBig + 34;
  const sweep = {
    ddd: 0,
    ind: 0,
    ty: 4,
    nm: "sweep",
    sr: 1,
    ks: { o: fixed(100), r: fixed(-2), p: fixed([pad + wHi - 10, y1 - capBig / 2 + 2, 0]), a: fixed([0, 0, 0]), s: fixed([100, 100, 100]) },
    ao: 0,
    shapes: [
      group("bar", [{ ty: "rc", d: 1, p: fixed([barW / 2, 0]), s: fixed([barW, barH]), r: fixed(barH / 2) }, fill(SUN), { ty: "st", c: fixed(WHITE), o: fixed(100), w: fixed(6), lc: 2, lj: 2, ml: 4 }], {
        s: anim([[6, [0, 100]], [26, [100, 100]]]),
      }),
    ],
    ip: 0,
    op,
    st: 0,
    bm: 0,
  };
  const layers = [
    typeLayer(atlas, hi, { x: pad, y: y1, size: big, color: INK[theme], start: 0, stagger: 3, motion: "rise", op }),
    // The name always sits on the sun sweep, so it is always ink, whatever the theme.
    typeLayer(atlas, who, { x: pad + wHi, y: y1, size: big, color: INK.light, start: 10, stagger: 3, motion: "pop", op }),
    typeLayer(atlas, rest, { x: pad, y: y2, size: small, color: MUTED[theme], start: 34, stagger: 1, motion: "rise", op }),
  ];
  sweep.ind = ++ind;
  return { v: "5.12.0", fr: 60, ip: 0, op, w, h, nm: "Greeting", ddd: 0, assets: [], layers: [...layers, sweep] };
}
