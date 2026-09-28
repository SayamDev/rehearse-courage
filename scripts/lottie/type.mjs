// Vector type for Lottie: lays out text with fontkit (Bricolage Grotesque,
// variable) and turns every glyph into Lottie bezier paths. No font is
// needed at runtime, so the type renders the same in Skottie and lottie-web.
import * as fontkit from "fontkit";

/** One contour's commands as a Lottie "sh" shape (y flipped, scaled, offset). */
function contourShapes(commands, scale, dx, dy) {
  const shapes = [];
  let v = [];
  let ins = [];
  let outs = [];
  let cur = null;
  const pt = (x, y) => [dx + x * scale, dy - y * scale];
  const flush = (closed) => {
    if (v.length > 1) {
      // A closing point on top of the start point merges into it.
      const [fx, fy] = v[0];
      const [lx, ly] = v[v.length - 1];
      if (closed && Math.hypot(fx - lx, fy - ly) < 0.01) {
        ins[0] = ins[ins.length - 1];
        v.pop();
        ins.pop();
        outs.pop();
      }
      shapes.push({
        ty: "sh",
        ks: {
          a: 0,
          k: { c: closed, v: v.map((p) => p.map((n) => +n.toFixed(2))), i: ins.map((p) => p.map((n) => +n.toFixed(2))), o: outs.map((p) => p.map((n) => +n.toFixed(2))) },
        },
      });
    }
    v = [];
    ins = [];
    outs = [];
  };
  const push = (p, inTangent) => {
    v.push(p);
    ins.push(inTangent);
    outs.push([0, 0]);
  };
  for (const c of commands) {
    const a = c.args;
    if (c.command === "moveTo") {
      flush(true);
      cur = pt(a[0], a[1]);
      push(cur, [0, 0]);
    } else if (c.command === "lineTo") {
      cur = pt(a[0], a[1]);
      push(cur, [0, 0]);
    } else if (c.command === "quadraticCurveTo") {
      const q = pt(a[0], a[1]);
      const e = pt(a[2], a[3]);
      const c1 = [cur[0] + (2 / 3) * (q[0] - cur[0]), cur[1] + (2 / 3) * (q[1] - cur[1])];
      const c2 = [e[0] + (2 / 3) * (q[0] - e[0]), e[1] + (2 / 3) * (q[1] - e[1])];
      outs[outs.length - 1] = [c1[0] - cur[0], c1[1] - cur[1]];
      push(e, [c2[0] - e[0], c2[1] - e[1]]);
      cur = e;
    } else if (c.command === "bezierCurveTo") {
      const c1 = pt(a[0], a[1]);
      const c2 = pt(a[2], a[3]);
      const e = pt(a[4], a[5]);
      outs[outs.length - 1] = [c1[0] - cur[0], c1[1] - cur[1]];
      push(e, [c2[0] - e[0], c2[1] - e[1]]);
      cur = e;
    } else if (c.command === "closePath") {
      flush(true);
    }
  }
  flush(true);
  return shapes;
}

export function loadType(path) {
  const base = fontkit.openSync(path);
  /**
   * Lays out one line. Returns its width and one entry per visible glyph:
   * the glyph's paths (baseline at y = 0, starting at x = 0), its x and
   * width, and its centre, for per-letter animation.
   */
  return function line(text, { size = 64, weight = 800, opsz = 48, tracking = -0.02 } = {}) {
    const font = base.getVariation({ wght: weight, opsz });
    const scale = size / font.unitsPerEm;
    const run = font.layout(text);
    let x = 0;
    const glyphs = [];
    run.glyphs.forEach((g, i) => {
      const pos = run.positions[i];
      const adv = pos.xAdvance * scale + tracking * size;
      const shapes = contourShapes(g.path.commands, scale, x + pos.xOffset * scale, -pos.yOffset * scale);
      if (shapes.length) glyphs.push({ char: String.fromCodePoint(...(g.codePoints ?? [32])), x, w: adv, cx: x + adv / 2, shapes });
      x += adv;
    });
    return { width: x - tracking * size, glyphs, capHeight: font.capHeight * scale, xHeight: font.xHeight * scale };
  };
}
