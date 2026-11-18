export interface LessonMeta {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  /** what the learner can do after the lesson */
  outcomes: string[];
}

export const LESSONS: LessonMeta[] = [
  {
    id: 'decisions',
    title: 'Two truths, two decisions',
    summary: 'The 2×2 table: Type I and Type II errors as long-run rates.',
    minutes: 8,
    outcomes: ['Fill in the 2×2 table from memory', 'State what α and β are conditional on', 'Explain why α is not the chance a rejection is wrong'],
  },
  {
    id: 'noise',
    title: 'Signal, noise and the standard error',
    summary: 'Why averages vary less than observations, and when to use t instead of z.',
    minutes: 9,
    outcomes: ['Compute an SE for one or two groups', 'Read a test statistic as signal ÷ noise', 'Choose between z and t correctly'],
  },
  {
    id: 'alpha',
    title: 'α and the rejection region',
    summary: 'Choosing α before the data, one- vs two-sided tests, and why thresholds differ by field.',
    minutes: 8,
    outcomes: ['Find critical values for any α and sidedness', 'Explain what α guarantees', 'Justify an α for a given context'],
  },
  {
    id: 'power',
    title: 'Power and β',
    summary: 'The alternative distribution and the four levers that move power.',
    minutes: 10,
    outcomes: ['Predict how n, δ, σ and α change power', 'Estimate power from λ', 'Explain why power belongs to a design, not a result'],
  },
  {
    id: 'pvalues',
    title: 'What a p-value is — and isn’t',
    summary: 'Definition, behaviour under H₀ and H₁, the dance of the p-values, S-values.',
    minutes: 12,
    outcomes: ['State the definition precisely', 'Describe the p-value distribution under H₀ and H₁', 'Reject the five most common misreadings'],
  },
  {
    id: 'fpr',
    title: 'Significant is not the same as true',
    summary: 'How prior plausibility, power and α set the false positive risk.',
    minutes: 9,
    outcomes: ['Compute the false positive risk with natural frequencies', 'Explain why low power hurts even significant results', 'Connect this to diagnostic testing'],
  },
  {
    id: 'exaggeration',
    title: 'Underpowered studies exaggerate',
    summary: 'Type M (magnitude) and Type S (sign) errors and the winner’s curse.',
    minutes: 8,
    outcomes: ['Explain why significant estimates are inflated when power is low', 'Read an exaggeration ratio', 'Anticipate shrinking effects in replications'],
  },
  {
    id: 'multiplicity',
    title: 'Peeking and multiple tests',
    summary: 'Optional stopping, family-wise error, Bonferroni, Holm and Benjamini–Hochberg.',
    minutes: 11,
    outcomes: ['Explain why peeking inflates α', 'Compute the family-wise error rate', 'Choose between FWER and FDR control'],
  },
  {
    id: 'design',
    title: 'Design and report a study',
    summary: 'Sample size from a meaningful effect, equivalence tests, and what to report.',
    minutes: 12,
    outcomes: ['Justify a sample size', 'Use TOST to support “no meaningful effect”', 'Avoid the observed-power fallacy'],
  },
];

export const LESSON_BY_ID: Record<string, LessonMeta> = Object.fromEntries(LESSONS.map((l) => [l.id, l]));
