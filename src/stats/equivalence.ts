/**
 * Equivalence testing with two one-sided tests (TOST; Schuirmann 1987; Lakens 2017).
 * Equivalence is declared when the (1 − 2α) confidence interval lies entirely
 * inside the pre-specified margins (lower, upper).
 */

import { confidenceInterval } from './design';
import { normCdf, normSf, tCdf, tSf } from './distributions';

export interface TostResult {
  /** p for H₀: δ ≤ lower */
  pLower: number;
  /** p for H₀: δ ≥ upper */
  pUpper: number;
  /** TOST p-value = max of the two one-sided p-values */
  p: number;
  equivalent: boolean;
  /** (1 − 2α) CI used for the equivalence decision */
  ciEquivalence: [number, number];
  /** conventional two-sided test of δ = 0 */
  pDifference: number;
  ciDifference: [number, number];
  different: boolean;
}

export function tost(estimate: number, se: number, df: number, lower: number, upper: number, alpha = 0.05): TostResult {
  const sf = (x: number) => (Number.isFinite(df) ? tSf(x, df) : normSf(x));
  const cdf = (x: number) => (Number.isFinite(df) ? tCdf(x, df) : normCdf(x));
  const pLower = sf((estimate - lower) / se);
  const pUpper = cdf((estimate - upper) / se);
  const p = Math.max(pLower, pUpper);
  const pDifference = Math.min(1, 2 * sf(Math.abs(estimate) / se));
  return {
    pLower,
    pUpper,
    p,
    equivalent: p <= alpha,
    ciEquivalence: confidenceInterval(estimate, se, df, 1 - 2 * alpha),
    pDifference,
    ciDifference: confidenceInterval(estimate, se, df, 1 - alpha),
    different: pDifference <= alpha,
  };
}
