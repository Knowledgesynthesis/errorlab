/**
 * Predefined scenarios and presets
 */

import type { Scenario, GlossaryTerm, KeyFormula } from '../types';

export const scenarios: Scenario[] = [
  {
    id: 'medical',
    name: 'Medical Screening',
    description: 'Testing for a rare disease',
    context: 'A hospital is evaluating a new screening test for a disease that affects 5% of the population.',
    state: {
      alpha: 0.05,
      n: 100,
      delta: 0.5,
      sigma: 1,
      testType: 'z-test',
      sidedness: 'two-sided',
      sampleType: 'one-sample',
      prevalence: 0.05,
      N: 10000,
      seed: 12345,
    },
    metaphor: {
      h0: 'Patient does not have the disease',
      h1: 'Patient has the disease',
      type1Description: 'False alarm - telling a healthy person they are sick',
      type2Description: 'Missed diagnosis - telling a sick person they are healthy',
    },
  },
  {
    id: 'ab-test',
    name: 'A/B Test',
    description: 'Testing a new website feature',
    context: 'A company is testing whether a new checkout button increases conversion rates.',
    state: {
      alpha: 0.05,
      n: 500,
      delta: 0.3,
      sigma: 1,
      testType: 'z-test',
      sidedness: 'one-sided-right',
      sampleType: 'two-sample',
      prevalence: 0.5,
      N: 10000,
      seed: 54321,
    },
    metaphor: {
      h0: 'New button has no effect on conversions',
      h1: 'New button increases conversions',
      type1Description: 'Shipping a useless feature - wasting resources on a button that doesn\'t help',
      type2Description: 'Missing a good feature - leaving a helpful button unshipped',
    },
  },
  {
    id: 'quality-control',
    name: 'Quality Control',
    description: 'Manufacturing process monitoring',
    context: 'A factory monitors whether a production line is producing parts within specification.',
    state: {
      alpha: 0.01,
      n: 200,
      delta: 0.4,
      sigma: 1,
      testType: 't-test',
      sidedness: 'two-sided',
      sampleType: 'one-sample',
      prevalence: 0.1,
      N: 10000,
      seed: 99999,
    },
    metaphor: {
      h0: 'Production is within specification',
      h1: 'Production is out of specification',
      type1Description: 'False alarm - stopping production unnecessarily',
      type2Description: 'Missed defect - shipping defective products',
    },
  },
];

export const glossary: GlossaryTerm[] = [
  {
    term: 'Type I Error (False Positive)',
    symbol: 'α (alpha)',
    definition: 'Rejecting the null hypothesis (H₀) when it is actually true. This is like a "false alarm" - you conclude there is an effect when there really isn\'t one. The probability of making this error is denoted by α, which you set before the study (typically 0.05 or 5%). Every time you reject H₀, there is an α probability that you made a Type I error.',
    example: 'Medical screening: Telling a healthy patient they have a disease. Legal: Convicting an innocent person. A/B testing: Launching a feature that doesn\'t actually improve metrics.',
  },
  {
    term: 'Type II Error (False Negative)',
    symbol: 'β (beta)',
    definition: 'Failing to reject the null hypothesis (H₀) when the alternative hypothesis (H₁) is actually true. This is like a "miss" - you fail to detect a real effect that exists. The probability of making this error is denoted by β. Unlike α, β is not directly set but depends on sample size, effect size, variance, and α.',
    example: 'Medical screening: Telling a sick patient they are healthy. Legal: Failing to convict a guilty person. Drug trial: Missing a treatment that actually works.',
  },
  {
    term: 'Significance Level',
    symbol: 'α',
    definition: 'The probability threshold you set for rejecting H₀. It represents the maximum acceptable Type I error rate you\'re willing to tolerate. Common values are 0.05 (5%), 0.01 (1%), or 0.10 (10%). When your p-value is less than α, you reject H₀. This is chosen before collecting data based on the cost of false positives in your context.',
    example: 'α = 0.05 means: "I\'m willing to accept a 5% chance of incorrectly rejecting H₀ when it\'s true." If you run 100 studies where H₀ is true, about 5 will yield p < 0.05 by chance alone.',
  },
  {
    term: 'Statistical Power',
    symbol: '1 - β',
    definition: 'The probability of correctly rejecting H₀ when H₁ is true - in other words, the probability of detecting a real effect if it exists. Power = 1 - β (one minus the Type II error rate). Higher power means you\'re more likely to detect real effects. Convention suggests aiming for power of at least 0.80 (80%). Power increases with larger sample sizes, larger effect sizes, higher α, and lower variance.',
    example: 'Power = 0.80 means: "If there is a real effect of size δ, I have an 80% chance of detecting it (p < α)." With power = 0.80, you\'ll miss 20% of real effects (β = 0.20).',
  },
  {
    term: 'p-value',
    symbol: 'p',
    definition: 'The probability of observing data at least as extreme as what you actually observed, ASSUMING the null hypothesis is true. It is NOT the probability that H₀ is true. A small p-value means your data would be very surprising if H₀ were true, suggesting H₀ might be false. You compare p to your pre-specified α: if p < α, you reject H₀.',
    example: 'p = 0.03 means: "If H₀ were true (no effect exists), we would see results this extreme or more extreme only 3% of the time by random chance." It does NOT mean "there is a 97% chance an effect exists."',
  },
  {
    term: 'Effect Size (Cohen\'s d)',
    symbol: 'δ (delta) or d',
    definition: 'The standardized magnitude of the difference between H₀ and H₁. Cohen\'s d measures this difference in units of standard deviations, making it interpretable across different scales. Formula: d = (μ₁ - μ₀) / σ, where μ₁ is the true mean under H₁, μ₀ is the mean under H₀ (often 0), and σ is the population standard deviation. Cohen\'s rules of thumb: d = 0.2 (small effect), d = 0.5 (medium effect), d = 0.8 (large effect). Larger effects are easier to detect and require smaller sample sizes.',
    example: 'δ = 0.5 means the true mean differs from the null value by half a standard deviation. For IQ (σ = 15), this would be a 7.5-point difference. For height in cm (σ ≈ 7), this would be 3.5 cm.',
  },
  {
    term: 'Null Hypothesis',
    symbol: 'H₀',
    definition: 'The "status quo" or default assumption that there is no effect, no difference, or no relationship. In hypothesis testing, we assume H₀ is true unless the data provide strong evidence against it. H₀ is what we test against, not what we try to prove. For a one-sample test: H₀: μ = μ₀ (the population mean equals some specific value). The burden of proof is on showing H₀ is false, not on showing it\'s true.',
    example: 'H₀: The new drug has no effect on blood pressure (μ_drug = μ_placebo). H₀: The coin is fair (p = 0.5). H₀: The new website design doesn\'t change conversion rates.',
  },
  {
    term: 'Alternative Hypothesis',
    symbol: 'H₁ or Hₐ',
    definition: 'The research hypothesis - the claim that there IS an effect, difference, or relationship. This is what you\'re trying to find evidence for. H₁ can be two-sided (μ ≠ μ₀), one-sided right (μ > μ₀), or one-sided left (μ < μ₀). You reject H₀ in favor of H₁ when the data are sufficiently inconsistent with H₀ (p < α). However, you never "prove" H₁ - you only gather evidence against H₀.',
    example: 'H₁: The new drug lowers blood pressure (μ_drug < μ_placebo). H₁: The coin is biased (p ≠ 0.5). H₁: The new website increases conversions (μ_new > μ_old).',
  },
  {
    term: 'Critical Value',
    symbol: 'z* or t*',
    definition: 'The test statistic value(s) that mark the boundary between the "fail to reject" region and the rejection region. If your calculated test statistic falls beyond the critical value(s), you reject H₀. Critical values depend on α and the type of test (z or t) and sidedness. For a two-sided z-test with α = 0.05, critical values are ±1.96. For one-sided, it\'s 1.645 (or -1.645 for left-sided).',
    example: 'For α = 0.05 (two-sided z-test): If your test statistic is less than -1.96 or greater than +1.96, reject H₀. The region beyond ±1.96 represents the most extreme 5% of the H₀ distribution.',
  },
  {
    term: 'Sample Size',
    symbol: 'n',
    definition: 'The number of independent observations in your sample. Larger samples provide more information and greater precision, leading to higher statistical power. The relationship between sample size and power is non-linear: doubling power requires roughly quadrupling the sample size. Sample size needed depends on desired power, α, effect size, and variance.',
    example: 'n = 100 means you collected data from 100 subjects. To detect a medium effect (d = 0.5) with 80% power at α = 0.05, you need approximately n = 64 per group for a two-sample test.',
  },
  {
    term: 'Standard Deviation',
    symbol: 'σ (sigma) or s',
    definition: 'A measure of variability or spread in the data. σ (sigma) denotes the population standard deviation; s denotes the sample standard deviation. It measures the average distance of data points from the mean. Larger σ means more variability, which makes effects harder to detect and reduces power. When calculating effect size (Cohen\'s d), we divide the mean difference by σ to standardize it.',
    example: 'For normally distributed IQ scores: σ = 15, meaning about 68% of people score within 15 points of the mean (100). If σ = 30 instead, the same effect would be half as large when measured in standard deviations.',
  },
  {
    term: 'Test Statistic',
    symbol: 'z or t',
    definition: 'A standardized value calculated from your sample data that measures how many standard errors your sample mean is from the null hypothesis value. For a z-test: z = (x̄ - μ₀) / (σ / √n). For a t-test: t = (x̄ - μ₀) / (s / √n). You compare this to critical values or use it to calculate a p-value. Large absolute values indicate data inconsistent with H₀.',
    example: 'If z = 2.5, your sample mean is 2.5 standard errors above the null value. For α = 0.05 (two-sided), critical value is ±1.96, so z = 2.5 leads to rejecting H₀.',
  },
  {
    term: 'Standard Error',
    symbol: 'SE or σ/√n',
    definition: 'The standard deviation of the sampling distribution of the mean. It measures how much sample means vary from sample to sample. Formula: SE = σ / √n (for known σ) or SE = s / √n (for estimated σ). The standard error decreases as sample size increases (√n in denominator), which is why larger samples give more precise estimates and greater power.',
    example: 'If σ = 10 and n = 25, then SE = 10 / √25 = 10 / 5 = 2. This means if you repeatedly took samples of n = 25, the sample means would have a standard deviation of 2.',
  },
];

export const commonMisconceptions = [
  {
    misconception: 'p-value is the probability that H₀ is true',
    reality: 'The p-value is P(data or more extreme | H₀ is true), NOT P(H₀ is true | data). This is a critical distinction! The p-value tells you how surprising your data would be IF H₀ were true. It does not tell you the probability that H₀ is actually true. That would require Bayesian inference with prior probabilities.',
    example: 'p = 0.03 means: "If there were truly no effect, we would see results this extreme only 3% of the time by random chance." It does NOT mean "there is a 3% chance H₀ is true" or "97% chance H₁ is true."',
  },
  {
    misconception: 'Failing to reject H₀ means accepting H₀ as true',
    reality: 'Failing to reject H₀ (p ≥ α) means we lack sufficient evidence against it, not that we have evidence FOR it. Absence of evidence is not evidence of absence. You may have failed to reject H₀ because: (1) H₀ is actually true, (2) your sample size was too small (low power), or (3) the effect was smaller than you could detect.',
    example: 'Like a "not guilty" verdict in court - it doesn\'t prove innocence, only that there was insufficient evidence for conviction. The defendant may be guilty, but the evidence wasn\'t strong enough.',
  },
  {
    misconception: 'Smaller α is always better and more rigorous',
    reality: 'Reducing α decreases Type I errors but increases Type II errors (reduces power), creating a trade-off. The optimal α depends on the relative costs of false positives vs. false negatives in your specific context. α = 0.05 is just a convention, not a law of nature. Sometimes α = 0.10 or even α = 0.20 makes more sense.',
    example: 'Cancer screening: We might prefer α = 0.10 to catch more true cases (higher power), accepting more false alarms (which can be ruled out with follow-up tests). The cost of missing cancer (Type II) far exceeds the cost of a false alarm (Type I).',
  },
  {
    misconception: 'Power equals 1 - α, or increasing α doesn\'t affect power',
    reality: 'Power equals 1 - β (NOT 1 - α). Power depends on α, sample size (n), effect size (δ), and variance (σ). While increasing α does increase power (by moving the critical value closer to H₀), the relationship is not "power = 1 - α." You can have α = 0.05 with power anywhere from nearly 0% to nearly 100%, depending on n, δ, and σ.',
    example: 'Study A: α = 0.05, n = 20, δ = 0.3, σ = 1 → Power ≈ 25%. Study B: α = 0.05, n = 200, δ = 0.8, σ = 1 → Power ≈ 99%. Same α, vastly different power!',
  },
  {
    misconception: 'Statistical significance (p < 0.05) means the effect is large or important',
    reality: 'Statistical significance only tells you the effect is probably not zero - it says nothing about the magnitude or practical importance of the effect. With large enough sample sizes, even tiny, practically meaningless effects will be statistically significant. Conversely, large effects may not be significant with small samples (low power).',
    example: 'A drug that extends life by 0.5 days might be highly significant (p = 0.001) with n = 100,000, but is it clinically meaningful? Meanwhile, a treatment extending life by 5 years might have p = 0.08 with n = 20, making it "not significant" despite being important.',
  },
  {
    misconception: 'A non-significant result (p > 0.05) means there is no effect',
    reality: 'A non-significant result means you failed to detect an effect with your sample size and α level - but an effect may still exist. Low power (often due to small n) is a common reason for non-significant results when real effects exist. Before concluding "no effect," check your study\'s power.',
    example: 'You test a drug with n = 10 and get p = 0.15. Don\'t conclude "the drug doesn\'t work"! With such a small sample, you had perhaps only 30% power to detect a real medium-sized effect. The drug might work, but your study was underpowered.',
  },
  {
    misconception: 'Increasing sample size always increases p-values',
    reality: 'Larger sample sizes increase power and precision, making it easier to detect smaller effects. If a real effect exists (even a small one), larger n typically produces smaller p-values. But if H₀ is actually true (no effect), p-values remain uniformly distributed regardless of n, and large samples don\'t systematically change p-values.',
    example: 'True effect δ = 0.3: With n = 20, you might get p = 0.25. With n = 200, you might get p = 0.001. The effect was always there; the larger sample just had the power to detect it.',
  },
  {
    misconception: 'You should adjust your α based on your p-value or run multiple tests without correction',
    reality: 'You must set α BEFORE collecting data and seeing results (pre-registration). Adjusting α after seeing p-values invalidates the error rate guarantees. Also, running multiple tests inflates Type I error: with 20 independent tests at α = 0.05, you have a 64% chance of at least one false positive even if all null hypotheses are true! Use corrections like Bonferroni when running multiple tests.',
    example: 'You run 20 A/B tests on website features. Even if none actually work, you\'d expect about 1 false positive (20 × 0.05 = 1). Don\'t cherry-pick the one "significant" result - use Bonferroni correction: α_adjusted = 0.05/20 = 0.0025.',
  },
  {
    misconception: 'Effect size (Cohen\'s d) and p-value tell you the same thing',
    reality: 'Effect size measures the magnitude of the difference (how big is the effect?), while p-value measures the strength of evidence against H₀ (how surprising is this result if H₀ were true?). A tiny effect can be highly significant with large n, and a huge effect can be non-significant with small n. Always report both!',
    example: 'Study 1: d = 0.05 (tiny), n = 10,000, p = 0.001 (significant but trivial). Study 2: d = 1.2 (huge), n = 15, p = 0.08 (not significant but potentially important - just underpowered).',
  },
];

export const keyFormulas: KeyFormula[] = [
  {
    name: 'Cohen\'s d (Effect Size)',
    formula: 'd = (μ₁ - μ₀) / σ',
    variables: [
      { symbol: 'd', meaning: 'Effect size (Cohen\'s d) - standardized mean difference' },
      { symbol: 'μ₁', meaning: 'Population mean under H₁ (alternative hypothesis)' },
      { symbol: 'μ₀', meaning: 'Population mean under H₀ (null hypothesis, often 0)' },
      { symbol: 'σ', meaning: 'Population standard deviation' },
    ],
    description: 'Measures the standardized difference between two means. Expresses the difference in standard deviation units, making it comparable across different measurement scales. Interpretation: d = 0.2 (small), d = 0.5 (medium), d = 0.8 (large).',
    example: 'If testing whether a training program increases IQ (σ = 15), and the program increases mean IQ from 100 to 107.5: d = (107.5 - 100) / 15 = 0.5 (medium effect).',
  },
  {
    name: 'Standard Error (SE)',
    formula: 'SE = σ / √n',
    variables: [
      { symbol: 'SE', meaning: 'Standard Error - standard deviation of the sampling distribution of the mean' },
      { symbol: 'σ', meaning: 'Population standard deviation (or s for sample SD)' },
      { symbol: 'n', meaning: 'Sample size (number of observations)' },
      { symbol: '√n', meaning: 'Square root of sample size' },
    ],
    description: 'Measures how much sample means vary from sample to sample. The SE decreases as sample size increases (due to √n in denominator), which is why larger samples give more precise estimates. Smaller SE means more precision and higher power.',
    example: 'With σ = 20 and n = 100: SE = 20 / √100 = 20 / 10 = 2. If you repeatedly sampled 100 people, the sample means would have SD = 2.',
  },
  {
    name: 'z-Test Statistic',
    formula: 'z = (x̄ - μ₀) / (σ / √n)',
    variables: [
      { symbol: 'z', meaning: 'Test statistic - number of standard errors from the null value' },
      { symbol: 'x̄', meaning: 'Sample mean (observed average from your data)' },
      { symbol: 'μ₀', meaning: 'Null hypothesis value (the value H₀ claims is true)' },
      { symbol: 'σ', meaning: 'Known population standard deviation' },
      { symbol: 'n', meaning: 'Sample size' },
    ],
    description: 'Measures how many standard errors your sample mean is from the null hypothesis value. Used when population σ is known. Compare z to critical values (e.g., ±1.96 for α = 0.05, two-sided) to decide whether to reject H₀. Larger |z| means stronger evidence against H₀.',
    example: 'x̄ = 105, μ₀ = 100, σ = 15, n = 36. Then z = (105 - 100) / (15/√36) = 5 / 2.5 = 2.0. Since 2.0 > 1.96, reject H₀ at α = 0.05.',
  },
  {
    name: 't-Test Statistic',
    formula: 't = (x̄ - μ₀) / (s / √n)',
    variables: [
      { symbol: 't', meaning: 'Test statistic - similar to z but uses sample SD' },
      { symbol: 'x̄', meaning: 'Sample mean' },
      { symbol: 'μ₀', meaning: 'Null hypothesis value' },
      { symbol: 's', meaning: 'Sample standard deviation (estimated from data)' },
      { symbol: 'n', meaning: 'Sample size' },
    ],
    description: 'Similar to z-test but uses sample standard deviation s instead of known σ. Used when population σ is unknown (most real-world cases). Follows t-distribution with df = n - 1. Critical values are slightly larger than z (e.g., t* ≈ 2.0 vs z* = 1.96 for α = 0.05, two-sided, when n is moderate).',
    example: 'x̄ = 52, μ₀ = 50, s = 8, n = 25. Then t = (52 - 50) / (8/√25) = 2 / 1.6 = 1.25. Compare to critical value from t-table with df = 24.',
  },
  {
    name: 'Critical Value (Two-sided)',
    formula: 'z* = ±z_(α/2)  or  t* = ±t_(α/2, df)',
    variables: [
      { symbol: 'z* or t*', meaning: 'Critical value(s) marking rejection region boundaries' },
      { symbol: 'α/2', meaning: 'Half of α in each tail for two-sided tests' },
      { symbol: 'df', meaning: 'Degrees of freedom = n - 1 for one-sample t-test' },
    ],
    description: 'For two-sided tests, there are two critical values (one positive, one negative) that define the rejection region. Reject H₀ if your test statistic falls beyond either critical value. For α = 0.05: z* = ±1.96 (z-test), t* ≈ ±2.0 (t-test, moderate n).',
    example: 'Two-sided z-test with α = 0.05: Critical values are ±1.96. Reject H₀ if z < -1.96 or z > +1.96. This defines a rejection region containing 5% of the H₀ distribution (2.5% in each tail).',
  },
  {
    name: 'Non-centrality Parameter',
    formula: 'λ = δ / (σ / √n)  =  δ√n / σ',
    variables: [
      { symbol: 'λ (lambda)', meaning: 'Non-centrality parameter - shift in distribution under H₁' },
      { symbol: 'δ (delta)', meaning: 'True effect size (μ₁ - μ₀)' },
      { symbol: 'σ', meaning: 'Population standard deviation' },
      { symbol: 'n', meaning: 'Sample size' },
    ],
    description: 'Represents how much the sampling distribution of the test statistic shifts when H₁ is true (compared to H₀). Larger λ means H₀ and H₁ distributions are more separated, leading to higher power. Power calculations are based on λ.',
    example: 'δ = 5, σ = 10, n = 25. Then λ = 5 / (10/√25) = 5 / 2 = 2.5. The H₁ distribution is centered at 2.5 (in test statistic units), not 0.',
  },
  {
    name: 'Statistical Power',
    formula: 'Power = 1 - β = P(reject H₀ | H₁ is true)',
    variables: [
      { symbol: 'Power', meaning: 'Probability of correctly rejecting H₀ when H₁ is true' },
      { symbol: 'β (beta)', meaning: 'Type II error rate - probability of failing to reject false H₀' },
      { symbol: '1 - β', meaning: 'One minus Type II error rate' },
    ],
    description: 'The probability that your test will detect a real effect of size δ. Power depends on α (↑α ⇒ ↑power), n (↑n ⇒ ↑power), δ (↑δ ⇒ ↑power), and σ (↑σ ⇒ ↓power). Standard target: Power ≥ 0.80. Calculated using the non-central t or z distribution.',
    example: 'With α = 0.05, n = 64, δ = 0.5, σ = 1: Power ≈ 0.80. This means if the true effect is d = 0.5, you have 80% chance of getting p < 0.05.',
  },
  {
    name: 'Sample Size for Desired Power',
    formula: 'n ≈ [(z_(α/2) + z_β) / d]²',
    variables: [
      { symbol: 'n', meaning: 'Required sample size per group' },
      { symbol: 'z_(α/2)', meaning: 'z-value for α/2 (e.g., 1.96 for α = 0.05, two-sided)' },
      { symbol: 'z_β', meaning: 'z-value for β (e.g., 0.84 for power = 0.80, so β = 0.20)' },
      { symbol: 'd', meaning: 'Cohen\'s d effect size you want to detect' },
    ],
    description: 'Approximation for calculating required sample size to achieve desired power for detecting effect size d. For two-sided test with α = 0.05 and power = 0.80: n ≈ [(1.96 + 0.84) / d]² ≈ (2.8 / d)² ≈ 7.84 / d². Small effects require much larger samples.',
    example: 'To detect d = 0.5 with 80% power at α = 0.05: n ≈ (2.8 / 0.5)² = 5.6² ≈ 31 per group. To detect d = 0.2: n ≈ (2.8 / 0.2)² = 14² = 196 per group!',
  },
  {
    name: 'Confidence Interval for Mean',
    formula: 'CI = x̄ ± (z* or t*) × SE',
    variables: [
      { symbol: 'CI', meaning: 'Confidence interval - range of plausible values for μ' },
      { symbol: 'x̄', meaning: 'Sample mean' },
      { symbol: 'z* or t*', meaning: 'Critical value for desired confidence level (1.96 for 95% CI)' },
      { symbol: 'SE', meaning: 'Standard error = σ/√n or s/√n' },
    ],
    description: 'A range that contains the true population mean μ with specified probability (e.g., 95%). Wider intervals indicate more uncertainty. For 95% CI with z-test: x̄ ± 1.96 × (σ/√n). If CI excludes μ₀, reject H₀ at corresponding α.',
    example: 'x̄ = 105, σ = 15, n = 36, SE = 2.5. For 95% CI: 105 ± 1.96(2.5) = 105 ± 4.9 = [100.1, 109.9]. We are 95% confident the true mean is between 100.1 and 109.9.',
  },
  {
    name: 'Relationship Between Errors',
    formula: 'P(Type I) + P(Type II) ≠ 1  (they\'re independent)',
    variables: [
      { symbol: 'α', meaning: 'P(Type I error) = P(reject H₀ | H₀ true)' },
      { symbol: 'β', meaning: 'P(Type II error) = P(fail to reject H₀ | H₁ true)' },
      { symbol: 'Power', meaning: '1 - β = P(reject H₀ | H₁ true)' },
    ],
    description: 'Type I and Type II error probabilities do NOT sum to 1! They apply to different scenarios: α applies when H₀ is true, β applies when H₁ is true. However, they trade off: decreasing α increases β (reduces power) if n, δ, σ stay constant. To reduce both errors, increase n or δ.',
    example: 'You can have α = 0.05 and β = 0.20 (power = 0.80). These don\'t sum to 1. If you reduce α to 0.01, β might increase to 0.40 (power drops to 0.60) unless you increase n.',
  },
];
