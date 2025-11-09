/**
 * Statistical utility functions for hypothesis testing
 */

import type { ExperimentState, DerivedValues, SampleData, TwoByTwoData } from '../types';

/**
 * Error function approximation (for normal CDF)
 */
function erf(x: number): number {
  // Abramowitz and Stegun approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

/**
 * Standard normal CDF (Φ)
 */
export function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

/**
 * Standard normal PDF (φ)
 */
export function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Inverse of standard normal CDF (quantile function)
 * Using rational approximation
 */
export function normalQuantile(p: number): number {
  if (p <= 0 || p >= 1) {
    throw new Error('Probability must be between 0 and 1');
  }

  // Coefficients for the approximation
  const a = [
    -3.969683028665376e+01, 2.209460984245205e+02,
    -2.759285104469687e+02, 1.383577518672690e+02,
    -3.066479806614716e+01, 2.506628277459239e+00
  ];

  const b = [
    -5.447609879822406e+01, 1.615858368580409e+02,
    -1.556989798598866e+02, 6.680131188771972e+01,
    -1.328068155288572e+01
  ];

  const c = [
    -7.784894002430432e-03, -3.223964580411365e-01,
    -2.400758277161838e+00, -2.549732539343734e+00,
    4.374664141464968e+00, 2.938163982698783e+00
  ];

  const d = [
    7.784695709041462e-03, 3.224671290700398e-01,
    2.445134137142996e+00, 3.754408661907416e+00
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number;
  let r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
}

/**
 * Student's t-distribution CDF approximation
 */
export function tCDF(t: number, df: number): number {
  // For large df, use normal approximation
  if (df > 100) {
    return normalCDF(t);
  }

  const x = df / (df + t * t);
  const prob = 0.5 * betaIncomplete(df / 2, 0.5, x);

  return t >= 0 ? 1 - prob : prob;
}

/**
 * Incomplete beta function (for t-distribution)
 */
function betaIncomplete(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  // Use continued fraction approximation
  const lbeta = logGamma(a) + logGamma(b) - logGamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta) / a;

  const f = continuedFraction(a, b, x);
  return front * f;
}

function continuedFraction(a: number, b: number, x: number): number {
  const maxIter = 100;
  const eps = 3e-7;

  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - qab * x / qap;

  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= maxIter; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;

    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;

    if (Math.abs(del - 1) < eps) break;
  }

  return h;
}

/**
 * Log gamma function
 */
function logGamma(x: number): number {
  const cof = [
    76.18009172947146, -86.50532032941677,
    24.01409824083091, -1.231739572450155,
    0.1208650973866179e-2, -0.5395239384953e-5
  ];

  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;

  for (let j = 0; j < 6; j++) {
    ser += cof[j] / ++y;
  }

  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/**
 * t-distribution quantile (inverse CDF)
 */
export function tQuantile(p: number, df: number): number {
  // For large df, use normal approximation
  if (df > 100) {
    return normalQuantile(p);
  }

  // Newton-Raphson method
  let t = normalQuantile(p);
  for (let i = 0; i < 5; i++) {
    const delta = tCDF(t, df) - p;
    if (Math.abs(delta) < 1e-8) break;
    t -= delta / tPDF(t, df);
  }

  return t;
}

/**
 * t-distribution PDF
 */
export function tPDF(t: number, df: number): number {
  const num = Math.exp(logGamma((df + 1) / 2) - logGamma(df / 2));
  const denom = Math.sqrt(df * Math.PI) * Math.pow(1 + (t * t) / df, (df + 1) / 2);
  return num / denom;
}

/**
 * Calculate critical value(s) based on alpha and sidedness
 */
export function getCriticalValues(
  alpha: number,
  sidedness: ExperimentState['sidedness'],
  testType: ExperimentState['testType'],
  df?: number
): number[] {
  const quantile = testType === 'z-test' ? normalQuantile : (p: number) => tQuantile(p, df || 1);

  switch (sidedness) {
    case 'one-sided-right':
      return [quantile(1 - alpha)];
    case 'one-sided-left':
      return [quantile(alpha)];
    case 'two-sided':
      return [quantile(alpha / 2), quantile(1 - alpha / 2)];
  }
}

/**
 * Calculate standard error
 */
export function getStandardError(sigma: number, n: number): number {
  return sigma / Math.sqrt(n);
}

/**
 * Calculate Type II error rate (beta) and power
 */
export function calculateBetaAndPower(state: ExperimentState): { beta: number; power: number } {
  const { alpha, n, delta, sigma, sidedness, testType } = state;

  const df = testType === 't-test' ? n - 1 : undefined;
  const se = getStandardError(sigma, n);

  // Calculate non-centrality parameter
  // For one-sided-left, delta represents magnitude but effect is in negative direction
  const effectDirection = sidedness === 'one-sided-left' ? -1 : 1;
  const ncp = (effectDirection * delta) / se;

  const criticalValues = getCriticalValues(alpha, sidedness, testType, df);
  const cdf = testType === 'z-test' ? normalCDF : (x: number) => tCDF(x, df!);

  let beta: number;

  switch (sidedness) {
    case 'one-sided-right': {
      // H1: μ > μ0, so under H1, the distribution is shifted right by ncp (positive)
      const criticalUnderH1 = criticalValues[0] - ncp;
      beta = cdf(criticalUnderH1);
      break;
    }
    case 'one-sided-left': {
      // H1: μ < μ0, so under H1, the distribution is shifted left by ncp (negative)
      const criticalUnderH1 = criticalValues[0] - ncp;
      beta = 1 - cdf(criticalUnderH1);
      break;
    }
    case 'two-sided': {
      // For two-sided, calculate probability of being in non-rejection region under H1
      const lowerCriticalUnderH1 = criticalValues[0] - ncp;
      const upperCriticalUnderH1 = criticalValues[1] - ncp;
      beta = cdf(upperCriticalUnderH1) - cdf(lowerCriticalUnderH1);
      break;
    }
  }

  const power = 1 - beta;

  return { beta: Math.max(0, Math.min(1, beta)), power: Math.max(0, Math.min(1, power)) };
}

/**
 * Calculate all derived values from experiment state
 */
export function calculateDerivedValues(state: ExperimentState): DerivedValues {
  const { alpha, n, testType, sidedness } = state;

  const df = testType === 't-test' ? n - 1 : undefined;
  const criticalValues = getCriticalValues(alpha, sidedness, testType, df);

  const { beta, power } = calculateBetaAndPower(state);

  const rejectionRegion = {
    lower: sidedness === 'one-sided-left' || sidedness === 'two-sided' ? criticalValues[0] : null,
    upper: sidedness === 'one-sided-right' || sidedness === 'two-sided'
      ? criticalValues[sidedness === 'two-sided' ? 1 : 0]
      : null,
  };

  const se = getStandardError(state.sigma, state.n);
  // For one-sided-left, delta represents magnitude but effect is in negative direction
  const effectDirection = sidedness === 'one-sided-left' ? -1 : 1;
  const ncp = (effectDirection * state.delta) / se;

  return {
    criticalValues,
    rejectionRegion,
    beta,
    power,
    df,
    ncp,
  };
}

/**
 * Calculate 2x2 table counts
 */
export function calculate2x2Data(
  state: ExperimentState,
  derived: DerivedValues
): TwoByTwoData {
  const { prevalence, N } = state;
  const { beta, power } = derived;
  const { alpha } = state;

  // Number of cases where H0 is true
  const h0True = Math.round(N * (1 - prevalence));

  // Number of cases where H1 is true
  const h1True = Math.round(N * prevalence);

  return {
    // True H0, Fail to reject (Correct)
    trueNegative: Math.round(h0True * (1 - alpha)),

    // True H0, Reject (Type I error)
    falsePositive: Math.round(h0True * alpha),

    // True H1, Fail to reject (Type II error)
    falseNegative: Math.round(h1True * beta),

    // True H1, Reject (Power/Correct)
    truePositive: Math.round(h1True * power),
  };
}

/**
 * Seeded random number generator (LCG)
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // Box-Muller transform for normal distribution
  nextGaussian(mean: number = 0, stdDev: number = 1): number {
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }
}

/**
 * Generate sample data and compute test statistic and p-value
 */
export function generateSample(state: ExperimentState, underH1: boolean = false): SampleData {
  const { n, sigma, delta, testType, sidedness, seed } = state;

  const rng = new SeededRandom(seed);
  // For one-sided-left, delta represents magnitude but effect is in negative direction
  const effectDirection = sidedness === 'one-sided-left' ? -1 : 1;
  const trueMean = underH1 ? (effectDirection * delta) : 0;

  // Generate sample
  const values = Array.from({ length: n }, () => rng.nextGaussian(trueMean, sigma));

  // Calculate sample statistics
  const mean = values.reduce((sum, val) => sum + val, 0) / n;
  const variance = values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / (n - 1);
  const sd = Math.sqrt(variance);

  // Calculate test statistic
  const se = testType === 'z-test' ? sigma / Math.sqrt(n) : sd / Math.sqrt(n);
  const testStatistic = mean / se;

  // Calculate p-value
  const df = testType === 't-test' ? n - 1 : undefined;
  const cdf = testType === 'z-test' ? normalCDF : (x: number) => tCDF(x, df!);

  let pValue: number;
  switch (sidedness) {
    case 'one-sided-right':
      pValue = 1 - cdf(testStatistic);
      break;
    case 'one-sided-left':
      pValue = cdf(testStatistic);
      break;
    case 'two-sided':
      pValue = 2 * (1 - cdf(Math.abs(testStatistic)));
      break;
  }

  // Determine decision
  const decision = pValue < state.alpha ? 'reject' : 'fail-to-reject';

  return {
    values,
    mean,
    sd,
    testStatistic,
    pValue,
    decision,
  };
}

/**
 * Generate power curve data
 */
export function generatePowerCurve(
  state: ExperimentState,
  variable: 'n' | 'delta',
  min: number,
  max: number,
  steps: number = 50
): Array<{ x: number; power: number; beta: number }> {
  const points: Array<{ x: number; power: number; beta: number }> = [];

  for (let i = 0; i <= steps; i++) {
    const x = min + (max - min) * (i / steps);

    const tempState = {
      ...state,
      [variable]: x,
    };

    const { beta, power } = calculateBetaAndPower(tempState);
    points.push({ x, power, beta });
  }

  return points;
}
