const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };

/** 2.9e-7 → "2.9 × 10⁻⁷" */
export function sci(x: number, digits = 2): string {
  if (x === 0) return '0';
  const [m, e] = x.toExponential(digits - 1).split('e');
  const exp = String(Number(e)).replace(/[-0-9]/g, (c) => SUPERSCRIPT[c]);
  return `${m} × 10${exp}`;
}

/** p-values: 3 decimals down to 0.001, scientific below. */
export function fmtP(p: number): string {
  if (!Number.isFinite(p)) return '—';
  if (p >= 0.9995) return '1.000';
  if (p >= 0.001) return p.toFixed(3);
  if (p < 1e-300) return '< 10⁻³⁰⁰';
  return sci(p, 2);
}

export function fmtPct(x: number, digits = 1): string {
  if (!Number.isFinite(x)) return '—';
  const v = x * 100;
  const lim = 10 ** -digits;
  if (v > 0 && v < lim) return `< ${lim}%`;
  if (v < 100 && v > 100 - lim) return `> ${(100 - lim).toFixed(digits)}%`;
  return `${v.toFixed(digits)}%`;
}

export function fmt(x: number, digits = 2): string {
  if (!Number.isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : '—';
  return x.toFixed(digits).replace(/^-/, '−');
}

/** Sensible significant-figure formatting for values of any scale. */
export function fmtSig(x: number, sig = 3): string {
  if (!Number.isFinite(x)) return fmt(x);
  if (x === 0) return '0';
  const ax = Math.abs(x);
  if (ax >= 1e5 || ax < 1e-3) return sci(x, sig).replace(/^-/, '−');
  const digits = Math.max(0, sig - 1 - Math.floor(Math.log10(ax)));
  return x.toFixed(digits).replace(/^-/, '−');
}

export function fmtInt(x: number): string {
  return Math.round(x).toLocaleString('en-US');
}

export function plural(n: number, word: string, pluralWord = `${word}s`): string {
  return `${fmtInt(n)} ${n === 1 ? word : pluralWord}`;
}
