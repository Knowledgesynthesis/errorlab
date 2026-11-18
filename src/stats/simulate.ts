/**
 * Monte Carlo simulation of studies.
 *
 * Studies are simulated exactly but cheaply from their sufficient statistics:
 * for normal data the estimate is N(δ, SE²) and the variance estimate is
 * σ²·χ²(df)/df, independent of the estimate. Results therefore match the
 * analytic power functions in design.ts up to Monte Carlo error.
 */

import { confidenceInterval, degreesOfFreedom, pValue, seFactor, standardError, type Design } from './design';

export type Rng = () => number;

/** mulberry32: small, fast, well-distributed 32-bit PRNG. Returns [0, 1). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}

/** Standard normal generator (Box–Muller, both variates used). */
export function normalGenerator(rng: Rng): () => number {
  let spare: number | null = null;
  return () => {
    if (spare !== null) {
      const v = spare;
      spare = null;
      return v;
    }
    const u1 = 1 - rng(); // (0, 1]: avoids log(0)
    const u2 = rng();
    const r = Math.sqrt(-2 * Math.log(u1));
    spare = r * Math.sin(2 * Math.PI * u2);
    return r * Math.cos(2 * Math.PI * u2);
  };
}

/** Gamma(shape, 1) variate, Marsaglia & Tsang (2000). */
export function gammaVariate(shape: number, rng: Rng, normal: () => number): number {
  if (shape < 1) {
    const u = 1 - rng();
    return gammaVariate(shape + 1, rng, normal) * Math.pow(u, 1 / shape);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number;
    let v: number;
    do {
      x = normal();
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = 1 - rng();
    if (u < 1 - 0.0331 * x ** 4) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

export function chiSquareVariate(df: number, rng: Rng, normal: () => number): number {
  return 2 * gammaVariate(df / 2, rng, normal);
}

export interface SimulatedStudies {
  estimate: Float64Array;
  /** standard error actually used by the test (estimated for t tests) */
  se: Float64Array;
  stat: Float64Array;
  p: Float64Array;
  significant: Uint8Array;
  count: number;
  rejectRate: number;
}

/** Simulate `count` independent studies with the given design and true δ. */
export function simulateStudies(d: Design, count: number, seed: number, delta: number = d.delta): SimulatedStudies {
  const rng = mulberry32(seed);
  const normal = normalGenerator(rng);
  const seTrue = standardError(d);
  const k = seFactor(d);
  const df = degreesOfFreedom({ ...d, test: 't' });
  const estimate = new Float64Array(count);
  const se = new Float64Array(count);
  const stat = new Float64Array(count);
  const p = new Float64Array(count);
  const significant = new Uint8Array(count);
  let rejections = 0;
  for (let i = 0; i < count; i++) {
    const est = delta + seTrue * normal();
    let seUsed = seTrue;
    if (d.test === 't') {
      const s = d.sigma * Math.sqrt(chiSquareVariate(df, rng, normal) / df);
      seUsed = s * k;
    }
    const z = est / seUsed;
    const pv = pValue(z, d);
    estimate[i] = est;
    se[i] = seUsed;
    stat[i] = z;
    p[i] = pv;
    const sig = pv <= d.alpha ? 1 : 0;
    significant[i] = sig;
    rejections += sig;
  }
  return { estimate, se, stat, p, significant, count, rejectRate: rejections / count };
}

export interface RawSample {
  groupA: number[];
  /** empty for one-sample designs */
  groupB: number[];
  estimate: number;
  sd: number;
  se: number;
  stat: number;
  df: number;
  p: number;
  ci: [number, number];
  significant: boolean;
}

/** Draw one complete dataset (individual observations) and analyse it. */
export function drawSample(d: Design, seed: number, delta: number = d.delta): RawSample {
  const rng = mulberry32(seed);
  const normal = normalGenerator(rng);
  const n = Math.round(d.n);
  const groupA: number[] = [];
  const groupB: number[] = [];
  if (d.design === 'one-sample') {
    for (let i = 0; i < n; i++) groupA.push(delta + d.sigma * normal());
  } else {
    for (let i = 0; i < n; i++) groupA.push(d.sigma * normal());
    for (let i = 0; i < n; i++) groupB.push(delta + d.sigma * normal());
  }
  const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const ss = (xs: number[], m: number) => xs.reduce((s, x) => s + (x - m) ** 2, 0);
  let estimate: number;
  let sd: number;
  if (d.design === 'one-sample') {
    const m = mean(groupA);
    estimate = m;
    sd = Math.sqrt(ss(groupA, m) / (n - 1));
  } else {
    const mA = mean(groupA);
    const mB = mean(groupB);
    estimate = mB - mA;
    sd = Math.sqrt((ss(groupA, mA) + ss(groupB, mB)) / (2 * n - 2)); // pooled SD
  }
  const se = (d.test === 'z' ? d.sigma : sd) * seFactor(d);
  const stat = estimate / se;
  const df = degreesOfFreedom(d);
  const p = pValue(stat, d);
  const ci = confidenceInterval(estimate, se, df, 1 - (d.alternative === 'two-sided' ? d.alpha : 2 * d.alpha));
  return { groupA, groupB, estimate, sd, se, stat, df, p, ci, significant: p <= d.alpha };
}

export interface PeekingResult {
  /** share of studies significant at any look (stopping at first p ≤ α) */
  anyLook: number;
  /** share significant at the final, pre-planned sample size only */
  finalOnly: number;
  looks: number[];
  /** p-value paths for the first few studies, one array per study */
  paths: { n: number; p: number }[][];
  /** per study: index of first look with p ≤ α, or −1 */
  firstHit: number[];
}

/**
 * Optional stopping: test after every `step` observations (per group) up to
 * `d.n`, stopping as soon as p ≤ α (Armitage, McPherson & Rowe 1969).
 */
export function simulatePeeking(d: Design, step: number, count: number, seed: number, keepPaths = 20, delta: number = d.delta): PeekingResult {
  const rng = mulberry32(seed);
  const normal = normalGenerator(rng);
  const nMax = Math.round(d.n);
  const looks: number[] = [];
  const first = Math.max(step, 2);
  for (let n = first; n < nMax; n += step) looks.push(n);
  if (looks[looks.length - 1] !== nMax) looks.push(nMax);
  let anyCount = 0;
  let finalCount = 0;
  const paths: { n: number; p: number }[][] = [];
  const firstHit: number[] = [];
  const twoGroup = d.design === 'two-sample';
  for (let s = 0; s < count; s++) {
    let sumA = 0;
    let sqA = 0;
    let sumB = 0;
    let sqB = 0;
    let taken = 0;
    let hit = -1;
    const path: { n: number; p: number }[] = [];
    let pFinal = 1;
    for (let li = 0; li < looks.length; li++) {
      const target = looks[li];
      for (; taken < target; taken++) {
        const a = (twoGroup ? 0 : delta) + d.sigma * normal();
        sumA += a;
        sqA += a * a;
        if (twoGroup) {
          const b = delta + d.sigma * normal();
          sumB += b;
          sqB += b * b;
        }
      }
      const n = target;
      const look: Design = { ...d, n };
      let est: number;
      let sd: number;
      if (!twoGroup) {
        est = sumA / n;
        sd = Math.sqrt(Math.max(0, (sqA - n * est * est) / (n - 1)));
      } else {
        const mA = sumA / n;
        const mB = sumB / n;
        est = mB - mA;
        sd = Math.sqrt(Math.max(0, (sqA - n * mA * mA + sqB - n * mB * mB) / (2 * n - 2)));
      }
      const se = (d.test === 'z' ? d.sigma : sd) * seFactor(look);
      const p = se > 0 ? pValue(est / se, look) : 1;
      if (s < keepPaths) path.push({ n, p });
      if (hit < 0 && p <= d.alpha) hit = li;
      if (li === looks.length - 1) pFinal = p;
    }
    if (hit >= 0) anyCount++;
    if (pFinal <= d.alpha) finalCount++;
    if (s < keepPaths) {
      paths.push(path);
      firstHit.push(hit);
    }
  }
  return { anyLook: anyCount / count, finalOnly: finalCount / count, looks, paths, firstHit };
}

export interface FamilyTest {
  p: number;
  isReal: boolean;
}

/** Simulate one family of m tests, `real` of which have a true effect with noncentrality λ. */
export function simulateFamily(m: number, real: number, lambda: number, seed: number): FamilyTest[] {
  const rng = mulberry32(seed);
  const normal = normalGenerator(rng);
  const out: FamilyTest[] = [];
  for (let i = 0; i < m; i++) {
    const isReal = i < real;
    const z = (isReal ? lambda : 0) + normal();
    out.push({ p: pValue(z, { alternative: 'two-sided', design: 'one-sample', n: 2, test: 'z' }), isReal });
  }
  return out;
}
