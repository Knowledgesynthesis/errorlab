export interface Misconception {
  claim: string;
  reality: string;
  /** where to see it for yourself */
  tryIt?: { label: string; to: string };
  refs: string[];
}

export const MISCONCEPTIONS: Misconception[] = [
  {
    claim: 'p = 0.03 means there is a 3% chance that H₀ is true.',
    reality: 'p is computed assuming H₀ is true, so it cannot be the probability that H₀ is true. P(H₀ | data) also depends on the prior plausibility of H₀.',
    tryIt: { label: 'Lesson 5: p-values', to: '/learn/pvalues' },
    refs: ['asa2016', 'greenland2016', 'goodman2008'],
  },
  {
    claim: 'p is the probability that the result is due to chance.',
    reality: 'The same reversal in different words. p is the probability of data at least this extreme if chance (the null model) were the only explanation.',
    refs: ['asa2016', 'greenland2016'],
  },
  {
    claim: 'With α = 0.05, only 5% of significant results are false positives.',
    reality: 'α is the false positive rate among true nulls. The share of significant results that are false (the false positive risk) depends on power and the prior, and is often far higher than 5%.',
    tryIt: { label: 'Lesson 6: false positive risk', to: '/learn/fpr' },
    refs: ['ioannidis2005', 'colquhoun2014'],
  },
  {
    claim: 'p > 0.05 shows there is no effect.',
    reality: 'A non-significant result is compatible with no effect and, in a small or noisy study, with large effects. Look at the confidence interval; to support “no meaningful effect”, run an equivalence test.',
    tryIt: { label: 'Equivalence explorer', to: '/learn/design' },
    refs: ['greenland2016', 'lakens2017'],
  },
  {
    claim: 'A significant result shows a large or important effect.',
    reality: 'With large n, trivial effects become significant; with small n, important effects may not. p measures incompatibility with H₀, not magnitude or importance.',
    refs: ['asa2016'],
  },
  {
    claim: 'One study was significant and another was not, so their results conflict.',
    reality: 'p = 0.04 and p = 0.06 can come from nearly identical estimates. Compare the effects directly; the difference between significant and non-significant is not itself significant.',
    refs: ['gelman2006', 'greenland2016'],
  },
  {
    claim: 'A 95% CI has a 95% probability of containing the true value.',
    reality: 'The 95% describes the procedure across repeated studies. A specific computed interval either contains the true value or not. Read it as the values compatible with the data.',
    refs: ['hoekstra2014', 'greenland2016'],
  },
  {
    claim: 'If a study had low observed power, its null result is uninformative — and high observed power makes it informative.',
    reality: 'Observed power is a transform of the p-value and adds no information. Power is set before the study for a meaningful effect; afterwards, use the CI.',
    tryIt: { label: 'Lesson 9: design', to: '/learn/design' },
    refs: ['hoenig2001'],
  },
  {
    claim: 'A significant result from a small study is especially impressive because it overcame low power.',
    reality: 'Low power plus significance signals a likely exaggerated estimate (Type M) and a higher false positive risk. Small significant studies replicate less often and with smaller effects.',
    tryIt: { label: 'Exaggeration simulation', to: '/learn/exaggeration' },
    refs: ['gelman2014', 'button2013', 'osc2015'],
  },
  {
    claim: 'You can choose a one-sided test after seeing which way the data point.',
    reality: 'Picking the tail that matches the data doubles the real Type I error rate. Sidedness must be pre-specified.',
    tryIt: { label: 'Lesson 3: α', to: '/learn/alpha' },
    refs: ['ich1998'],
  },
  {
    claim: 'Checking the p-value as data come in and stopping when it is significant is fine.',
    reality: 'Repeated looks inflate the Type I error rate (five looks: about 14% instead of 5%). Use a fixed n or a group-sequential design.',
    tryIt: { label: 'Peeking simulation', to: '/simulate?tab=peeking' },
    refs: ['armitage1969', 'johari2017'],
  },
  {
    claim: 'Running many tests at α = 0.05 keeps the error rate at 5%.',
    reality: 'With 20 independent true nulls the chance of at least one false positive is 64%. Pre-specify the primary analysis or control FWER/FDR.',
    tryIt: { label: 'Multiple tests simulation', to: '/simulate?tab=multiple' },
    refs: ['bh1995', 'simmons2011'],
  },
  {
    claim: 'Use a z test whenever n > 30.',
    reality: 'If σ is estimated, the t test is correct at every n; for large n it agrees with z anyway. The z test is for known σ or large-sample approximations.',
    tryIt: { label: 'Lesson 2: z or t', to: '/learn/noise' },
    refs: ['delacre2017'],
  },
  {
    claim: 'p = 0.05 is strong evidence for the alternative.',
    reality: 'p = 0.05 corresponds to at most about 2.5-to-1 evidence for H₁ over H₀ (4.3 bits of surprise). It is a reason to look further, not a conclusion.',
    refs: ['sellke2001', 'benjamin2018', 'rafi2020'],
  },
  {
    claim: 'A smaller α is always more rigorous.',
    reality: 'At fixed n, lowering α raises β. The right α balances the costs of each error, the number of tests and the plausibility of the hypothesis.',
    refs: ['lakens2018alpha'],
  },
  {
    claim: 'Power is 1 − α.',
    reality: 'Power is 1 − β. With α = 0.05, power can be anything from 5% to nearly 100% depending on δ, σ and n.',
    tryIt: { label: 'Lesson 4: power', to: '/learn/power' },
    refs: ['cohen1988'],
  },
];
