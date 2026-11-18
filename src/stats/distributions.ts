/**
 * Probability distributions used throughout ErrorLab.
 *
 * Accuracy targets (verified against SciPy in distributions.test.ts):
 *  - normal CDF/SF: ~1e-14 relative, including far tails (|z| up to 37)
 *  - normal quantile: ~1e-15 after one Halley refinement step
 *  - Student t CDF/quantile: ~1e-12 for df >= 1
 *  - noncentral t CDF/PDF: ~1e-9 (numerical integration over the chi distribution)
 */

const SQRT_2PI = Math.sqrt(2 * Math.PI);
const LOG_SQRT_2PI = 0.5 * Math.log(2 * Math.PI);

// ---------------------------------------------------------------------------
// Normal distribution
// ---------------------------------------------------------------------------

export function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / SQRT_2PI;
}

/**
 * Standard normal lower-tail CDF Φ(x) in double precision.
 * |x| < 3: Hart (1968) algorithm 5666 (West, Wilmott Magazine 2005).
 * |x| ≥ 3: Laplace's continued fraction for the Mills ratio, 80 terms.
 * Tail values stay accurate in relative terms (~1e-15) out to |x| = 37.
 */
export function normCdf(x: number): number {
  if (Number.isNaN(x)) return NaN;
  const z = Math.abs(x);
  let tail: number;
  if (z > 37) {
    tail = 0;
  } else {
    const e = Math.exp(-0.5 * z * z);
    if (z < 3) {
      let num = 3.52624965998911e-2 * z + 0.700383064443688;
      num = num * z + 6.37396220353165;
      num = num * z + 33.912866078383;
      num = num * z + 112.079291497871;
      num = num * z + 221.213596169931;
      num = num * z + 220.206867912376;
      let den = 8.83883476483184e-2 * z + 1.75566716318264;
      den = den * z + 16.064177579207;
      den = den * z + 86.7807322029461;
      den = den * z + 296.564248779674;
      den = den * z + 637.333633378831;
      den = den * z + 793.826512519948;
      den = den * z + 440.413735824752;
      tail = (e * num) / den;
    } else {
      let f = z;
      for (let k = 80; k >= 1; k--) f = z + k / f;
      tail = e / f / SQRT_2PI;
    }
  }
  return x > 0 ? 1 - tail : tail;
}

/** Upper tail 1 − Φ(x), computed without cancellation. */
export function normSf(x: number): number {
  return normCdf(-x);
}

/**
 * Standard normal quantile Φ⁻¹(p).
 * Acklam's rational approximation followed by one Halley step using the
 * accurate CDF above. Pass small tail probabilities directly (e.g. use
 * -normQuantile(alpha) for an upper critical value) to avoid 1 − p rounding.
 */
export function normQuantile(p: number): number {
  if (!(p > 0 && p < 1)) {
    if (p === 0) return -Infinity;
    if (p === 1) return Infinity;
    return NaN;
  }
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pLow = 0.02425;
  let x: number;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= 1 - pLow) {
    const q = p - 0.5;
    const r = q * q;
    x = ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  // Halley refinement. Work in the tail that is small to keep precision.
  const err = p < 0.5 ? normCdf(x) - p : -(normSf(x) - (1 - p));
  const u = err * SQRT_2PI * Math.exp(0.5 * x * x);
  return x - u / (1 + 0.5 * x * u);
}

// ---------------------------------------------------------------------------
// Gamma / Beta helpers
// ---------------------------------------------------------------------------

const LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
  12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
];

/** log Γ(x) via the Lanczos approximation (g = 7, n = 9); ~1e-15 relative. */
export function logGamma(x: number): number {
  if (x < 0.5) {
    return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - logGamma(1 - x);
  }
  const xm1 = x - 1;
  let s = LANCZOS[0];
  for (let i = 1; i < 9; i++) s += LANCZOS[i] / (xm1 + i);
  const t = xm1 + 7.5;
  return LOG_SQRT_2PI + (xm1 + 0.5) * Math.log(t) - t + Math.log(s);
}

/** Continued fraction for the incomplete beta function (modified Lentz). */
function betaContinuedFraction(x: number, a: number, b: number): number {
  const TINY = 1e-300;
  const EPS = 1e-15;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < TINY) d = TINY;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 5000; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/**
 * Regularized incomplete beta I_x(a, b). `y` must equal 1 − x; pass it
 * explicitly when it can be computed without cancellation.
 */
export function betaInc(x: number, a: number, b: number, y: number = 1 - x): number {
  if (x <= 0) return 0;
  if (y <= 0) return 1;
  const logFront = logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(y);
  const front = Math.exp(logFront);
  if (x < (a + 1) / (a + b + 2)) {
    return (front * betaContinuedFraction(x, a, b)) / a;
  }
  return 1 - (front * betaContinuedFraction(y, b, a)) / b;
}

// ---------------------------------------------------------------------------
// Student's t distribution
// ---------------------------------------------------------------------------

export function tPdf(t: number, df: number): number {
  if (!Number.isFinite(df)) return normPdf(t);
  const logC = logGamma((df + 1) / 2) - logGamma(df / 2) - 0.5 * Math.log(df * Math.PI);
  return Math.exp(logC - ((df + 1) / 2) * Math.log1p((t * t) / df));
}

/** Lower-tail CDF of Student's t with `df` degrees of freedom (df = Infinity → normal). */
export function tCdf(t: number, df: number): number {
  if (Number.isNaN(t)) return NaN;
  if (!Number.isFinite(df)) return normCdf(t);
  if (t === Infinity) return 1;
  if (t === -Infinity) return 0;
  const t2 = t * t;
  const x = df / (df + t2);
  const y = t2 / (df + t2);
  const tail = 0.5 * betaInc(x, df / 2, 0.5, y); // P(T > |t|)
  return t > 0 ? 1 - tail : tail;
}

export function tSf(t: number, df: number): number {
  return tCdf(-t, df);
}

/** Quantile of Student's t. Robust bracketed Newton iteration. */
export function tQuantile(p: number, df: number): number {
  if (!Number.isFinite(df)) return normQuantile(p);
  if (!(p > 0 && p < 1)) {
    if (p === 0) return -Infinity;
    if (p === 1) return Infinity;
    return NaN;
  }
  if (p === 0.5) return 0;
  if (p > 0.5) return -tQuantile(1 - p, df);
  // Exact closed forms for df = 1 and df = 2.
  if (df === 1) return Math.tan(Math.PI * (p - 0.5));
  if (df === 2) return (2 * p - 1) / Math.sqrt(2 * p * (1 - p));
  // Initial guess: Cornish–Fisher expansion (Abramowitz & Stegun 26.7.5).
  const z = normQuantile(p);
  const g1 = (z ** 3 + z) / 4;
  const g2 = (5 * z ** 5 + 16 * z ** 3 + 3 * z) / 96;
  const g3 = (3 * z ** 7 + 19 * z ** 5 + 17 * z ** 3 - 15 * z) / 384;
  let x = z + g1 / df + g2 / df ** 2 + g3 / df ** 3;
  // Bracket: the quantile lies in (lo, 0).
  let lo = Math.min(x * 2, -1);
  while (tCdf(lo, df) > p) lo *= 2;
  let hi = 0;
  if (!(x > lo && x < hi)) x = 0.5 * (lo + hi);
  for (let i = 0; i < 100; i++) {
    const f = tCdf(x, df) - p;
    if (f > 0) hi = x;
    else lo = x;
    let next = x - f / tPdf(x, df);
    if (!(next > lo && next < hi)) next = 0.5 * (lo + hi);
    if (Math.abs(next - x) <= 1e-13 * Math.max(1, Math.abs(x))) return next;
    x = next;
  }
  return x;
}

// ---------------------------------------------------------------------------
// Noncentral t distribution
// T' = (Z + λ) / S with S = sqrt(V/ν), V ~ χ²(ν).
// P(T' ≤ t) = ∫ Φ(t·s − λ) g(s) ds, f(t) = ∫ s·φ(t·s − λ) g(s) ds,
// where g is the density of S. Integrated with composite Simpson's rule
// on a grid that adapts to ν; weights are cached per ν.
// ---------------------------------------------------------------------------

interface ChiGrid {
  s: Float64Array;
  w: Float64Array;
}

const chiGridCache = new Map<number, ChiGrid>();
const CHI_INTERVALS = 800;

function chiGrid(df: number): ChiGrid {
  const cached = chiGridCache.get(df);
  if (cached) return cached;
  const spread = 14 / Math.sqrt(2 * df);
  const lo = Math.max(0, 1 - spread);
  const hi = 1 + spread * (df < 10 ? 1.6 : 1);
  const n = CHI_INTERVALS;
  const h = (hi - lo) / n;
  const logC = (df / 2) * Math.log(df) - (df / 2 - 1) * Math.LN2 - logGamma(df / 2);
  const s = new Float64Array(n + 1);
  const w = new Float64Array(n + 1);
  let total = 0;
  for (let i = 0; i <= n; i++) {
    const si = lo + i * h;
    s[i] = si;
    let dens = 0;
    if (si > 0) dens = Math.exp(logC + (df - 1) * Math.log(si) - (df * si * si) / 2);
    else if (df === 1) dens = Math.exp(logC);
    const simpson = i === 0 || i === n ? 1 : i % 2 === 1 ? 4 : 2;
    w[i] = (simpson * h * dens) / 3;
    total += w[i];
  }
  // Normalise so the weights integrate to exactly 1.
  for (let i = 0; i <= n; i++) w[i] /= total;
  const grid = { s, w };
  if (chiGridCache.size > 64) chiGridCache.clear();
  chiGridCache.set(df, grid);
  return grid;
}

export function nctCdf(t: number, df: number, ncp: number): number {
  if (!Number.isFinite(df)) return normCdf(t - ncp);
  if (ncp === 0) return tCdf(t, df);
  const { s, w } = chiGrid(df);
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum += w[i] * normCdf(t * s[i] - ncp);
  return Math.min(1, Math.max(0, sum));
}

/** Upper tail P(T' > t), computed directly so small tails keep their precision. */
export function nctSf(t: number, df: number, ncp: number): number {
  if (!Number.isFinite(df)) return normSf(t - ncp);
  if (ncp === 0) return tSf(t, df);
  const { s, w } = chiGrid(df);
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum += w[i] * normCdf(ncp - t * s[i]);
  return Math.min(1, Math.max(0, sum));
}

export function nctPdf(t: number, df: number, ncp: number): number {
  if (!Number.isFinite(df)) return normPdf(t - ncp);
  if (ncp === 0) return tPdf(t, df);
  const { s, w } = chiGrid(df);
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum += w[i] * s[i] * normPdf(t * s[i] - ncp);
  return sum;
}
