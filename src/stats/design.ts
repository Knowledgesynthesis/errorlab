/**
 * Test design, power and related operating characteristics for tests of a
 * mean (one-sample or paired) or a difference of two means (two independent
 * groups of equal size, pooled-variance t or known-σ z).
 */

import { nctCdf, nctSf, normCdf, normPdf, normQuantile, normSf, tCdf, tQuantile, tSf } from './distributions';

export type Alternative = 'two-sided' | 'greater' | 'less';
export type TestKind = 'z' | 't';
export type DesignKind = 'one-sample' | 'two-sample';

export interface Design {
  /** one-sample (also paired differences) or two independent groups */
  design: DesignKind;
  /** z: σ known; t: σ estimated from the data */
  test: TestKind;
  alternative: Alternative;
  /** significance level, chosen before seeing data */
  alpha: number;
  /** sample size (per group for two-sample designs) */
  n: number;
  /** true mean difference in outcome units (signed; 0 means H₀ is true) */
  delta: number;
  /** standard deviation of individual observations (of differences, if paired) */
  sigma: number;
}

export const DEFAULT_DESIGN: Design = {
  design: 'two-sample',
  test: 't',
  alternative: 'two-sided',
  alpha: 0.05,
  n: 50,
  delta: 0.5,
  sigma: 1,
};

/** Smallest n (per group) that leaves the t test at least 1 degree of freedom. */
export const MIN_N = 2;

/** SE multiplier: SE = σ·k, with k = 1/√n (one sample) or √(2/n) (two groups). */
export function seFactor(d: Pick<Design, 'design' | 'n'>): number {
  return d.design === 'one-sample' ? 1 / Math.sqrt(d.n) : Math.sqrt(2 / d.n);
}

export function standardError(d: Pick<Design, 'design' | 'n' | 'sigma'>): number {
  return d.sigma * seFactor(d);
}

/** Degrees of freedom of the t statistic (Infinity for z). */
export function degreesOfFreedom(d: Pick<Design, 'design' | 'n' | 'test'>): number {
  if (d.test === 'z') return Infinity;
  return d.design === 'one-sample' ? d.n - 1 : 2 * d.n - 2;
}

/** Standardized effect size (Cohen's d) = δ / σ. */
export function cohensD(d: Pick<Design, 'delta' | 'sigma'>): number {
  return d.delta / d.sigma;
}

/** Noncentrality λ = δ / SE: where the test statistic is centred under H₁. */
export function noncentrality(d: Design, delta: number = d.delta): number {
  return delta / standardError(d);
}

/** Upper-tail quantile of the null distribution: P(T > c) = p. */
export function upperQuantile(p: number, df: number): number {
  return Number.isFinite(df) ? -tQuantile(p, df) : -normQuantile(p);
}

export interface CriticalValues {
  /** reject when statistic ≤ lower (null if no lower region) */
  lower: number | null;
  /** reject when statistic ≥ upper (null if no upper region) */
  upper: number | null;
}

export function criticalValues(d: Pick<Design, 'alpha' | 'alternative' | 'design' | 'n' | 'test'>): CriticalValues {
  const df = degreesOfFreedom(d);
  switch (d.alternative) {
    case 'greater':
      return { lower: null, upper: upperQuantile(d.alpha, df) };
    case 'less':
      return { lower: -upperQuantile(d.alpha, df), upper: null };
    case 'two-sided': {
      const c = upperQuantile(d.alpha / 2, df);
      return { lower: -c, upper: c };
    }
  }
}

/** Null-distribution CDF and survival function for this design. */
export function nullCdf(x: number, df: number): number {
  return Number.isFinite(df) ? tCdf(x, df) : normCdf(x);
}
export function nullSf(x: number, df: number): number {
  return Number.isFinite(df) ? tSf(x, df) : normSf(x);
}

/** Probability that the statistic (centred at λ) exceeds x / falls below x. */
function shiftedSf(x: number, df: number, lambda: number): number {
  return Number.isFinite(df) ? nctSf(x, df, lambda) : normSf(x - lambda);
}
function shiftedCdf(x: number, df: number, lambda: number): number {
  return Number.isFinite(df) ? nctCdf(x, df, lambda) : normCdf(x - lambda);
}

/**
 * Exact probability of rejecting H₀ when the true difference is `delta`.
 * Equals α at delta = 0, and power otherwise. Uses the noncentral t
 * distribution for t tests and the normal distribution for z tests.
 */
export function rejectionProbability(d: Design, delta: number = d.delta): number {
  const df = degreesOfFreedom(d);
  const { lower, upper } = criticalValues(d);
  const lambda = noncentrality(d, delta);
  let p = 0;
  if (upper !== null) p += shiftedSf(upper, df, lambda);
  if (lower !== null) p += shiftedCdf(lower, df, lambda);
  return Math.min(1, Math.max(0, p));
}

export interface OperatingCharacteristics {
  se: number;
  df: number;
  d: number;
  lambda: number;
  critical: CriticalValues;
  power: number;
  beta: number;
}

export function operatingCharacteristics(d: Design): OperatingCharacteristics {
  const power = rejectionProbability(d);
  return {
    se: standardError(d),
    df: degreesOfFreedom(d),
    d: cohensD(d),
    lambda: noncentrality(d),
    critical: criticalValues(d),
    power,
    beta: 1 - power,
  };
}

/** p-value of an observed test statistic under this design's alternative. */
export function pValue(stat: number, d: Pick<Design, 'alternative' | 'design' | 'n' | 'test'>): number {
  const df = degreesOfFreedom(d);
  switch (d.alternative) {
    case 'greater':
      return nullSf(stat, df);
    case 'less':
      return nullCdf(stat, df);
    case 'two-sided':
      return Math.min(1, 2 * nullSf(Math.abs(stat), df));
  }
}

/** Smallest n (per group) with power ≥ target, or null if not reachable below nMax. */
export function requiredN(d: Design, targetPower: number, nMax = 1_000_000): number | null {
  if (d.delta === 0) return null;
  const at = (n: number) => rejectionProbability({ ...d, n });
  let lo = MIN_N;
  if (at(lo) >= targetPower) return lo;
  let hi = lo * 2;
  while (at(hi) < targetPower) {
    lo = hi;
    hi *= 2;
    if (hi > nMax) {
      if (at(nMax) < targetPower) return null;
      hi = nMax;
      break;
    }
  }
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (at(mid) >= targetPower) hi = mid;
    else lo = mid;
  }
  return hi;
}

/**
 * Minimum detectable effect: smallest |δ| (in outcome units) detected with
 * the target power, in the direction the alternative looks (positive for
 * two-sided and 'greater', negative for 'less').
 */
export function minimumDetectableEffect(d: Design, targetPower: number): number {
  const sign = d.alternative === 'less' ? -1 : 1;
  const at = (m: number) => rejectionProbability(d, sign * m);
  let lo = 0;
  let hi = d.sigma;
  while (at(hi) < targetPower) {
    lo = hi;
    hi *= 2;
    if (hi > 1e6 * d.sigma) return Infinity;
  }
  for (let i = 0; i < 80; i++) {
    const mid = 0.5 * (lo + hi);
    if (at(mid) >= targetPower) hi = mid;
    else lo = mid;
  }
  return sign * hi;
}

/**
 * Closed-form normal-approximation sample size (per group) for reference:
 * n = k·σ²(z₁₋α' + z₁₋β)²/δ², with k = 1 (one sample) or 2 (two groups),
 * α' = α/2 for two-sided tests. Ignores the far tail and t correction.
 */
export function approximateN(d: Design, targetPower: number): number {
  const za = -normQuantile(d.alternative === 'two-sided' ? d.alpha / 2 : d.alpha);
  const zb = -normQuantile(1 - targetPower);
  const k = d.design === 'one-sample' ? 1 : 2;
  return (k * (za + zb) ** 2) / cohensD(d) ** 2;
}

export interface SignMagnitude {
  /** P(significant estimate has the wrong sign | significant) */
  typeS: number;
  /** E(|estimate| | significant) / |δ|: the exaggeration ratio */
  exaggeration: number;
  /** probability of a significant result */
  power: number;
}

/**
 * Type S and Type M (exaggeration) errors, Gelman & Carlin (2014).
 * Normal approximation: estimate ~ N(δ, SE²) with the design's critical
 * values on the estimate scale. Returns null when δ = 0.
 */
export function signAndMagnitude(d: Design): SignMagnitude | null {
  if (d.delta === 0) return null;
  const se = standardError(d);
  const { lower, upper } = criticalValues(d);
  const delta = d.delta;
  let pUp = 0;
  let ePartUp = 0;
  if (upper !== null) {
    const a = (upper * se - delta) / se;
    pUp = normSf(a);
    ePartUp = delta * pUp + se * normPdf(a);
  }
  let pLo = 0;
  let ePartLo = 0;
  if (lower !== null) {
    const b = (lower * se - delta) / se;
    pLo = normCdf(b);
    ePartLo = delta * pLo - se * normPdf(b);
  }
  const power = pUp + pLo;
  if (power <= 0) return null;
  const meanAbs = (ePartUp - ePartLo) / power;
  const wrong = delta > 0 ? pLo : pUp;
  return { typeS: wrong / power, exaggeration: meanAbs / Math.abs(delta), power };
}

export interface FalsePositiveRisk {
  /** P(H₀ true | significant): false positive risk / false discovery proportion */
  fpr: number;
  /** P(H₁ true | significant): positive predictive value */
  ppv: number;
  /** P(H₀ true | not significant) */
  npv: number;
}

/**
 * Long-run share of significant results that are false positives, given the
 * prior probability that a tested effect is real (Ioannidis 2005; Colquhoun 2014).
 */
export function falsePositiveRisk(alpha: number, power: number, prior: number): FalsePositiveRisk {
  const fp = alpha * (1 - prior);
  const tp = power * prior;
  const tn = (1 - alpha) * (1 - prior);
  const fn = (1 - power) * prior;
  const fpr = fp + tp > 0 ? fp / (fp + tp) : 0;
  return { fpr, ppv: 1 - fpr, npv: tn + fn > 0 ? tn / (tn + fn) : 1 };
}

/** Expected counts in the 2×2 table for a cohort of studies; cells add up exactly. */
export function naturalFrequencies(alpha: number, power: number, prior: number, cohort: number) {
  const real = Math.round(cohort * prior);
  const nulls = cohort - real;
  const fp = Math.round(nulls * alpha);
  const tp = Math.round(real * power);
  return { real, nulls, fp, tn: nulls - fp, tp, fn: real - tp };
}

/**
 * Upper bound on the Bayes factor in favour of H₁ that a p-value can
 * represent: 1 / (−e·p·ln p) for p < 1/e (Sellke, Bayarri & Berger 2001).
 */
export function bayesFactorBound(p: number): number {
  if (!(p > 0)) return Infinity;
  if (p >= 1 / Math.E) return 1;
  return 1 / (-Math.E * p * Math.log(p));
}

/** S-value (surprisal) in bits: −log₂ p (Rafi & Greenland 2020). */
export function sValue(p: number): number {
  return -Math.log2(p);
}

/** "Observed power": power at the observed estimate. A transform of p (Hoenig & Heisey 2001). */
export function observedPowerFromP(p: number, alpha = 0.05): number {
  // Two-sided z: observed |z| from p, then power treating it as the true λ.
  const z = -normQuantile(p / 2);
  const c = -normQuantile(alpha / 2);
  return normSf(c - z) + normCdf(-c - z);
}

/** Confidence interval for the mean difference (two-sided, level 1 − a). */
export function confidenceInterval(estimate: number, se: number, df: number, level = 0.95): [number, number] {
  const q = upperQuantile((1 - level) / 2, df);
  return [estimate - q * se, estimate + q * se];
}
