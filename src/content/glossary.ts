export interface GlossaryEntry {
  term: string;
  symbol?: string;
  definition: string;
  /** the most common confusion, if any */
  confusion?: string;
  lesson?: string;
  refs?: string[];
}

export const GLOSSARY: GlossaryEntry[] = [
  { term: 'Null hypothesis', symbol: 'H₀', definition: 'The model being tested, usually “no effect” (δ = 0). The test asks whether the data are incompatible with it.', confusion: 'Not rejecting H₀ does not show it is true.', lesson: 'decisions' },
  { term: 'Alternative hypothesis', symbol: 'H₁', definition: 'What is true if H₀ is false: δ ≠ 0 (two-sided), δ > 0 or δ < 0 (one-sided). For power calculations it is a specific effect size.', lesson: 'decisions' },
  { term: 'Type I error', definition: 'Rejecting H₀ when it is true: a false positive.', lesson: 'decisions' },
  { term: 'Type II error', definition: 'Not rejecting H₀ when H₁ is true: a false negative, or miss.', lesson: 'decisions' },
  { term: 'Significance level', symbol: 'α', definition: 'P(reject H₀ | H₀ true). Chosen before the data; the long-run false positive rate among tests of true nulls.', confusion: 'α is not the probability that a significant result is a false positive (see false positive risk).', lesson: 'alpha', refs: ['greenland2016'] },
  { term: 'Type II error rate', symbol: 'β', definition: 'P(do not reject H₀ | H₁ true with effect δ). Depends on δ, σ, n and α.', confusion: 'β is not 1 − α.', lesson: 'power' },
  { term: 'Power', symbol: '1 − β', definition: 'P(reject H₀ | H₁ true with effect δ): the chance a design detects an effect of a given size. Conventional targets are 80% or 90%.', confusion: 'A property of the design and an assumed effect, not of an observed result.', lesson: 'power', refs: ['cohen1988'] },
  { term: 'p-value', symbol: 'p', definition: 'The probability, computed under H₀ and all model assumptions, of a test statistic at least as extreme as the one observed. Uniform on [0, 1] when H₀ is true.', confusion: 'Not the probability that H₀ is true, nor that the result is “due to chance.”', lesson: 'pvalues', refs: ['asa2016'] },
  { term: 'Test statistic', symbol: 'z, t', definition: '(estimate − value under H₀) / SE: the distance of the estimate from the null value in standard errors.', lesson: 'noise' },
  { term: 'Standard deviation', symbol: 'σ, s', definition: 'Spread of individual observations. σ is the population value; s is its estimate from a sample.', confusion: 'Not the same as the standard error.', lesson: 'noise' },
  { term: 'Standard error', symbol: 'SE', definition: 'Standard deviation of an estimate across repeated samples. For a mean: σ/√n; for a difference of two independent means with n each: σ·√(2/n).', lesson: 'noise' },
  { term: 'Degrees of freedom', symbol: 'df', definition: 'Shape parameter of the t distribution: n − 1 for one sample or paired data, 2n − 2 for two pooled groups of n.', lesson: 'noise' },
  { term: 'z test', definition: 'Test using the standard normal reference distribution. Correct when σ is known from outside the study, or as a large-sample approximation (e.g. proportions).', lesson: 'noise' },
  { term: 't test', definition: 'Test using the t reference distribution, correct whenever σ is estimated from the data — at any sample size.', confusion: '“Use z when n > 30” is an outdated shortcut.', lesson: 'noise' },
  { term: 'Welch’s t test', definition: 'Two-group t test that does not assume equal variances. Recommended default for independent groups.', lesson: 'noise', refs: ['delacre2017'] },
  { term: 'Critical value', definition: 'Boundary of the rejection region, e.g. ±1.96 for a two-sided z test at α = 0.05.', lesson: 'alpha' },
  { term: 'Rejection region', definition: 'Values of the test statistic that lead to rejecting H₀. Its probability under H₀ is α.', lesson: 'alpha' },
  { term: 'One-sided vs two-sided test', definition: 'A two-sided test splits α between both tails and detects effects in either direction. A one-sided test puts α in one tail, gains power in that direction and cannot detect the other.', confusion: 'Sidedness must be fixed before seeing the data.', lesson: 'alpha', refs: ['ich1998'] },
  { term: 'Effect size', symbol: 'δ', definition: 'The true difference in outcome units (e.g. mmHg). Report it with its CI.', lesson: 'power' },
  { term: 'Cohen’s d', symbol: 'd', definition: 'Standardised effect: δ / σ. Cohen’s benchmarks (0.2, 0.5, 0.8) are a fallback; judge size in context.', lesson: 'power', refs: ['cohen1988', 'funder2019'] },
  { term: 'Noncentrality', symbol: 'λ', definition: 'δ / SE: where the test statistic is centred when H₁ is true. Power grows with λ; λ ≈ 2.8 gives 80% power at two-sided α = 0.05.', lesson: 'power' },
  { term: 'Confidence interval', symbol: 'CI', definition: 'An interval from a procedure that captures the true value in a stated share (e.g. 95%) of repeated studies. Read it as the range of effect sizes compatible with the data and model.', confusion: 'A computed 95% CI does not contain the true value with 95% probability; the 95% describes the procedure.', refs: ['hoekstra2014', 'greenland2016'] },
  { term: 'False positive risk', symbol: 'FPR', definition: 'P(H₀ true | significant): the share of significant results that are false. Depends on α, power and the prior probability of H₁.', lesson: 'fpr', refs: ['colquhoun2014', 'ioannidis2005'] },
  { term: 'Positive predictive value', symbol: 'PPV', definition: 'P(H₁ true | significant) = 1 − FPR.', lesson: 'fpr' },
  { term: 'Prior probability', symbol: 'π', definition: 'Share of tested hypotheses that are true (or the probability assigned to H₁ before the study).', lesson: 'fpr' },
  { term: 'Type M error', definition: 'Magnitude error. The exaggeration ratio is the expected |estimate| among significant results divided by the true |δ|. Large when power is low.', lesson: 'exaggeration', refs: ['gelman2014'] },
  { term: 'Type S error', definition: 'Sign error: a significant estimate with the wrong sign. Non-negligible when power is very low.', lesson: 'exaggeration', refs: ['gelman2014'] },
  { term: 'Family-wise error rate', symbol: 'FWER', definition: 'P(at least one false positive) across a family of tests; 1 − (1 − α)ᵐ for m independent true nulls.', lesson: 'multiplicity' },
  { term: 'False discovery rate', symbol: 'FDR', definition: 'Expected share of false positives among all rejections. Controlled by the Benjamini–Hochberg procedure.', lesson: 'multiplicity', refs: ['bh1995'] },
  { term: 'Bonferroni correction', definition: 'Test each of m hypotheses at α/m. Controls FWER; conservative.', lesson: 'multiplicity' },
  { term: 'Holm procedure', definition: 'Step-down FWER control: compare the k-th smallest p-value with α/(m − k + 1). Never less powerful than Bonferroni.', lesson: 'multiplicity', refs: ['holm1979'] },
  { term: 'Optional stopping', definition: 'Testing repeatedly as data accumulate and stopping at the first significant result. Inflates the Type I error rate.', lesson: 'multiplicity', refs: ['armitage1969'] },
  { term: 'Group-sequential design', definition: 'Pre-planned interim analyses with adjusted thresholds (e.g. Pocock, O’Brien–Fleming) that keep the overall α.', lesson: 'multiplicity', refs: ['pocock1977', 'obrien1979'] },
  { term: 'Pre-registration', definition: 'Public, time-stamped record of hypotheses, outcomes and analysis plan made before data collection. Separates confirmatory from exploratory analyses.', lesson: 'multiplicity', refs: ['simmons2011'] },
  { term: 'S-value', definition: '−log₂(p): information against H₀ in bits. p = 0.05 ≈ 4.3 bits, about four heads in a row from a fair coin.', lesson: 'pvalues', refs: ['rafi2020'] },
  { term: 'Bayes factor bound', definition: '1/(−e·p·ln p), the largest Bayes factor for H₁ over H₀ a p-value can represent (p < 1/e). About 2.5 at p = 0.05.', lesson: 'pvalues', refs: ['sellke2001'] },
  { term: 'Smallest effect size of interest', symbol: 'SESOI', definition: 'The smallest effect that would matter in practice; the basis for sample size planning and equivalence margins.', lesson: 'design', refs: ['lakens2022'] },
  { term: 'Minimum detectable effect', symbol: 'MDE', definition: 'The smallest effect a given design detects with the target power.', lesson: 'design' },
  { term: 'Equivalence test (TOST)', definition: 'Two one-sided tests against margins ±Δ; equivalence is shown when the (1 − 2α) CI lies inside the margins.', lesson: 'design', refs: ['schuirmann1987', 'lakens2017'] },
  { term: 'Observed (post-hoc) power', definition: 'Power computed from the observed effect after a study. A one-to-one function of the p-value; uninformative.', lesson: 'design', refs: ['hoenig2001'] },
];
