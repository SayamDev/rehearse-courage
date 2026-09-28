// Builds the app's Lottie animations as plain JSON (no runtime dependency):
//   public/lottie/firefly.json    the firefly companion, a calm 3s loop
//   public/lottie/step-done.json  a teal check with a small sticker burst, plays once
//   public/lottie/kit.json        Body kit header: a calm disc breathing, 8s loop
//   public/lottie/badges.json     Badges header: a swaying medal with sparkles, 4s loop
// Run: node scripts/lottie/build.mjs [extra output dir for the Skottie player]
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadType } from "./type.mjs";

const type = loadType(join(process.cwd(), "scripts/lottie/fonts/Bricolage.ttf"));

const FR = 60;
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).concat(1);
const C = {
  ink: hex("#13262b"),
  white: hex("#ffffff"),
  sun: hex("#ffc83d"),
  teal: hex("#2ec4b6"),
  sky: hex("#7cc4ff"),
  coral: hex("#ff8a6b"),
  grape: hex("#b8a4ff"),
  lime: hex("#b8e62e"),
};

// Easing anchors (motion-taste.md), as [x1, y1, x2, y2].
const EASE = {
  travel: [0.45, 0, 0.55, 1],
  settle: [0, 0.65, 0.51, 0.99],
  pop: [0.34, 0.75, 0.34, 1],
  exit: [1, 0.02, 0.54, 0.42],
  flutter: [0.4, 0, 0.6, 1],
};

const fixed = (k) => ({ a: 0, k });
/** Animated property from [frame, value, easeToNext?] stops. */
function anim(stops) {
  return {
    a: 1,
    k: stops.map(([t, v, e = EASE.travel], i) => {
      const s = Array.isArray(v) ? v : [v];
      if (i === stops.length - 1) return { t, s };
      return { t, s, o: { x: e[0], y: e[1] }, i: { x: e[2], y: e[3] } };
    }),
  };
}
const val = (v) => (v && typeof v === "object" && "a" in v ? v : fixed(v));

const tr = ({ p = [0, 0], a = [0, 0], s = [100, 100], r = 0, o = 100 } = {}) => ({
  ty: "tr",
  p: val(p),
  a: val(a),
  s: val(s),
  r: val(r),
  o: val(o),
  sk: fixed(0),
  sa: fixed(0),
});
const el = (p, size) => ({ ty: "el", p: val(p), s: val(size), d: 1 });
const path = (v, closed = false, inT, outT) => ({
  ty: "sh",
  ks: fixed({ c: closed, v, i: inT ?? v.map(() => [0, 0]), o: outT ?? v.map(() => [0, 0]) }),
});
const fill = (c, o = 100) => ({ ty: "fl", c: val(c), o: val(o), r: 1 });
const stroke = (c, w, o = 100) => ({ ty: "st", c: val(c), o: val(o), w: val(w), lc: 2, lj: 2, ml: 4 });
const trim = (e, s = 0) => ({ ty: "tm", s: val(s), e: val(e), o: fixed(0), m: 1 });
const group = (nm, items, t) => ({ ty: "gr", nm, it: [...items, tr(t)] });

let ind = 0;
function layer(nm, shapes, { op, parent, ks = {} } = {}) {
  return {
    ddd: 0,
    ind: ++ind,
    ty: 4,
    nm,
    sr: 1,
    ks: {
      o: val(ks.o ?? 100),
      r: val(ks.r ?? 0),
      p: val(ks.p ?? [0, 0, 0]),
      a: val(ks.a ?? [0, 0, 0]),
      s: val(ks.s ?? [100, 100, 100]),
    },
    ao: 0,
    shapes,
    ip: 0,
    op,
    st: 0,
    bm: 0,
    ...(parent ? { parent } : {}),
  };
}
function nullLayer(nm, ks, op) {
  return {
    ddd: 0,
    ind: ++ind,
    ty: 3,
    nm,
    sr: 1,
    ks: { o: fixed(0), r: val(ks.r ?? 0), p: val(ks.p), a: fixed([0, 0, 0]), s: fixed([100, 100, 100]) },
    ao: 0,
    ip: 0,
    op,
    st: 0,
    bm: 0,
  };
}
const doc = (nm, w, h, op, layers) => ({ v: "5.12.0", fr: FR, ip: 0, op, w, h, nm, ddd: 0, assets: [], layers });

/* ---------- The firefly: floats, flutters, glows, blinks once. 3s loop. ---------- */
function firefly() {
  ind = 0;
  const op = 180;
  // Die-cut look: every piece has a thick white outline under its fill, like a sticker.
  const DIE = 10;
  const rig = nullLayer(
    "float",
    {
      p: anim([
        [0, [200, 222, 0]],
        [90, [200, 206, 0]],
        [180, [200, 222, 0]],
      ]),
      r: anim([
        [0, -2],
        [90, 2],
        [180, -2],
      ]),
    },
    op,
  );
  const P = { op, parent: rig.ind };

  // Wing flutter: 9 even beats in the loop, so the seam is invisible.
  const beat = (from, to) => {
    const stops = [];
    for (let t = 0; t <= op; t += 20) stops.push([t, from, EASE.flutter], [t + 10, to, EASE.flutter]);
    return anim(stops.filter(([t]) => t <= op));
  };
  const wing = (side) =>
    group(
      side < 0 ? "left wing" : "right wing",
      [el([side * 58, -62], [84, 132]), fill(C.white, 88), stroke(C.sky, 6, 90)],
      { p: [side * 22, -28], a: [side * 22, -28], r: beat(side * -8, side * 14) },
    );

  const halo = layer(
    "glow",
    [
      group("outer", [el([0, 58], [240, 240]), fill(C.sun, 100)], { o: anim([[0, 8], [90, 20], [180, 8]]) }),
      group("inner", [el([0, 58], [170, 170]), fill(C.sun, 100)], { o: anim([[0, 18], [90, 36], [180, 18]]) }),
    ],
    P,
  );
  const wings = layer("wings", [wing(-1), wing(1)], P);
  const lantern = layer(
    "lantern",
    [
      group("stripes", [path([[-44, 40], [44, 40]]), path([[-50, 66], [50, 66]]), stroke(hex("#f0a91c"), 7)]),
      group("belly", [el([0, 60], [118, 124]), fill(C.sun), stroke(C.white, DIE)]),
    ],
    P,
  );
  const body = layer("body", [group("thorax", [el([0, -10], [104, 92]), fill(C.ink), stroke(C.white, DIE)])], P);
  const antenna = (side) =>
    group(side < 0 ? "left antenna" : "right antenna", [
      group("tip", [el([side * 50, -186], [22, 22]), fill(C.sun), stroke(C.white, 6)]),
      group("stalk", [
        path([[side * 18, -128], [side * 50, -184]], false, [[0, 0], [side * -4, 20]], [[side * 2, -24], [0, 0]]),
        stroke(C.ink, 6),
      ]),
      group("stalk die", [
        path([[side * 18, -128], [side * 50, -184]], false, [[0, 0], [side * -4, 20]], [[side * 2, -24], [0, 0]]),
        stroke(C.white, 14),
      ]),
    ]);
  const antennae = layer("antennae", [antenna(-1), antenna(1)], P);
  const head = layer("head", [group("head", [el([0, -84], [124, 116]), fill(C.ink), stroke(C.white, DIE)])], P);
  // One slow blink near the end of the loop, from the eyes' centre line.
  const blink = anim([
    [0, [100, 100], EASE.travel],
    [138, [100, 100], EASE.exit],
    [142, [100, 8], EASE.settle],
    [148, [100, 100], EASE.travel],
    [180, [100, 100]],
  ]);
  const eye = (side) =>
    group(side < 0 ? "left eye" : "right eye", [
      group("shine", [el([side * 24 + 4, -94], [8, 8]), fill(C.white)]),
      group("pupil", [el([side * 24, -86], [18, 20]), fill(C.ink)]),
      group("white", [el([side * 24, -88], [34, 36]), fill(C.white)]),
    ]);
  const face = layer(
    "face",
    [
      group("smile", [path([[-12, -60], [12, -60]], false, [[0, 0], [8, 0]], [[-8, 0], [0, 0]]), stroke(C.white, 5)], {}),
      group("smile curve", [path([[-12, -62], [0, -54], [12, -62]], false, [[0, 0], [-6, 0], [0, 0]], [[0, 0], [6, 0], [0, 0]]), stroke(C.white, 5)]),
      group("cheeks", [el([-42, -64], [20, 12]), el([42, -64], [20, 12]), fill(C.coral, 80)]),
      group("eyes", [eye(-1), eye(1)], { p: [0, -88], a: [0, -88], s: blink }),
    ],
    P,
  );
  // Remove the flat "smile" helper; keep only the curve.
  face.shapes.shift();
  return doc("Firefly companion", 400, 400, op, [rig, face, head, antennae, body, lantern, wings, halo]);
}

/* ---------- Step done: teal disc pops in, the check draws on, stickers burst. Plays once. ---------- */
function stepDone() {
  ind = 0;
  const op = 90;
  const inks = [C.sun, C.sky, C.coral, C.grape, C.lime, C.teal, C.sun, C.sky];
  const dots = inks.map((c, i) => {
    const a = (i / inks.length) * Math.PI * 2 - Math.PI / 2 + (i % 2 ? 0.2 : 0);
    const r = i % 2 ? 128 : 150;
    const end = [Math.cos(a) * r, Math.sin(a) * r];
    const size = i % 2 ? 18 : 24;
    return group(`sticker ${i + 1}`, [el([0, 0], [size, size]), fill(c), stroke(C.white, 5)], {
      p: anim([
        [10, [0, 0], EASE.settle],
        [46, end],
      ]),
      s: anim([
        [10, [40, 40], EASE.settle],
        [30, [100, 100], EASE.exit],
        [58, [0, 0]],
      ]),
      r: anim([
        [10, 0, EASE.settle],
        [58, i % 2 ? 90 : -90],
      ]),
    });
  });
  const center = [200, 200, 0];
  const burst = layer("burst", dots, { op, ks: { p: center } });
  const check = layer(
    "check",
    [
      group("tick", [
        path([[-42, 2], [-12, 32], [46, -30]]),
        trim(anim([[14, 0, EASE.settle], [36, 100]])),
        stroke(C.ink, 18),
      ]),
    ],
    { op, ks: { p: center } },
  );
  const disc = layer("disc", [group("disc", [el([0, 0], [196, 196]), fill(C.teal), stroke(C.white, 14)])], {
    op,
    ks: {
      p: center,
      s: anim([
        [0, [0, 0, 100], EASE.pop],
        [16, [110, 110, 100], EASE.settle],
        [28, [100, 100, 100]],
      ]),
      r: anim([
        [0, -20, EASE.pop],
        [28, -4],
      ]),
    },
  });
  return doc("Step done", 400, 400, op, [check, disc, burst]);
}

const star = (p, outer, inner) => ({
  ty: "sr",
  sy: 1,
  d: 1,
  pt: fixed(4),
  p: fixed(p),
  r: fixed(0),
  ir: fixed(inner),
  is: fixed(0),
  or: fixed(outer),
  os: fixed(0),
});

/* ---------- Body kit: a calm blue disc breathes (4s in, 4s out), ripples ease outwards. 8s loop. ---------- */
function kit() {
  ind = 0;
  const op = 480;
  const blue = hex("#2f6fae");
  const calm = hex("#8cc3f5");
  const breathe = anim([
    [0, [86, 86], EASE.travel],
    [240, [108, 108], EASE.travel],
    [480, [86, 86]],
  ]);
  const ripple = (delay) =>
    group(`ripple ${delay}`, [el([0, 0], [200, 200]), stroke(calm, 5)], {
      s: anim([
        [delay, [100, 100], EASE.settle],
        [delay + 240, [175, 175]],
      ]),
      o: anim([
        [delay, 70, EASE.settle],
        [delay + 240, 0],
      ]),
    });
  const center = [200, 200, 0];
  const rings = layer("ripples", [ripple(0), ripple(240)], { op, ks: { p: center } });
  const disc = layer(
    "breath",
    [
      group("plus", [path([[0, -34], [0, 34]]), path([[-34, 0], [34, 0]]), stroke(C.white, 20)]),
      group("disc", [el([0, 0], [200, 200]), fill(blue), stroke(C.white, 12)]),
    ],
    { op, ks: { p: center, s: breathe } },
  );
  return doc("Body kit breathing", 400, 400, op, [disc, rings]);
}

/* ---------- Badges: a medal sticker sways; four sparkles twinkle in turn. 4s loop. ---------- */
function badges() {
  ind = 0;
  const op = 240;
  const sparkle = (i, p, size, c) => {
    const t0 = i * 60;
    const k = [
      [0, [0, 0], EASE.travel],
      [t0, [0, 0], EASE.pop],
      [t0 + 24, [100, 100], EASE.travel],
      [t0 + 60, [0, 0], EASE.travel],
      [op, [0, 0]],
    ].filter((x, j, a) => j === 0 || x[0] > a[j - 1][0]);
    return group(`sparkle ${i + 1}`, [star([0, 0], size, size * 0.32), fill(c), stroke(C.white, 5)], { p, s: anim(k), r: 12 });
  };
  const sparkles = layer(
    "sparkles",
    [
      sparkle(0, [92, 110], 30, C.sun),
      sparkle(1, [318, 150], 24, C.teal),
      sparkle(2, [300, 318], 28, C.sun),
      sparkle(3, [88, 296], 22, C.grape),
    ],
    { op },
  );
  const medal = layer(
    "medal",
    [
      group("star", [star([0, 40], 44, 20), fill(C.white)]),
      group("face", [el([0, 40], [150, 150]), fill(C.sun), stroke(C.white, 12)]),
      group("ribbon left", [path([[-46, -130], [-10, -130], [10, -20], [-30, -20]], true), fill(C.teal), stroke(C.white, 8)]),
      group("ribbon right", [path([[10, -130], [46, -130], [30, -20], [-10, -20]], true), fill(C.coral), stroke(C.white, 8)]),
    ],
    {
      op,
      ks: {
        p: [200, 200, 0],
        a: [0, -130, 0],
        r: anim([
          [0, -6],
          [120, 6],
          [240, -6],
        ]),
      },
    },
  );
  // The medal hangs from the top of its ribbon, so it sways from there.
  medal.ks.p = fixed([200, 90, 0]);
  return doc("Badges medal", 400, 400, op, [sparkles, medal]);
}

/* ---------- Kinetic type ---------- */

// Type colour flips with the theme, so every type piece is built twice.
const THEMES = { light: { ink: hex("#13262b"), muted: hex("#4c6166") }, dark: { ink: hex("#eaf4f3"), muted: hex("#a7bbbd") } };

/**
 * One line of vector type as a layer, every letter its own group so it can
 * move on its own. `motion` is "rise" (letters rise and fade in) or "pop"
 * (letters scale up past full size and settle). Letters stagger from `start`.
 */
function typeLayer(nm, text, { x, y, size, weight = 800, color, start = 0, stagger = 3, dur = 22, motion = "rise", op }) {
  const t = type(text, { size, weight });
  const cy = -t.capHeight / 2;
  const letters = t.glyphs.map((g, k) => {
    const t0 = start + k * stagger;
    const base = { a: [g.cx, cy], o: anim([[t0, 0, EASE.settle], [t0 + Math.round(dur * 0.5), 100]]) };
    const move =
      motion === "rise"
        ? { p: anim([[t0, [g.cx, cy + size * 0.45], EASE.settle], [t0 + dur, [g.cx, cy]]]) }
        : {
            p: [g.cx, cy],
            s: anim([[t0, [20, 20], EASE.pop], [t0 + Math.round(dur * 0.55), [114, 114], EASE.settle], [t0 + dur, [100, 100]]]),
            r: anim([[t0, k % 2 ? 10 : -10, EASE.settle], [t0 + dur, 0]]),
          };
    return group(`letter ${g.char}`, [...g.shapes, fill(color)], { ...base, ...move });
  });
  return { layer: layer(nm, letters, { op, ks: { p: [x, y, 0] } }), width: t.width, capHeight: t.capHeight };
}

/** A marker sweep behind a word: a rounded sticker bar that wipes in from the left. */
function sweep(nm, { x, y, w, h, color, start, dur = 18, tilt = -2, op }) {
  return layer(
    nm,
    [
      group("bar", [{ ty: "rc", d: 1, p: fixed([w / 2, 0]), s: fixed([w, h]), r: fixed(h / 2) }, fill(color), stroke(C.white, 6)], {
        s: anim([[start, [0, 100], EASE.settle], [start + dur, [100, 100]]]),
      }),
    ],
    { op, ks: { p: [x, y, 0], r: tilt } },
  );
}

/** First visit: "Speak up, / one small step / at a time." rising in, with a sun sweep behind "small". */
function welcome(theme) {
  ind = 0;
  const op = 150;
  const { ink } = THEMES[theme];
  const size = 76;
  const lh = 88;
  const x = 24;
  const l1 = typeLayer("line 1", "Speak up,", { x, y: 84, size, color: ink, start: 2, op });
  const pre = type("one ", { size }).width;
  const l2a = typeLayer("line 2a", "one ", { x, y: 84 + lh, size, color: ink, start: 22, op });
  const l2b = typeLayer("small", "small", { x: x + pre, y: 84 + lh, size, color: hex("#13262b"), start: 30, op, motion: "pop" });
  const smallW = type("small", { size }).width;
  const l2c = typeLayer("line 2c", " step", { x: x + pre + smallW, y: 84 + lh, size, color: ink, start: 44, op });
  const l3 = typeLayer("line 3", "at a time.", { x, y: 84 + lh * 2, size, color: ink, start: 58, op });
  const bar = sweep("sweep", { x: x + pre - 10, y: 84 + lh - l2b.capHeight / 2 + 4, w: smallW + 20, h: l2b.capHeight + 34, color: C.sun, start: 24, op });
  return doc("Welcome", 640, 300, op, [l1.layer, l2a.layer, l2b.layer, l2c.layer, l3.layer, bar]);
}

/** Step done: a teal check pops, then "That took / courage." stamps in letter by letter, underlined in sun. */
function courage(theme) {
  ind = 0;
  const op = 120;
  const { ink, muted } = THEMES[theme];
  const cx = 110;
  const cy = 130;
  const check = layer(
    "check",
    [group("tick", [path([[-30, 2], [-8, 24], [34, -22]]), trim(anim([[12, 0, EASE.settle], [30, 100]])), stroke(C.ink, 14)])],
    { op, ks: { p: [cx, cy, 0] } },
  );
  const disc = layer("disc", [group("disc", [el([0, 0], [150, 150]), fill(C.teal), stroke(C.white, 12)])], {
    op,
    ks: { p: [cx, cy, 0], s: anim([[0, [0, 0, 100], EASE.pop], [14, [112, 112, 100], EASE.settle], [26, [100, 100, 100]]]), r: anim([[0, -24, EASE.pop], [26, -6]]) },
  });
  const inks = [C.sun, C.sky, C.coral, C.grape, C.lime, C.sun];
  const burst = layer(
    "burst",
    inks.map((c, i) => {
      const a = (i / inks.length) * Math.PI * 2 - Math.PI / 2;
      return group(`dot ${i}`, [el([0, 0], [16, 16]), fill(c), stroke(C.white, 4)], {
        p: anim([[8, [0, 0], EASE.settle], [40, [Math.cos(a) * 112, Math.sin(a) * 112]]]),
        s: anim([[8, [40, 40], EASE.settle], [26, [100, 100], EASE.exit], [52, [0, 0]]]),
      });
    }),
    { op, ks: { p: [cx, cy, 0] } },
  );
  const tx = 222;
  const top = typeLayer("that took", "That took", { x: tx, y: 104, size: 40, weight: 700, color: muted, start: 16, stagger: 2, op });
  const big = typeLayer("courage", "courage.", { x: tx, y: 186, size: 80, color: ink, start: 26, stagger: 3, dur: 20, motion: "pop", op });
  const under = layer(
    "underline",
    [group("swoosh", [path([[0, 0], [big.width - 20, -4]], false, [[0, 0], [-60, 8]], [[60, 10], [0, 0]]), trim(anim([[56, 0, EASE.settle], [76, 100]])), stroke(C.sun, 12)])],
    { op, ks: { p: [tx + 6, 208, 0] } },
  );
  return doc("That took courage", 640, 260, op, [check, disc, burst, top.layer, big.layer, under]);
}

/** Map: the six steps of every situation as rising stair blocks, labelled, with a lantern that hops to the top. */
function ladder(theme) {
  ind = 0;
  const op = 180;
  const { ink } = THEMES[theme];
  const labels = [["Think it"], ["Type or", "whisper it"], ["Say it out", "loud, alone"], ["Say it to", "the coach"], ["With a little", "pressure"], ["Try it", "for real"]];
  const inks = [C.sky, C.lime, C.sun, C.grape, C.coral, C.teal];
  const W = 960;
  const colW = 150;
  const x0 = 45;
  const floor = 320;
  const layers = [];
  const tops = [];
  labels.forEach((lines, k) => {
    const cx = x0 + k * colW + colW / 2;
    const h = 56 + k * 34;
    const t0 = 6 + k * 9;
    tops.push([cx, floor - h]);
    const n = type(String(k + 1), { size: 40 });
    layers.push(
      typeLayer(`number ${k + 1}`, String(k + 1), { x: cx - n.width / 2, y: floor - h + 50, size: 40, color: hex("#13262b"), start: t0 + 12, op, motion: "pop" }).layer,
    );
    layers.push(
      layer(`step ${k + 1}`, [group("block", [{ ty: "rc", d: 1, p: fixed([0, -h / 2]), s: fixed([colW - 18, h]), r: fixed(18) }, fill(inks[k]), stroke(C.white, 8)])], {
        op,
        ks: { p: [cx, floor, 0], s: anim([[t0, [100, 0, 100], EASE.pop], [t0 + 16, [100, 108, 100], EASE.settle], [t0 + 26, [100, 100, 100]]]) },
      }),
    );
    lines.forEach((text, j) => {
      const t = type(text, { size: 21, weight: 650 });
      layers.push(typeLayer(`label ${k + 1}.${j + 1}`, text, { x: cx - t.width / 2, y: floor + 38 + j * 26, size: 21, weight: 650, color: ink, start: t0 + 18, stagger: 1, dur: 16, op }).layer);
    });
  });
  // The lantern hops up the stairs, one arc per step, and rests beside the flag.
  const hopStart = 84;
  const hop = [];
  tops.forEach(([x, y], k) => {
    const t = hopStart + k * 14;
    if (k > 0) hop.push([t - 7, [(tops[k - 1][0] + x) / 2, Math.min(tops[k - 1][1], y) - 46], EASE.settle]);
    hop.push([t, [x - 30, y - 20], EASE.exit]);
  });
  const lantern = layer(
    "lantern",
    [
      group("glow", [el([0, 0], [56, 56]), fill(C.sun, 30)]),
      group("light", [el([0, 0], [26, 26]), fill(C.sun), stroke(C.white, 5)]),
    ],
    { op, ks: { p: anim([[0, [tops[0][0] - 30, tops[0][1] - 20], EASE.travel], ...hop]), o: anim([[hopStart - 8, 0, EASE.settle], [hopStart, 100]]) } },
  );
  const [fx, fy] = tops[5];
  const flag = layer(
    "flag",
    [
      group("cloth", [path([[4, -64], [44, -52], [4, -40]], true), fill(C.coral), stroke(C.white, 5)]),
      group("pole", [path([[0, 0], [0, -66]]), stroke(ink, 5)]),
    ],
    { op, ks: { p: [fx + 22, fy, 0], s: anim([[70, [100, 0, 100], EASE.pop], [84, [100, 110, 100], EASE.settle], [92, [100, 100, 100]]]) } },
  );
  return doc("The courage ladder", W, 420, op, [lantern, flag, ...layers]);
}

/** Phones: the same ladder as a diagonal staircase climbing up to the right, each label beside its step. */
function ladderTall(theme) {
  ind = 0;
  const op = 180;
  const { ink } = THEMES[theme];
  const labels = ["Think it", "Type or whisper it", "Say it out loud", "Say it to the coach", "A little pressure", "Try it for real"];
  const inks = [C.sky, C.lime, C.sun, C.grape, C.coral, C.teal];
  const size = 76;
  const gap = 104;
  const layers = [];
  const tops = [];
  labels.forEach((text, k) => {
    const x = 40 + k * 34;
    const y = 700 - k * gap;
    const t0 = 6 + k * 9;
    const cx = x + size / 2;
    tops.push([cx, y - size]);
    const n = type(String(k + 1), { size: 38 });
    layers.push(typeLayer(`number ${k + 1}`, String(k + 1), { x: cx - n.width / 2, y: y - size / 2 + 13, size: 38, color: hex("#13262b"), start: t0 + 10, op, motion: "pop" }).layer);
    layers.push(
      layer(`step ${k + 1}`, [group("block", [{ ty: "rc", d: 1, p: fixed([0, -size / 2]), s: fixed([size, size]), r: fixed(20) }, fill(inks[k]), stroke(C.white, 8)])], {
        op,
        ks: { p: [cx, y, 0], s: anim([[t0, [0, 0, 100], EASE.pop], [t0 + 14, [110, 110, 100], EASE.settle], [t0 + 24, [100, 100, 100]]]), r: k % 2 ? 3 : -3 },
      }),
    );
    layers.push(typeLayer(`label ${k + 1}`, text, { x: x + size + 26, y: y - size / 2 + 12, size: 34, weight: 700, color: ink, start: t0 + 14, stagger: 1, dur: 16, op }).layer);
  });
  const hopStart = 84;
  const hop = [];
  tops.forEach(([x, y], k) => {
    const t = hopStart + k * 14;
    if (k > 0) hop.push([t - 7, [(tops[k - 1][0] + x) / 2 - 40, y - 30], EASE.settle]);
    hop.push([t, [x - 58, y + 8], EASE.exit]);
  });
  const lantern = layer(
    "lantern",
    [group("glow", [el([0, 0], [52, 52]), fill(C.sun, 30)]), group("light", [el([0, 0], [24, 24]), fill(C.sun), stroke(C.white, 5)])],
    { op, ks: { p: anim([[0, [tops[0][0] - 58, tops[0][1] + 8], EASE.travel], ...hop]), o: anim([[hopStart - 8, 0, EASE.settle], [hopStart, 100]]) } },
  );
  return doc("The courage ladder, tall", 600, 740, op, [lantern, ...layers]);
}

const out = [join(process.cwd(), "public/lottie")];
const player = process.argv[2];
mkdirSync(out[0], { recursive: true });
writeFileSync(join(out[0], "firefly.json"), JSON.stringify(firefly()));
writeFileSync(join(out[0], "step-done.json"), JSON.stringify(stepDone()));
writeFileSync(join(out[0], "kit.json"), JSON.stringify(kit()));
writeFileSync(join(out[0], "badges.json"), JSON.stringify(badges()));
// Glyph atlas for type built in the browser (the Home greeting with the person's name).
{
  const chars = [...Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)), "’", "é", "è", "á", "à", "í", "ó", "ú", "ñ", "ç", "ö", "ü", "ä", "ë", "ï", "ş", "ğ", "ı"];
  const atlas = { size: 100, capHeight: 0, glyphs: {} };
  for (const c of chars) {
    const t = type(c, { size: 100 });
    atlas.capHeight = t.capHeight;
    atlas.glyphs[c] = { w: +t.width.toFixed(2), s: t.glyphs[0]?.shapes ?? [] };
  }
  writeFileSync(join(out[0], "glyphs.json"), JSON.stringify(atlas));
}
for (const theme of ["light", "dark"]) {
  const suffix = theme === "dark" ? "-dark" : "";
  writeFileSync(join(out[0], `welcome${suffix}.json`), JSON.stringify(welcome(theme)));
  writeFileSync(join(out[0], `courage${suffix}.json`), JSON.stringify(courage(theme)));
  writeFileSync(join(out[0], `ladder${suffix}.json`), JSON.stringify(ladder(theme)));
  writeFileSync(join(out[0], `ladder-tall${suffix}.json`), JSON.stringify(ladderTall(theme)));
}
if (player) {
  for (const [scene, make] of [["scene-1", firefly], ["scene-2", stepDone], ["scene-3", kit], ["scene-4", badges], ["scene-5", () => welcome("light")], ["scene-6", () => courage("light")], ["scene-7", () => ladder("light")], ["scene-8", () => ladderTall("light")]]) {
    const dir = join(player, "public/projects/courage", scene);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "lottie.json"), JSON.stringify(make(), null, 1));
  }
}
console.log("Built firefly, step-done, kit and badges");
