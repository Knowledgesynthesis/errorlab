/**
 * Predefined scenarios and presets
 */

import type { Scenario, GlossaryTerm } from '../types';

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
    term: 'Type I Error',
    symbol: 'α (alpha)',
    definition: 'Rejecting H₀ when it is actually true (false positive)',
    example: 'Convicting an innocent person',
  },
  {
    term: 'Type II Error',
    symbol: 'β (beta)',
    definition: 'Failing to reject H₀ when H₁ is true (false negative)',
    example: 'Failing to convict a guilty person',
  },
  {
    term: 'Significance Level',
    symbol: 'α',
    definition: 'The probability threshold for rejecting H₀; also the maximum acceptable Type I error rate',
    example: 'α = 0.05 means we accept a 5% chance of false positives',
  },
  {
    term: 'Statistical Power',
    symbol: '1 - β',
    definition: 'The probability of correctly rejecting H₀ when H₁ is true',
    example: 'Power of 0.80 means we have an 80% chance of detecting a true effect',
  },
  {
    term: 'p-value',
    symbol: 'p',
    definition: 'The probability, assuming H₀ is true, of observing data at least as extreme as what we observed',
    example: 'p = 0.03 means our result would occur 3% of the time by chance alone if H₀ were true',
  },
  {
    term: 'Effect Size',
    symbol: 'δ (delta) or d',
    definition: 'The magnitude of the difference between H₀ and H₁, often measured in standard deviations',
    example: 'δ = 0.5 means the true mean differs by half a standard deviation',
  },
  {
    term: 'Null Hypothesis',
    symbol: 'H₀',
    definition: 'The default assumption that there is no effect or no difference',
    example: 'H₀: The new drug has no effect on recovery time',
  },
  {
    term: 'Alternative Hypothesis',
    symbol: 'H₁ or Hₐ',
    definition: 'The claim that there is an effect or a difference',
    example: 'H₁: The new drug reduces recovery time',
  },
  {
    term: 'Critical Value',
    definition: 'The threshold value(s) that define the boundary of the rejection region',
    example: 'For α = 0.05 (two-sided), critical values are approximately ±1.96 for z-test',
  },
  {
    term: 'Sample Size',
    symbol: 'n',
    definition: 'The number of observations in the sample',
    example: 'n = 100 means we collected data from 100 subjects',
  },
];

export const commonMisconceptions = [
  {
    misconception: 'p-value is the probability that H₀ is true',
    reality: 'p-value is the probability of observing our data (or more extreme) IF H₀ is true. It does not tell us the probability that H₀ is true.',
    example: 'p = 0.03 means: "If there were truly no effect, we would see results this extreme 3% of the time." It does NOT mean "there is a 3% chance H₀ is true."',
  },
  {
    misconception: 'Failing to reject H₀ means accepting H₀',
    reality: 'Failing to reject H₀ means we lack sufficient evidence against it. It does not prove H₀ is true.',
    example: 'Like a "not guilty" verdict - it doesn\'t prove innocence, just insufficient evidence for guilt.',
  },
  {
    misconception: 'Smaller α is always better',
    reality: 'Reducing α decreases Type I errors but increases Type II errors (reduces power). The optimal α depends on the relative costs of the two error types.',
    example: 'In medical screening, we might prefer α = 0.10 to catch more true cases, accepting more false alarms.',
  },
  {
    misconception: 'Power equals 1 - α',
    reality: 'Power equals 1 - β. Power depends on α, sample size, effect size, and variance. Reducing α actually decreases power.',
    example: 'You can have α = 0.05 with power anywhere from near 0 to near 1, depending on n and effect size.',
  },
  {
    misconception: 'Statistical significance means practical importance',
    reality: 'With large enough sample sizes, even tiny, practically meaningless effects can be statistically significant.',
    example: 'A drug that extends life by 1 hour might be significant (p < 0.05) with n = 100,000, but is it meaningful?',
  },
];
