/**
 * Reference values were computed with SciPy 1.18 (scipy.stats.norm, t, nct)
 * and cross-checked against R's pwr package / G*Power where noted.
 */
import { describe, expect, it } from 'vitest';
import {
  approximateN,
  bayesFactorBound,
  benjaminiHochberg,
  bonferroni,
  criticalValues,
  falsePositiveRisk,
  familyWiseErrorRate,
  holm,
  minimumDetectableEffect,
  nctCdf,
  nctPdf,
  nctSf,
  normCdf,
  normQuantile,
  normSf,
  observedPowerFromP,
  pValue,
  rejectionProbability,
  requiredN,
  signAndMagnitude,
  simulatePeeking,
  simulateStudies,
  sValue,
  tCdf,
  tost,
  tQuantile,
  type Design,
} from './index';

const rel = (a: number, b: number) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-300);

describe('normal distribution', () => {
  it('matches SciPy in the centre and far tails', () => {
    expect(rel(normCdf(-1.96), 0.024997895148220435)).toBeLessThan(1e-13);
    expect(rel(normSf(5), 2.866515718791933e-7)).toBeLessThan(1e-12);
    expect(rel(normSf(9), 1.1285884059538324e-19)).toBeLessThan(1e-12);
    expect(rel(normCdf(-20), 2.7536241186061556e-89)).toBeLessThan(1e-12);
    expect(normCdf(0)).toBe(0.5);
  });
  it('inverts accurately', () => {
    expect(rel(normQuantile(0.975), 1.959963984540054)).toBeLessThan(1e-14);
    expect(rel(normQuantile(1e-12), -7.034483825301131)).toBeLessThan(1e-12);
    for (const p of [1e-8, 0.001, 0.2, 0.5 - 1e-9, 0.7, 0.999]) {
      expect(Math.abs(normCdf(normQuantile(p)) - p) / p).toBeLessThan(1e-12);
    }
  });
});

describe('Student t distribution', () => {
  it('CDF matches SciPy without a large-df normal shortcut', () => {
    expect(rel(tCdf(2, 9), 0.9617235881146495)).toBeLessThan(1e-12);
    expect(rel(tCdf(1, 200), 0.8407405760451266)).toBeLessThan(1e-12);
    expect(rel(tCdf(-2.5, 30), 0.009057824534033344)).toBeLessThan(1e-12);
  });
  it('critical values are continuous in df (old code jumped to 1.96 at df > 100)', () => {
    const expected: [number, number][] = [
      [4, 2.7764451051977934],
      [9, 2.262157162798205],
      [29, 2.045229642132703],
      [99, 1.9842169515864174],
      [101, 1.983731002955606],
      [1000, 1.9623390808264083],
    ];
    for (const [df, c] of expected) expect(rel(tQuantile(0.975, df), c)).toBeLessThan(1e-11);
    expect(rel(tQuantile(0.00005, 1), -6366.197671315936)).toBeLessThan(1e-9);
  });
});

describe('noncentral t distribution', () => {
  it('matches scipy.stats.nct', () => {
    expect(rel(nctCdf(2, 9, 1.5), 0.6558759139985497)).toBeLessThan(1e-8);
    expect(rel(nctSf(2.262, 9, 0.5), 0.06544727764318853)).toBeLessThan(1e-8);
    expect(rel(nctPdf(1, 9, 1.5), 0.3398602823290154)).toBeLessThan(1e-8);
  });
});

const base: Design = { design: 'two-sample', test: 't', alternative: 'two-sided', alpha: 0.05, n: 64, delta: 0.5, sigma: 1 };

describe('power (exact noncentral t)', () => {
  const cases: [Partial<Design>, number][] = [
    [{}, 0.801459557922254], // pwr.t.test(n = 64, d = .5): 0.8015
    [{ n: 10 }, 0.18509565629116606],
    [{ design: 'one-sample', n: 10 }, 0.2931756065140766], // old code: 0.258
    [{ design: 'one-sample', alternative: 'greater', alpha: 0.025, n: 20, delta: 0.3 }, 0.24648576760631002],
    [{ test: 'z', n: 50, delta: 0.3 }, 0.3230411597768047],
    [{ alternative: 'less', n: 30, delta: -4, sigma: 10 }, 0.45471469548979726],
    [{ design: 'one-sample', alternative: 'greater', n: 15, delta: -0.3 }, 0.002950631844031478],
    [{ alpha: 0.005, n: 200, delta: 0.25 }, 0.37471162077813164],
    [{ design: 'one-sample', test: 'z', alpha: 0.0027, n: 5, delta: 2, sigma: 2 }, 0.22246081435606288],
    [{ n: 14128, delta: 0.01, sigma: 0.3 }, 0.7999747570888859],
    [{ n: 3, delta: 1.5 }, 0.2931947003055978],
  ];
  it.each(cases)('%o', (over, expected) => {
    expect(rel(rejectionProbability({ ...base, ...over }), expected)).toBeLessThan(1e-7);
  });
  it('equals α when the null is true, for every test', () => {
    for (const alternative of ['two-sided', 'greater', 'less'] as const) {
      for (const test of ['z', 't'] as const) {
        expect(rejectionProbability({ ...base, alternative, test, delta: 0, n: 7, alpha: 0.01 })).toBeCloseTo(0.01, 12);
      }
    }
  });
});

describe('sample size and detectable effect', () => {
  it('reproduces standard tables', () => {
    expect(requiredN({ ...base }, 0.8)).toBe(64);
    expect(requiredN({ ...base, delta: 0.2 }, 0.8)).toBe(394);
    expect(requiredN({ ...base, delta: 0.8 }, 0.8)).toBe(26);
    expect(requiredN({ ...base, design: 'one-sample' }, 0.8)).toBe(34);
    expect(requiredN({ ...base, delta: 5, sigma: 15 }, 0.9)).toBe(191);
    expect(requiredN({ ...base, delta: 0.4 }, 0.9)).toBe(133);
  });
  it('normal approximation is close but slightly optimistic', () => {
    expect(approximateN(base, 0.8)).toBeCloseTo(62.79, 1);
  });
  it('MDE inverts power', () => {
    const mde = minimumDetectableEffect(base, 0.8);
    expect(rejectionProbability({ ...base, delta: mde })).toBeCloseTo(0.8, 8);
    expect(minimumDetectableEffect({ ...base, alternative: 'less' }, 0.8)).toBeLessThan(0);
  });
});

describe('critical values and p-values', () => {
  it('two-sided z at .05 is ±1.96', () => {
    const c = criticalValues({ ...base, test: 'z' });
    expect(c.upper).toBeCloseTo(1.959964, 6);
    expect(c.lower).toBeCloseTo(-1.959964, 6);
  });
  it('p at the critical value equals α', () => {
    const d = { ...base, n: 12 };
    const c = criticalValues(d).upper!;
    expect(pValue(c, d)).toBeCloseTo(0.05, 12);
    expect(pValue(-c, { ...d, alternative: 'less' })).toBeCloseTo(0.025, 12);
  });
});

describe('beyond the p-value', () => {
  it('Type S / M match Gelman & Carlin (2014): D = 2, SE = 8.1', () => {
    // With n = 2 the per-group SE is sigma; choose sigma so SE = 8.1 for a z test.
    const d: Design = { ...base, test: 'z', n: 2, sigma: 8.1, delta: 2 };
    const sm = signAndMagnitude(d)!;
    expect(sm.power).toBeCloseTo(0.0570, 3);
    expect(sm.typeS).toBeCloseTo(0.2396, 3);
    expect(sm.exaggeration).toBeCloseTo(9.537, 2); // simulation: 9.535
  });
  it('false positive risk: 10% prior, 80% power, α = .05 → 36% (Colquhoun 2014)', () => {
    expect(falsePositiveRisk(0.05, 0.8, 0.1).fpr).toBeCloseTo(0.36, 10);
  });
  it('Bayes factor bound (Sellke et al. 2001)', () => {
    expect(bayesFactorBound(0.05)).toBeCloseTo(2.456, 3);
    expect(bayesFactorBound(0.005)).toBeCloseTo(13.887, 3);
    expect(bayesFactorBound(0.5)).toBe(1);
  });
  it('S-value', () => {
    expect(sValue(0.05)).toBeCloseTo(4.32, 2);
    expect(sValue(0.5 ** 4)).toBeCloseTo(4, 12);
  });
  it('observed power at p = .05 is ~50% (Hoenig & Heisey 2001)', () => {
    expect(observedPowerFromP(0.05)).toBeCloseTo(0.50004, 5);
  });
});

describe('multiple testing', () => {
  it('FWER', () => {
    expect(familyWiseErrorRate(20, 0.05)).toBeCloseTo(0.6415, 4);
    expect(familyWiseErrorRate(10, 0.05)).toBeCloseTo(0.4013, 4);
  });
  it('Bonferroni ⊆ Holm ⊆ BH on a worked example', () => {
    const p = [0.0001, 0.004, 0.019, 0.03, 0.041, 0.2, 0.6];
    const count = (r: boolean[]) => r.filter(Boolean).length;
    expect(count(bonferroni(p, 0.05))).toBe(2);
    expect(count(holm(p, 0.05))).toBe(2);
    expect(count(benjaminiHochberg(p, 0.05))).toBe(3);
  });
});

describe('equivalence (TOST)', () => {
  it('matches SciPy for a bioequivalence-style example', () => {
    const r = tost(0.05, 0.06, 22, -0.223, 0.223, 0.05);
    expect(rel(r.pLower, 7.871531685990102e-5)).toBeLessThan(1e-9);
    expect(rel(r.pUpper, 0.004314489771665351)).toBeLessThan(1e-9);
    expect(r.equivalent).toBe(true);
    expect(r.different).toBe(false);
    expect(r.ciEquivalence[0]).toBeCloseTo(-0.053029, 5);
    expect(r.ciEquivalence[1]).toBeCloseTo(0.153029, 5);
  });
});

describe('simulation agrees with theory', () => {
  const N = 40000;
  const tol = (p: number) => 4 * Math.sqrt((p * (1 - p)) / N);
  it('rejection rate under H₀ ≈ α (t test, small n)', () => {
    const d: Design = { ...base, n: 6, delta: 0 };
    expect(Math.abs(simulateStudies(d, N, 1).rejectRate - 0.05)).toBeLessThan(tol(0.05));
  });
  it('rejection rate under H₁ ≈ exact power', () => {
    const d: Design = { ...base, n: 20 };
    const power = rejectionProbability(d);
    expect(Math.abs(simulateStudies(d, N, 2).rejectRate - power)).toBeLessThan(tol(power));
  });
  it('p-values are uniform under H₀', () => {
    const sims = simulateStudies({ ...base, n: 8, delta: 0, design: 'one-sample' }, N, 3);
    const below = (x: number) => sims.p.filter((p) => p <= x).length / N;
    for (const x of [0.01, 0.2, 0.5, 0.8]) expect(Math.abs(below(x) - x)).toBeLessThan(tol(x));
  });
  it('peeking inflates the Type I error rate; a single final look does not', () => {
    const d: Design = { ...base, n: 100, delta: 0, test: 'z' };
    const r = simulatePeeking(d, 20, 8000, 4);
    expect(r.looks).toEqual([20, 40, 60, 80, 100]);
    expect(Math.abs(r.finalOnly - 0.05)).toBeLessThan(0.012);
    // Armitage et al. (1969): five equally spaced looks give ≈ 0.142.
    expect(r.anyLook).toBeGreaterThan(0.12);
    expect(r.anyLook).toBeLessThan(0.165);
  });
});
