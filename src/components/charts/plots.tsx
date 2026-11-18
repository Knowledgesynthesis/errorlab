import { C } from '../../lib/colors';
import { fmt, fmtP } from '../../lib/format';
import { linearScale, linePath, logScale, niceTicks, tickLabel } from './scale';
import { useWidth } from './useWidth';

// ---------------------------------------------------------------------------
// Histogram of p-values on [0, 1]
// ---------------------------------------------------------------------------

export function PHistogram({ values, alpha, bins = 20, label, expectedUniform }: { values: ArrayLike<number>; alpha: number; bins?: number; label: string; expectedUniform?: boolean }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const h = width < 480 ? 200 : 240;
  const M = { top: 12, right: 12, bottom: 36, left: 44 };
  const counts = new Array(bins).fill(0);
  for (let i = 0; i < values.length; i++) counts[Math.min(bins - 1, Math.floor(values[i] * bins))]++;
  const total = values.length || 1;
  const shares = counts.map((c) => c / total);
  const yMax = Math.max(0.1, ...shares) * 1.1;
  const x = linearScale([0, 1], [M.left, width - M.right]);
  const y = linearScale([0, yMax], [h - M.bottom, M.top]);
  const bw = (width - M.left - M.right) / bins;
  return (
    <div ref={ref} className="w-full">
      <svg width={width} height={h} role="img" aria-label={label} className="block">
        {niceTicks(0, yMax, 4).map((t) => (
          <g key={t}>
            <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} stroke={C.grid} />
            <text x={M.left - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill={C.axis}>
              {Math.round(t * 100)}%
            </text>
          </g>
        ))}
        {shares.map((s, i) => {
          const lo = i / bins;
          const below = lo + 1 / bins <= alpha + 1e-12;
          return <rect key={i} x={M.left + i * bw + 0.5} width={Math.max(0, bw - 1)} y={y(s)} height={y(0) - y(s)} fill={below ? C.type1 : '#94A3B8'} opacity={below ? 0.85 : 0.6} />;
        })}
        {expectedUniform && <line x1={M.left} x2={width - M.right} y1={y(1 / bins)} y2={y(1 / bins)} stroke={C.text} strokeDasharray="5 4" />}
        <line x1={x(alpha)} x2={x(alpha)} y1={M.top} y2={y(0)} stroke={C.type1Ink} strokeWidth={1.5} />
        <text x={x(alpha) + 4} y={M.top + 10} fontSize="11" fill={C.type1Ink} fontWeight="600">
          α = {alpha}
        </text>
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => (
          <text key={t} x={x(t)} y={h - M.bottom + 16} textAnchor="middle" fontSize="11" fill={C.axis}>
            {t}
          </text>
        ))}
        <line x1={M.left} x2={width - M.right} y1={y(0)} y2={y(0)} stroke={C.axis} />
        <text x={(M.left + width - M.right) / 2} y={h - 4} textAnchor="middle" fontSize="11" fill={C.axis}>
          p-value (bins of {1 / bins})
        </text>
        <text transform={`translate(12,${(M.top + h - M.bottom) / 2}) rotate(-90)`} textAnchor="middle" fontSize="11" fill={C.axis}>
          share of studies
        </text>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icon array of natural frequencies (e.g. 1,000 hypotheses)
// ---------------------------------------------------------------------------

export interface IconGroup {
  count: number;
  color: string;
  label: string;
  hollow?: boolean;
}

export function IconArray({ groups, columns = 40, label }: { groups: IconGroup[]; columns?: number; label: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const total = groups.reduce((s, g) => s + g.count, 0);
  const cols = width < 420 ? Math.min(columns, 25) : columns;
  const rows = Math.ceil(total / cols);
  const cell = Math.min(14, width / cols);
  const gap = cell * 0.18;
  const cells: { color: string; hollow?: boolean }[] = [];
  for (const g of groups) for (let i = 0; i < g.count; i++) cells.push({ color: g.color, hollow: g.hollow });
  return (
    <div ref={ref} className="w-full">
      <svg width={cols * cell} height={rows * cell} role="img" aria-label={label} className="mx-auto block">
        {cells.map((c, i) => {
          const cx = (i % cols) * cell;
          const cy = Math.floor(i / cols) * cell;
          return c.hollow ? (
            <rect key={i} x={cx + gap / 2 + 0.75} y={cy + gap / 2 + 0.75} width={cell - gap - 1.5} height={cell - gap - 1.5} rx={1.5} fill="white" stroke={c.color} strokeWidth={1.2} />
          ) : (
            <rect key={i} x={cx + gap / 2} y={cy + gap / 2} width={cell - gap} height={cell - gap} rx={1.5} fill={c.color} />
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stack of confidence intervals from replications ("dance of the p-values")
// ---------------------------------------------------------------------------

export interface CIRow {
  estimate: number;
  lo: number;
  hi: number;
  p: number;
  significant: boolean;
}

export function CIStack({ rows, truth, label, unit = '' }: { rows: CIRow[]; truth: number; label: string; unit?: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const rowH = 18;
  const M = { top: 8, right: 70, bottom: 30, left: 34 };
  const h = M.top + M.bottom + rows.length * rowH;
  const lo = Math.min(0, truth, ...rows.map((r) => r.lo));
  const hi = Math.max(0, truth, ...rows.map((r) => r.hi));
  const pad = (hi - lo) * 0.05 || 1;
  const x = linearScale([lo - pad, hi + pad], [M.left, width - M.right]);
  return (
    <div ref={ref} className="w-full">
      <svg width={width} height={h} role="img" aria-label={label} className="block">
        <line x1={x(0)} x2={x(0)} y1={M.top} y2={h - M.bottom} stroke={C.h0} strokeWidth={1.5} />
        <line x1={x(truth)} x2={x(truth)} y1={M.top} y2={h - M.bottom} stroke={C.h1} strokeWidth={1.5} strokeDasharray="5 4" />
        {rows.map((r, i) => {
          const cy = M.top + i * rowH + rowH / 2;
          const col = r.significant ? C.powerInk : C.axis;
          return (
            <g key={i}>
              <text x={M.left - 8} y={cy} dy="0.32em" textAnchor="end" fontSize="10" fill={C.axis}>
                {i + 1}
              </text>
              <line x1={x(r.lo)} x2={x(r.hi)} y1={cy} y2={cy} stroke={col} strokeWidth={2} />
              <circle cx={x(r.estimate)} cy={cy} r={3.5} fill={r.significant ? C.powerInk : 'white'} stroke={col} strokeWidth={1.5} />
              <text x={width - M.right + 6} y={cy} dy="0.32em" fontSize="11" fontFamily="ui-monospace, monospace" fill={r.significant ? C.powerInk : C.axis} fontWeight={r.significant ? 600 : 400}>
                {r.p < 0.001 ? 'p<0.001' : `p=${fmtP(r.p)}`}
              </text>
            </g>
          );
        })}
        {niceTicks(lo - pad, hi + pad, width < 480 ? 4 : 7).map((t) => (
          <text key={t} x={x(t)} y={h - M.bottom + 14} textAnchor="middle" fontSize="11" fill={C.axis}>
            {tickLabel(t)}
          </text>
        ))}
        <text x={(M.left + width - M.right) / 2} y={h - 3} textAnchor="middle" fontSize="11" fill={C.axis}>
          estimated difference{unit ? ` (${unit})` : ''} with confidence interval
        </text>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Strip plot of estimates (significant ones highlighted)
// ---------------------------------------------------------------------------

export function EstimateStrip({ estimates, significant, truth, meanSignificant, label, unit = '' }: { estimates: ArrayLike<number>; significant: ArrayLike<number>; truth: number; meanSignificant: number | null; label: string; unit?: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const h = width < 480 ? 180 : 210;
  const M = { top: 22, right: 14, bottom: 48, left: 14 };
  const arr = Array.from(estimates);
  const lo = Math.min(0, truth, ...arr);
  const hi = Math.max(0, truth, ...arr);
  const pad = (hi - lo) * 0.04 || 1;
  const x = linearScale([lo - pad, hi + pad], [M.left, width - M.right]);
  // deterministic jitter
  const jitter = (i: number) => ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
  const band = h - M.top - M.bottom;
  return (
    <div ref={ref} className="w-full">
      <svg width={width} height={h} role="img" aria-label={label} className="block">
        {arr.map((e, i) => (
          <circle key={i} cx={x(e)} cy={M.top + jitter(i) * band} r={significant[i] ? 3.2 : 2.4} fill={significant[i] ? C.power : '#CBD5E1'} opacity={significant[i] ? 0.85 : 0.8} />
        ))}
        <line x1={x(0)} x2={x(0)} y1={M.top - 8} y2={h - M.bottom} stroke={C.h0} strokeWidth={1.5} />
        <text x={x(0)} y={M.top - 10} textAnchor="middle" fontSize="11" fill={C.h0}>
          0
        </text>
        <line x1={x(truth)} x2={x(truth)} y1={M.top - 8} y2={h - M.bottom} stroke={C.h1} strokeWidth={2} strokeDasharray="5 4" />
        <text x={x(truth)} y={M.top - 10} textAnchor="middle" fontSize="11" fill={C.h1} fontWeight="600">
          true δ
        </text>
        {meanSignificant !== null && (
          <>
            <line x1={x(meanSignificant)} x2={x(meanSignificant)} y1={M.top - 8} y2={h - M.bottom} stroke={C.powerInk} strokeWidth={2.5} />
            <text x={x(meanSignificant)} y={M.top - 10} dx={meanSignificant > truth ? 6 : -6} textAnchor={meanSignificant > truth ? 'start' : 'end'} fontSize="11" fill={C.powerInk} fontWeight="600">
              mean of significant
            </text>
          </>
        )}
        {niceTicks(lo - pad, hi + pad, width < 480 ? 4 : 8).map((t) => (
          <text key={t} x={x(t)} y={h - M.bottom + 12} textAnchor="middle" fontSize="10" fill={C.axis}>
            {tickLabel(t)}
          </text>
        ))}
        <text x={width / 2} y={h - 4} textAnchor="middle" fontSize="11" fill={C.axis}>
          estimated effect{unit ? ` (${unit})` : ''}: each dot is one study
        </text>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// p-value trajectories under optional stopping
// ---------------------------------------------------------------------------

export function PPaths({ paths, firstHit, alpha, label, nMax }: { paths: { n: number; p: number }[][]; firstHit: number[]; alpha: number; label: string; nMax: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const h = width < 480 ? 220 : 260;
  const M = { top: 12, right: 14, bottom: 36, left: 48 };
  const x = linearScale([0, nMax], [M.left, width - M.right]);
  const y = logScale([0.001, 1], [h - M.bottom, M.top]);
  const clampP = (p: number) => Math.max(0.001, Math.min(1, p));
  return (
    <div ref={ref} className="w-full">
      <svg width={width} height={h} role="img" aria-label={label} className="block">
        {[0.001, 0.01, 0.05, 0.2, 1].map((t) => (
          <g key={t}>
            <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} stroke={C.grid} />
            <text x={M.left - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill={C.axis}>
              {t}
            </text>
          </g>
        ))}
        <rect x={M.left} y={y(alpha)} width={width - M.left - M.right} height={y(0.001) - y(alpha)} fill={C.type1} opacity={0.08} />
        <line x1={M.left} x2={width - M.right} y1={y(alpha)} y2={y(alpha)} stroke={C.type1Ink} strokeWidth={1.5} />
        {paths.map((path, i) => (
          <path key={i} d={linePath(path.map((pt) => [x(pt.n), y(clampP(pt.p))]))} fill="none" stroke={firstHit[i] >= 0 ? C.type1 : '#94A3B8'} strokeWidth={firstHit[i] >= 0 ? 1.75 : 1.1} opacity={firstHit[i] >= 0 ? 0.9 : 0.6} />
        ))}
        {paths.map((path, i) => (firstHit[i] >= 0 ? <circle key={i} cx={x(path[firstHit[i]].n)} cy={y(clampP(path[firstHit[i]].p))} r={3.5} fill={C.type1Ink} /> : null))}
        {niceTicks(0, nMax, width < 480 ? 4 : 6).map((t) => (
          <text key={t} x={x(t)} y={h - M.bottom + 16} textAnchor="middle" fontSize="11" fill={C.axis}>
            {tickLabel(t)}
          </text>
        ))}
        <line x1={M.left} x2={width - M.right} y1={h - M.bottom} y2={h - M.bottom} stroke={C.axis} />
        <text x={(M.left + width - M.right) / 2} y={h - 4} textAnchor="middle" fontSize="11" fill={C.axis}>
          observations so far (per group)
        </text>
        <text transform={`translate(12,${(M.top + h - M.bottom) / 2}) rotate(-90)`} textAnchor="middle" fontSize="11" fill={C.axis}>
          p-value (log scale)
        </text>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sorted p-values with multiple-testing thresholds
// ---------------------------------------------------------------------------

export function SortedPChart({ tests, alpha, label }: { tests: { p: number; isReal: boolean }[]; alpha: number; label: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const h = width < 480 ? 240 : 280;
  const M = { top: 12, right: 14, bottom: 36, left: 52 };
  const sorted = tests.slice().sort((a, b) => a.p - b.p);
  const m = sorted.length;
  const floor = Math.max(1e-12, Math.min(alpha / m, ...sorted.map((t) => t.p)) * 0.3);
  const x = linearScale([0.5, m + 0.5], [M.left, width - M.right]);
  const y = logScale([floor, 1], [h - M.bottom, M.top]);
  const yTicks = [1, 0.1, 0.01, 1e-3, 1e-4, 1e-5, 1e-6, 1e-8, 1e-10, 1e-12].filter((t) => t >= y.domain[0]);
  return (
    <div ref={ref} className="w-full">
      <svg width={width} height={h} role="img" aria-label={label} className="block">
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} stroke={C.grid} />
            <text x={M.left - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize="10" fill={C.axis}>
              {t >= 0.001 ? t : `1e${Math.round(Math.log10(t))}`}
            </text>
          </g>
        ))}
        <line x1={M.left} x2={width - M.right} y1={y(alpha)} y2={y(alpha)} stroke={C.axis} strokeDasharray="5 4" />
        <text x={width - M.right - 2} y={y(alpha) - 4} textAnchor="end" fontSize="10" fill={C.axis}>
          unadjusted α
        </text>
        <line x1={M.left} x2={width - M.right} y1={y(alpha / m)} y2={y(alpha / m)} stroke={C.type2Ink} strokeDasharray="2 3" strokeWidth={1.5} />
        <text x={width - M.right - 2} y={y(alpha / m) + 12} textAnchor="end" fontSize="10" fill={C.type2Ink}>
          Bonferroni α/m
        </text>
        <path d={linePath(sorted.map((_, i) => [x(i + 1), y(((i + 1) / m) * alpha)]))} fill="none" stroke={C.pvalInk} strokeWidth={1.5} />
        <text x={x(Math.max(1, m * 0.35))} y={y((Math.max(1, m * 0.35) / m) * alpha) + 14} fontSize="10" fill={C.pvalInk}>
          BH line (i/m)·q
        </text>
        {sorted.map((t, i) => (
          <circle key={i} cx={x(i + 1)} cy={y(Math.max(y.domain[0], t.p))} r={Math.max(2.2, Math.min(4.5, 280 / m))} fill={t.isReal ? C.power : 'white'} stroke={t.isReal ? C.powerInk : C.type1Ink} strokeWidth={1.4} />
        ))}
        <line x1={M.left} x2={width - M.right} y1={h - M.bottom} y2={h - M.bottom} stroke={C.axis} />
        <text x={(M.left + width - M.right) / 2} y={h - 6} textAnchor="middle" fontSize="11" fill={C.axis}>
          tests ranked from smallest to largest p-value (rank 1…{m})
        </text>
        <text transform={`translate(12,${(M.top + h - M.bottom) / 2}) rotate(-90)`} textAnchor="middle" fontSize="11" fill={C.axis}>
          p-value (log scale)
        </text>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Equivalence test: intervals vs margins
// ---------------------------------------------------------------------------

export function TostChart({ estimate, ci90, ci95, margin, unit, label }: { estimate: number; ci90: [number, number]; ci95: [number, number]; margin: number; unit: string; label: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const h = 168;
  const M = { top: 16, right: 16, bottom: 34, left: 16 };
  const ext = Math.max(margin * 1.6, Math.abs(ci95[0]) * 1.1, Math.abs(ci95[1]) * 1.1);
  const x = linearScale([-ext, ext], [M.left, width - M.right]);
  const row = (i: number) => M.top + 44 + i * 40;
  return (
    <div ref={ref} className="w-full">
      <svg width={width} height={h} role="img" aria-label={label} className="block">
        <rect x={x(-margin)} y={M.top} width={x(margin) - x(-margin)} height={h - M.top - M.bottom} fill={C.power} opacity={0.12} />
        <line x1={x(-margin)} x2={x(-margin)} y1={M.top} y2={h - M.bottom} stroke={C.powerInk} strokeDasharray="4 3" />
        <line x1={x(margin)} x2={x(margin)} y1={M.top} y2={h - M.bottom} stroke={C.powerInk} strokeDasharray="4 3" />
        <text x={(x(-margin) + x(margin)) / 2} y={M.top + 11} textAnchor="middle" fontSize="11" fill={C.powerInk} fontWeight="600">
          equivalence zone ±{fmt(margin)} {unit}
        </text>
        <line x1={x(0)} x2={x(0)} y1={M.top + 16} y2={h - M.bottom} stroke={C.h0} strokeWidth={1.25} />
        {[
          { ci: ci95, label: '95% CI (difference test)', color: C.type2Ink },
          { ci: ci90, label: '90% CI (TOST, α = 0.05)', color: C.powerInk },
        ].map((r, i) => (
          <g key={i}>
            <line x1={x(r.ci[0])} x2={x(r.ci[1])} y1={row(i)} y2={row(i)} stroke={r.color} strokeWidth={3} />
            <line x1={x(r.ci[0])} x2={x(r.ci[0])} y1={row(i) - 6} y2={row(i) + 6} stroke={r.color} strokeWidth={2} />
            <line x1={x(r.ci[1])} x2={x(r.ci[1])} y1={row(i) - 6} y2={row(i) + 6} stroke={r.color} strokeWidth={2} />
            <circle cx={x(estimate)} cy={row(i)} r={4.5} fill={r.color} />
            <text x={M.left} y={row(i) - 9} fontSize="11" fill={r.color} fontWeight="600">
              {r.label}
            </text>
          </g>
        ))}
        {niceTicks(-ext, ext, width < 480 ? 4 : 8).map((t) => (
          <text key={t} x={x(t)} y={h - M.bottom + 16} textAnchor="middle" fontSize="11" fill={C.axis}>
            {tickLabel(t)}
          </text>
        ))}
        <text x={width / 2} y={h - 3} textAnchor="middle" fontSize="11" fill={C.axis}>
          difference between formulations ({unit})
        </text>
      </svg>
    </div>
  );
}
