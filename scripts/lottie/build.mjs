// Builds the app's Lottie animations as plain JSON (no runtime dependency):
//   public/lottie/firefly.json    the firefly companion, a calm 3s loop
//   public/lottie/step-done.json  a teal check with a small sticker burst, plays once
//   public/lottie/kit.json        Body kit header: a calm disc breathing, 8s loop
//   public/lottie/badges.json     Badges header: a swaying medal with sparkles, 4s loop
// Run: node scripts/lottie/build.mjs [extra output dir for the Skottie player]
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

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

const out = [join(process.cwd(), "public/lottie")];
const player = process.argv[2];
mkdirSync(out[0], { recursive: true });
writeFileSync(join(out[0], "firefly.json"), JSON.stringify(firefly()));
writeFileSync(join(out[0], "step-done.json"), JSON.stringify(stepDone()));
writeFileSync(join(out[0], "kit.json"), JSON.stringify(kit()));
writeFileSync(join(out[0], "badges.json"), JSON.stringify(badges()));
if (player) {
  for (const [scene, make] of [["scene-1", firefly], ["scene-2", stepDone], ["scene-3", kit], ["scene-4", badges]]) {
    const dir = join(player, "public/projects/courage", scene);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "lottie.json"), JSON.stringify(make(), null, 1));
  }
}
console.log("Built firefly, step-done, kit and badges");
