import type { Design } from '../stats/design';
import type { ErrorStory } from '../components/widgets/DecisionTable';
import type { Question } from './types';

export interface CaseStudy {
  id: string;
  title: string;
  field: string;
  summary: string;
  /** design loaded into the Decision Lab */
  design: Design;
  units: string;
  /** slider scale for δ and σ */
  scale: number;
  nMax: number;
  /** prior used for the 2×2 table */
  prior: number;
  story: ErrorStory;
  /** why each design choice was made */
  rationale: { point: string; refs?: string[] }[];
  /** things to try in the Lab */
  explore: string[];
  questions: Question[];
}

export const CASES: CaseStudy[] = [
  {
    id: 'bp-trial',
    title: 'A blood-pressure drug trial',
    field: 'Clinical trials',
    summary: 'Two-arm randomised trial of a new antihypertensive against placebo. Primary outcome: change in systolic blood pressure (SBP) at 12 weeks.',
    design: { design: 'two-sample', test: 't', alternative: 'two-sided', alpha: 0.05, n: 191, delta: -5, sigma: 15 },
    units: 'mmHg',
    scale: 10,
    nMax: 2000,
    prior: 0.5,
    story: {
      h0: 'drug lowers SBP no more than placebo',
      h1: 'drug lowers SBP by 5 mmHg more',
      type1: 'An ineffective drug is approved: cost and side effects without benefit.',
      type2: 'A useful drug is abandoned: the cardiovascular events it would have prevented are forgone.',
    },
    rationale: [
      { point: 'Target effect δ = −5 mmHg: clinically meaningful, since each 5 mmHg lower SBP reduces major cardiovascular events by about 10%.', refs: ['bpltt2021'] },
      { point: 'σ = 15 mmHg is a planning assumption for the SD of the change; take it from earlier trials in the same population.' },
      { point: 'Two-sided α = 0.05 (equivalently one-sided 0.025): the regulatory convention, and a drug could raise blood pressure.', refs: ['ich1998'] },
      { point: '191 per group gives 90% power (143 for 80%) with an exact t test; enrol more to allow for dropout.' },
    ],
    explore: ['Set n to 100 per group: power falls to about 65%.', 'Change σ from 15 to 10 mmHg (e.g. by averaging repeated readings): how many patients does that save?', 'Set δ to 0 to see the trial when the drug does nothing.'],
    questions: [
      {
        id: 'case-bp-1',
        kind: 'choice',
        prompt: 'Why is the trial tested two-sided even though the hope is that SBP falls?',
        options: [
          { text: 'A rise in SBP would also matter, and regulators expect two-sided 0.05 or one-sided 0.025.', correct: true, why: 'Both reasons hold; with one-sided 0.025 the critical value is the same as two-sided 0.05.' },
          { text: 'Two-sided tests are more powerful.', why: 'At the same α a one-sided test is more powerful in its direction.' },
          { text: 'One-sided tests are invalid.', why: 'They are valid when pre-specified; regulators then halve α.' },
          { text: 'Because the effect is negative.', why: 'The sign of δ does not determine sidedness.' },
        ],
        explanation: 'Sidedness follows from which results would change the decision, and from regulatory practice.',
        refs: ['ich1998'],
      },
      {
        id: 'case-bp-2',
        kind: 'choice',
        prompt: 'The final analysis gives a difference of −3.1 mmHg, 95% CI −6.0 to −0.2, p = 0.04. Best summary?',
        options: [
          { text: 'SBP fell more on the drug; the data are compatible with reductions from about 0.2 to 6 mmHg, so benefits smaller than 5 mmHg cannot be excluded.', correct: true, why: 'Report the estimate and the interval, and relate them to the clinically relevant effect.' },
          { text: 'The drug lowers SBP by 5 mmHg.', why: '5 mmHg was the planning target, not the result.' },
          { text: 'There is a 96% chance the drug works.', why: 'That inverts the p-value.' },
          { text: 'The effect is too small to matter, so the drug failed.', why: 'The interval includes clinically meaningful reductions.' },
        ],
        explanation: 'Significance says the data are incompatible with no difference; the interval says how large the difference plausibly is.',
        refs: ['greenland2016'],
      },
    ],
  },
  {
    id: 'ab-test',
    title: 'An A/B test on a checkout page',
    field: 'Online experiments',
    summary: 'Users are randomised to the current or a redesigned checkout. Outcome: conversion (purchase yes/no). Baseline conversion is 10%.',
    design: { design: 'two-sample', test: 'z', alternative: 'two-sided', alpha: 0.05, n: 14128, delta: 0.01, sigma: 0.3 },
    units: '',
    scale: 0.05,
    nMax: 100000,
    prior: 0.2,
    story: {
      h0: 'redesign does not change conversion',
      h1: 'redesign lifts conversion from 10% to 11%',
      type1: 'Ship a change that does nothing: engineering cost, and a false belief about what works.',
      type2: 'Discard a redesign worth a 10% relative lift in revenue.',
    },
    rationale: [
      { point: 'Minimum detectable effect: +1 percentage point (10% → 11%), the smallest lift worth the redesign.', refs: ['kohavi2020'] },
      { point: 'For a 0/1 outcome σ = √(p(1−p)) = √(0.1 × 0.9) = 0.3; with n this large the z test (normal approximation) is appropriate.' },
      { point: 'About 14,100 users per arm give 80% power; the exact two-proportion calculation is slightly higher (~14,700) because the variance rises with p.' },
      { point: 'Decide n and the stopping rule in advance: dashboards invite peeking, which inflates false positives.', refs: ['johari2017'] },
    ],
    explore: ['Set n to 5,000 per arm (a typical “run it for a week”): power is about 38%.', 'Try detecting a 0.5-point lift instead: δ = 0.005.', 'Open the Peeking simulation to see what daily checks do to α.'],
    questions: [
      {
        id: 'case-ab-1',
        kind: 'choice',
        prompt: 'The product team checks the dashboard daily and wants to ship as soon as p < 0.05. What should you recommend?',
        options: [
          { text: 'Fix the sample size and analyse once, or use a sequential method built for continuous monitoring.', correct: true, why: 'Both keep the false positive rate at the stated level.' },
          { text: 'Fine, as long as p < 0.05 holds for two days in a row.', why: 'Ad-hoc rules still inflate α unpredictably.' },
          { text: 'Use α = 0.10 so results come faster.', why: 'That raises false positives further.' },
          { text: 'Stop as soon as the lift looks big.', why: 'Stopping on large estimates also exaggerates the reported lift.' },
        ],
        explanation: 'Optional stopping is the most common way online experiments go wrong.',
        refs: ['johari2017', 'kohavi2020'],
      },
      {
        id: 'case-ab-2',
        kind: 'choice',
        prompt: 'The test tracks 15 metrics and reports the one with p = 0.03. What is the issue?',
        options: [
          { text: 'With 15 metrics the chance of at least one p < 0.05 under no effect is about 54%; a primary metric should be pre-specified.', correct: true, why: '1 − 0.95¹⁵ ≈ 0.54.' },
          { text: 'None, p = 0.03 is below 0.05.', why: 'The threshold applies to a single pre-planned test.' },
          { text: 'Metrics are correlated, so there is no multiplicity.', why: 'Correlation reduces but does not remove the inflation.' },
          { text: 'They should report the median p-value.', why: 'That is not a valid inference procedure.' },
        ],
        explanation: 'Pre-specify one primary metric (or correct for multiplicity) and treat the rest as guardrails or exploration.',
      },
    ],
  },
  {
    id: 'qc-line',
    title: 'Monitoring a bottling line',
    field: 'Quality control',
    summary: 'Every hour, 5 bottles are sampled and their mean fill volume compared with the 500 mL target. The process SD is known from years of data: σ = 2 mL.',
    design: { design: 'one-sample', test: 'z', alternative: 'two-sided', alpha: 0.0027, n: 5, delta: 2, sigma: 2 },
    units: 'mL',
    scale: 2,
    nMax: 100,
    prior: 0.05,
    story: {
      h0: 'process on target (500 mL)',
      h1: 'process mean shifted by 2 mL (1σ)',
      type1: 'Stop the line for a shift that did not happen.',
      type2: 'Keep filling off-target bottles.',
    },
    rationale: [
      { point: 'σ is genuinely known from long process history, so a z test is correct here — the rare case where it is.' },
      { point: '±3σ control limits correspond to α ≈ 0.0027 per sample: one false alarm per ~370 samples on average.', refs: ['montgomery2019'] },
      { point: 'With n = 5, a 1σ shift is caught by any single sample with only 22% probability; on average it takes about 4.5 samples (hours) to signal.' },
      { point: 'A tiny α is chosen because the test is repeated every hour: α sets how often the line is stopped needlessly.' },
    ],
    explore: ['Increase n to 10: per-sample power rises to about 56%.', 'Loosen α to 0.01 and compare the false alarm cost (1/α samples between false alarms).', 'Try a 2σ shift: δ = 4 mL.'],
    questions: [
      {
        id: 'case-qc-1',
        kind: 'numeric',
        prompt: 'With per-sample power of 22%, about how many samples does it take on average to detect the shift (average run length = 1/power)?',
        answer: 4.5,
        tolerance: 0.2,
        unit: 'samples',
        explanation: 'ARL₁ = 1/0.222 ≈ 4.5 samples. A control chart trades detection delay against false alarms (ARL₀ ≈ 370).',
        refs: ['montgomery2019'],
      },
    ],
  },
  {
    id: 'bioequivalence',
    title: 'Is the generic equivalent?',
    field: 'Regulatory science',
    summary: 'A crossover study gives each volunteer both the generic (test) and the brand (reference) drug. Outcome: log of the area under the concentration curve (AUC).',
    design: { design: 'one-sample', test: 't', alternative: 'two-sided', alpha: 0.05, n: 24, delta: 0.05, sigma: 0.25 },
    units: 'log ratio',
    scale: 0.2,
    nMax: 200,
    prior: 0.5,
    story: {
      h0: 'no difference in mean log AUC',
      h1: 'mean log AUC differs',
      type1: 'Declare a difference that is not there.',
      type2: 'Miss a real difference in exposure.',
    },
    rationale: [
      { point: 'The question is not “is there a difference?” but “is any difference small enough to ignore?” A non-significant difference test cannot answer it.', refs: ['schuirmann1987'] },
      { point: 'Regulators require the 90% CI of the geometric mean ratio to lie within 80–125% — on the log scale, ±0.223. This is TOST at α = 0.05.', refs: ['fda2001'] },
      { point: 'With 24 subjects, a ratio of 105% and a within-subject SD of 0.25, the 90% CI is about 96–115%: equivalent.' },
      { point: 'With 8 subjects and a ratio of 108%, the difference test is non-significant (p ≈ 0.40) but the 90% CI reaches ~128%: equivalence is not shown. “No significant difference” would have been the wrong conclusion.' },
    ],
    explore: ['In the equivalence explorer, set n = 8 and the log ratio to 0.08.', 'Find the smallest n that shows equivalence for a true ratio of 105%.'],
    questions: [
      {
        id: 'case-be-1',
        kind: 'choice',
        prompt: 'A small study finds no significant difference between generic and brand (p = 0.40). Can the generic be called equivalent?',
        options: [
          { text: 'No: equivalence requires the 90% CI of the ratio within 80–125%, which a small noisy study may not achieve.', correct: true, why: 'That is the regulatory TOST criterion.' },
          { text: 'Yes: no significant difference means equivalence.', why: 'This is the fallacy TOST was designed to avoid.' },
          { text: 'Yes, if observed power was above 80%.', why: 'Observed power cannot support equivalence.' },
          { text: 'Only if p > 0.5.', why: 'No p-value from a difference test establishes equivalence.' },
        ],
        explanation: 'Absence of evidence (of a difference) is not evidence of absence.',
        refs: ['schuirmann1987', 'fda2001', 'lakens2017'],
      },
    ],
  },
];

export const CASE_BY_ID: Record<string, CaseStudy> = Object.fromEntries(CASES.map((c) => [c.id, c]));
