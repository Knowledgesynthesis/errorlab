/**
 * Type definitions for ErrorLab
 */

export type TestType = 'z-test' | 't-test';
export type Sidedness = 'one-sided-right' | 'one-sided-left' | 'two-sided';
export type SampleType = 'one-sample' | 'two-sample';

/**
 * Main experiment state containing all parameters
 */
export interface ExperimentState {
  // Significance level (Type I error rate)
  alpha: number;

  // Sample size
  n: number;

  // Effect size (Cohen's d or mean difference)
  delta: number;

  // Population standard deviation
  sigma: number;

  // Test configuration
  testType: TestType;
  sidedness: Sidedness;
  sampleType: SampleType;

  // Prior probability that H1 is true (for 2x2 table)
  prevalence: number;

  // Total population size for 2x2 table visualization
  N: number;

  // Random seed for reproducible samples
  seed: number;
}

/**
 * Derived values computed from ExperimentState
 */
export interface DerivedValues {
  // Critical value(s) for the test
  criticalValues: number[];

  // Bounds of rejection region(s)
  rejectionRegion: { lower: number | null; upper: number | null };

  // Type II error rate
  beta: number;

  // Statistical power (1 - beta)
  power: number;

  // Degrees of freedom (for t-test)
  df?: number;

  // Non-centrality parameter
  ncp?: number;
}

/**
 * Sample data and test results
 */
export interface SampleData {
  // Sample values
  values: number[];

  // Sample mean
  mean: number;

  // Sample standard deviation
  sd: number;

  // Test statistic
  testStatistic: number;

  // p-value
  pValue: number;

  // Decision (reject or fail to reject H0)
  decision: 'reject' | 'fail-to-reject';
}

/**
 * 2x2 confusion matrix data
 */
export interface TwoByTwoData {
  // True H0, Fail to reject (Correct)
  trueNegative: number;

  // True H0, Reject (Type I error)
  falsePositive: number;

  // True H1, Fail to reject (Type II error)
  falseNegative: number;

  // True H1, Reject (Power/Correct)
  truePositive: number;
}

/**
 * Scenario preset for quick switching
 */
export interface Scenario {
  id: string;
  name: string;
  description: string;
  context: string;
  state: ExperimentState;
  metaphor: {
    h0: string;
    h1: string;
    type1Description: string;
    type2Description: string;
  };
}

/**
 * Quiz question
 */
export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'numeric';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  hint?: string;
}

/**
 * Power curve data point
 */
export interface PowerCurvePoint {
  x: number; // n or delta
  power: number;
  beta: number;
}

/**
 * Distribution data for plotting
 */
export interface DistributionData {
  x: number;
  h0: number;
  h1: number;
  inRejectionRegion: boolean;
}

/**
 * Glossary term
 */
export interface GlossaryTerm {
  term: string;
  symbol?: string;
  definition: string;
  example?: string;
}

/**
 * Key formula
 */
export interface KeyFormula {
  name: string;
  formula: string;
  variables: Array<{
    symbol: string;
    meaning: string;
  }>;
  description: string;
  example?: string;
}
