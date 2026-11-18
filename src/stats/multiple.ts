/**
 * Multiple-testing corrections.
 * Bonferroni and Holm (1979) control the family-wise error rate (FWER);
 * Benjamini–Hochberg (1995) controls the false discovery rate (FDR).
 */

/** P(at least one false positive) among m independent true nulls each tested at α. */
export function familyWiseErrorRate(m: number, alpha: number): number {
  return 1 - Math.pow(1 - alpha, m);
}

export function bonferroni(pValues: number[], alpha: number): boolean[] {
  const m = pValues.length;
  return pValues.map((p) => p <= alpha / m);
}

/** Holm step-down: uniformly at least as powerful as Bonferroni, same FWER guarantee. */
export function holm(pValues: number[], alpha: number): boolean[] {
  const m = pValues.length;
  const order = pValues.map((p, i) => ({ p, i })).sort((a, b) => a.p - b.p);
  const reject = new Array<boolean>(m).fill(false);
  for (let k = 0; k < m; k++) {
    if (order[k].p <= alpha / (m - k)) reject[order[k].i] = true;
    else break;
  }
  return reject;
}

/** Benjamini–Hochberg step-up at FDR level q (independent or positively dependent tests). */
export function benjaminiHochberg(pValues: number[], q: number): boolean[] {
  const m = pValues.length;
  const order = pValues.map((p, i) => ({ p, i })).sort((a, b) => a.p - b.p);
  let kMax = -1;
  for (let k = 0; k < m; k++) {
    if (order[k].p <= ((k + 1) / m) * q) kMax = k;
  }
  const reject = new Array<boolean>(m).fill(false);
  for (let k = 0; k <= kMax; k++) reject[order[k].i] = true;
  return reject;
}
