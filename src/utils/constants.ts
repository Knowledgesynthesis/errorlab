/**
 * Application constants
 */

export const DEFAULTS = {
  ALPHA: 0.05,
  N: 100,
  DELTA: 0.5,
  SIGMA: 1,
  PREVALENCE: 0.1,
  N_POPULATION: 10000,
  SEED: 12345,
};

export const RANGES = {
  ALPHA: { min: 0.001, max: 0.2, step: 0.001 },
  N: { min: 10, max: 1000, step: 10 },
  DELTA: { min: 0, max: 2, step: 0.1 },
  SIGMA: { min: 0.1, max: 5, step: 0.1 },
  PREVALENCE: { min: 0.01, max: 0.99, step: 0.01 },
};

export const COLORS = {
  TYPE1: '#ef4444', // Red for Type I error
  TYPE2: '#3b82f6', // Blue for Type II error
  POWER: '#10b981', // Green for power
  CORRECT: '#6b7280', // Gray for correct
  H0: '#94a3b8', // Slate for H0 distribution
  H1: '#f59e0b', // Amber for H1 distribution
};

export const DISTRIBUTION_POINTS = 200; // Number of points to plot for distributions
export const POWER_CURVE_POINTS = 50; // Number of points for power curves
