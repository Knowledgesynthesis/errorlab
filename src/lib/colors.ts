/**
 * Okabe–Ito based, colour-blind-safe palette. `fill` for areas, `ink` for
 * text and thin lines (≥ 4.5:1 contrast on white).
 */
export const C = {
  h0: '#334155',
  h1: '#B45309',
  type1: '#D55E00',
  type1Ink: '#A04000',
  type2: '#0072B2',
  type2Ink: '#005A8C',
  power: '#009E73',
  powerInk: '#00795A',
  correct: '#94A3B8',
  correctInk: '#475569',
  pval: '#CC79A7',
  pvalInk: '#9E3F78',
  grid: '#E2E8F0',
  axis: '#64748B',
  text: '#0F172A',
} as const;

/** Distinct colours for saved/compared series. */
export const SERIES = ['#009E73', '#0072B2', '#D55E00', '#CC79A7', '#E69F00', '#56B4E9', '#334155'];
