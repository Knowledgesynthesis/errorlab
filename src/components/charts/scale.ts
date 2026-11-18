export interface Scale {
  (v: number): number;
  invert: (px: number) => number;
  domain: [number, number];
  range: [number, number];
}

export function linearScale(domain: [number, number], range: [number, number]): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  const f = ((v: number) => r0 + (v - d0) * k) as Scale;
  f.invert = (px: number) => (k === 0 ? d0 : d0 + (px - r0) / k);
  f.domain = domain;
  f.range = range;
  return f;
}

export function logScale(domain: [number, number], range: [number, number]): Scale {
  const l0 = Math.log(domain[0]);
  const l1 = Math.log(domain[1]);
  const lin = linearScale([l0, l1], range);
  const f = ((v: number) => lin(Math.log(Math.max(v, 1e-300)))) as Scale;
  f.invert = (px: number) => Math.exp(lin.invert(px));
  f.domain = domain;
  f.range = range;
  return f;
}

/** "Nice" round tick values covering [min, max]. */
export function niceTicks(min: number, max: number, count = 6): number[] {
  if (!(max > min)) return [min];
  const span = max - min;
  const raw = span / Math.max(1, count);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag;
  const start = Math.ceil(min / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 1e-9; v += step) ticks.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  return ticks;
}

/** Ticks at 1, 2, 5 × powers of ten within [min, max]. */
export function logTicks(min: number, max: number): number[] {
  const out: number[] = [];
  for (let e = Math.floor(Math.log10(min)); e <= Math.ceil(Math.log10(max)); e++) {
    for (const m of [1, 2, 5]) {
      const v = m * 10 ** e;
      if (v >= min * 0.999 && v <= max * 1.001) out.push(v);
    }
  }
  return out;
}

export function tickLabel(v: number): string {
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 10000) return `${v / 1000}k`;
  if (a >= 1) return String(Math.round(v * 100) / 100).replace(/^-/, '−');
  return String(Number(v.toPrecision(3))).replace(/^-/, '−');
}

/** Build an SVG path from points. */
export function linePath(points: [number, number][]): string {
  let d = '';
  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i];
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    d += `${d ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
  }
  return d;
}

/** Closed area path between a curve and a baseline y0. */
export function areaPath(points: [number, number][], y0: number): string {
  const pts = points.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(2)},${y0.toFixed(2)}`;
  for (const [x, y] of pts) d += `L${x.toFixed(2)},${y.toFixed(2)}`;
  d += `L${pts[pts.length - 1][0].toFixed(2)},${y0.toFixed(2)}Z`;
  return d;
}
