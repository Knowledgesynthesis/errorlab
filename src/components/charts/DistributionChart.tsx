import { useMemo, useRef, useState } from 'react';
import { criticalValues, degreesOfFreedom, noncentrality, nullCdf, nullSf, rejectionProbability, type Design } from '../../stats/design';
import { nctPdf, normPdf, tPdf } from '../../stats/distributions';
import { C } from '../../lib/colors';
import { fmt, fmtP, fmtPct } from '../../lib/format';
import { Swatch } from '../ui/layout';
import { areaPath, linearScale, linePath, niceTicks, tickLabel } from './scale';
import { useWidth } from './useWidth';

export interface DistributionLayers {
  alpha?: boolean;
  beta?: boolean;
  power?: boolean;
}

interface Props {
  design: Design;
  showH1?: boolean;
  layers?: DistributionLayers;
  /** observed test statistic, drawn as a marker */
  observed?: number | null;
  /** shade the p-value tail(s) beyond the observed statistic */
  showPTail?: boolean;
  /** enables dragging the critical value(s) to set α */
  onAlphaChange?: (alpha: number) => void;
  height?: number;
  label: string;
  /** hide the text legend under the chart */
  compactLegend?: boolean;
}

const M = { top: 26, right: 12, bottom: 34, left: 12 };

export function DistributionChart({ design, showH1 = true, layers = { alpha: true, beta: true, power: true }, observed = null, showPTail = false, onAlphaChange, height, label, compactLegend }: Props) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  const h = height ?? (width < 480 ? 220 : 290);

  const df = degreesOfFreedom(design);
  const lambda = noncentrality(design);
  const crit = criticalValues(design);
  const power = rejectionProbability(design);

  const geom = useMemo(() => {
    const finiteDf = Number.isFinite(df);
    const h0 = (v: number) => (finiteDf ? tPdf(v, df) : normPdf(v));
    const h1 = (v: number) => (finiteDf ? nctPdf(v, df, lambda) : normPdf(v - lambda));
    const spread = finiteDf && df < 5 ? 5.5 : 4.2;
    let lo = Math.min(-spread, showH1 ? lambda - 4.2 : -spread);
    let hi = Math.max(spread, showH1 ? lambda + 4.2 : spread);
    if (observed !== null && Number.isFinite(observed)) {
      lo = Math.min(lo, observed - 0.8);
      hi = Math.max(hi, observed + 0.8);
    }
    lo = Math.max(lo, -40);
    hi = Math.min(hi, 40);
    const x = linearScale([lo, hi], [M.left, width - M.right]);
    const N = 320;
    const sample = (a: number, b: number, f: (v: number) => number): [number, number][] => {
      if (!(b > a)) return [];
      const k = Math.max(2, Math.ceil((N * (b - a)) / (hi - lo)));
      const pts: [number, number][] = [];
      for (let i = 0; i <= k; i++) {
        const v = a + ((b - a) * i) / k;
        pts.push([v, f(v)]);
      }
      return pts;
    };
    const h0Pts = sample(lo, hi, h0);
    const h1Pts = showH1 ? sample(lo, hi, h1) : [];
    const yMax = Math.max(...h0Pts.map((p) => p[1]), ...(showH1 ? h1Pts.map((p) => p[1]) : [0])) * 1.12;
    const y = linearScale([0, yMax], [h - M.bottom, M.top]);
    const toPx = (pts: [number, number][]) => pts.map(([a, b]) => [x(a), y(b)] as [number, number]);
    const lower = crit.lower !== null ? Math.max(lo, crit.lower) : null;
    const upper = crit.upper !== null ? Math.min(hi, crit.upper) : null;
    const accLo = lower ?? lo;
    const accHi = upper ?? hi;
    const regions = {
      alphaLo: lower !== null ? areaPath(toPx(sample(lo, lower, h0)), y(0)) : '',
      alphaHi: upper !== null ? areaPath(toPx(sample(upper, hi, h0)), y(0)) : '',
      powerLo: showH1 && lower !== null ? areaPath(toPx(sample(lo, lower, h1)), y(0)) : '',
      powerHi: showH1 && upper !== null ? areaPath(toPx(sample(upper, hi, h1)), y(0)) : '',
      beta: showH1 ? areaPath(toPx(sample(accLo, accHi, h1)), y(0)) : '',
    };
    let pTail = '';
    if (showPTail && observed !== null && Number.isFinite(observed)) {
      const o = Math.max(lo, Math.min(hi, observed));
      const ao = Math.min(Math.abs(observed), hi);
      if (design.alternative === 'greater') pTail = areaPath(toPx(sample(o, hi, h0)), y(0));
      else if (design.alternative === 'less') pTail = areaPath(toPx(sample(lo, o, h0)), y(0));
      else pTail = areaPath(toPx(sample(ao, hi, h0)), y(0)) + areaPath(toPx(sample(lo, Math.max(lo, -Math.abs(observed)), h0)), y(0));
    }
    const h0Peak = h0Pts.reduce((m, p) => (p[1] > m[1] ? p : m), h0Pts[0]);
    const h1Peak = showH1 ? h1Pts.reduce((m, p) => (p[1] > m[1] ? p : m), h1Pts[0]) : null;
    return { x, y, lo, hi, h0Path: linePath(toPx(h0Pts)), h1Path: linePath(toPx(h1Pts)), regions, pTail, h0Peak, h1Peak };
  }, [width, h, df, lambda, crit.lower, crit.upper, observed, showPTail, showH1, design.alternative]);

  const { x, y } = geom;

  const alphaFromX = (v: number): number => {
    let a: number;
    if (design.alternative === 'two-sided') a = 2 * nullSf(Math.abs(v), df);
    else if (design.alternative === 'greater') a = nullSf(v, df);
    else a = nullCdf(v, df);
    a = Math.min(0.5, Math.max(0.0005, a));
    return Number(a.toPrecision(2));
  };

  const onPointer = (e: React.PointerEvent) => {
    if (!onAlphaChange || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * width;
    onAlphaChange(alphaFromX(x.invert(px)));
  };

  const critLines = [crit.lower, crit.upper].filter((c): c is number => c !== null);
  const ticks = niceTicks(geom.lo, geom.hi, width < 480 ? 5 : 9);
  const pObs = observed !== null && Number.isFinite(observed) ? observedP(observed, design, df) : null;
  const statName = design.test === 't' ? 't' : 'z';
  const h1OffChart = showH1 && Math.abs(lambda) > 36;

  const desc = `Null distribution of the ${statName} statistic${showH1 ? ` and the alternative centred at ${fmt(lambda)}` : ''}. Critical value${critLines.length > 1 ? 's' : ''} ${critLines.map((c) => fmt(c)).join(' and ')}. α = ${fmtPct(design.alpha)}${showH1 ? `, power = ${fmtPct(power)}, β = ${fmtPct(1 - power)}` : ''}${pObs !== null ? `. Observed ${statName} = ${fmt(observed!)}, p = ${fmtP(pObs)}` : ''}.`;

  return (
    <figure className="w-full">
      <div ref={wrapRef} className="w-full">
        <svg
          ref={svgRef}
          width={width}
          height={h}
          role="img"
          aria-label={`${label}. ${desc}`}
          className={`block select-none ${dragging ? 'cursor-ew-resize' : ''}`}
          style={{ touchAction: onAlphaChange ? 'pan-y' : undefined }}
          onPointerMove={(e) => dragging && onPointer(e)}
          onPointerUp={() => setDragging(false)}
          onPointerLeave={() => setDragging(false)}
        >
          {/* axis */}
          <line x1={M.left} x2={width - M.right} y1={y(0)} y2={y(0)} stroke={C.axis} />
          {ticks.map((t) => (
            <g key={t} transform={`translate(${x(t)},${y(0)})`}>
              <line y2="5" stroke={C.axis} />
              <text y="17" textAnchor="middle" fontSize="11" fill={C.axis}>
                {tickLabel(t)}
              </text>
            </g>
          ))}
          <text x={width / 2} y={h - 3} textAnchor="middle" fontSize="11" fill={C.axis}>
            test statistic ({statName}) — distance from the null in standard errors
          </text>

          {/* shaded regions */}
          {showH1 && layers.beta && <path d={geom.regions.beta} fill={C.type2} opacity={0.22} />}
          {showH1 && layers.power && (
            <>
              <path d={geom.regions.powerLo} fill={C.power} opacity={0.3} />
              <path d={geom.regions.powerHi} fill={C.power} opacity={0.3} />
            </>
          )}
          {layers.alpha && (
            <>
              <path d={geom.regions.alphaLo} fill={C.type1} opacity={0.55} />
              <path d={geom.regions.alphaHi} fill={C.type1} opacity={0.55} />
            </>
          )}
          {geom.pTail && <path d={geom.pTail} fill={C.pval} opacity={0.55} stroke={C.pvalInk} strokeWidth={0.75} />}

          {/* curves */}
          <path d={geom.h0Path} fill="none" stroke={C.h0} strokeWidth={2.25} />
          {showH1 && <path d={geom.h1Path} fill="none" stroke={C.h1} strokeWidth={2.25} strokeDasharray="6 4" />}
          <text x={x(geom.h0Peak[0])} y={y(geom.h0Peak[1]) - 6} textAnchor="middle" fontSize="12" fontWeight="600" fill={C.h0}>
            H₀
          </text>
          {geom.h1Peak && !h1OffChart && Math.abs(geom.h1Peak[0] - geom.h0Peak[0]) > 0.6 && (
            <text x={x(geom.h1Peak[0])} y={y(geom.h1Peak[1]) - 6} textAnchor="middle" fontSize="12" fontWeight="600" fill={C.h1}>
              H₁
            </text>
          )}

          {/* critical values */}
          {critLines.map((c, i) => {
            const cx = x(Math.max(geom.lo, Math.min(geom.hi, c)));
            return (
              <g key={i}>
                <line x1={cx} x2={cx} y1={M.top - 6} y2={y(0)} stroke={C.type1Ink} strokeWidth={1.5} strokeDasharray="4 3" />
                <text x={cx} y={M.top - 10} textAnchor={i === 0 && critLines.length > 1 ? 'end' : 'start'} dx={i === 0 && critLines.length > 1 ? -4 : 4} fontSize="11" fill={C.type1Ink} fontWeight="600">
                  {fmt(c)}
                </text>
                {onAlphaChange && (
                  <g
                    style={{ cursor: 'ew-resize' }}
                    onPointerDown={(e) => {
                      (e.target as Element).setPointerCapture?.(e.pointerId);
                      setDragging(true);
                    }}
                    aria-hidden
                  >
                    <line x1={cx} x2={cx} y1={M.top - 6} y2={y(0)} stroke="transparent" strokeWidth={22} />
                    <circle cx={cx} cy={y(0) - 14} r={8} fill="white" stroke={C.type1Ink} strokeWidth={2} />
                    <path d={`M${cx - 3},${y(0) - 14}h6M${cx - 3},${y(0) - 14}l2,-2M${cx - 3},${y(0) - 14}l2,2M${cx + 3},${y(0) - 14}l-2,-2M${cx + 3},${y(0) - 14}l-2,2`} stroke={C.type1Ink} strokeWidth={1.2} fill="none" />
                  </g>
                )}
              </g>
            );
          })}

          {/* observed statistic */}
          {observed !== null && Number.isFinite(observed) && (
            <g>
              <line x1={x(Math.max(geom.lo, Math.min(geom.hi, observed)))} x2={x(Math.max(geom.lo, Math.min(geom.hi, observed)))} y1={M.top} y2={y(0)} stroke={C.pvalInk} strokeWidth={2.5} />
              <circle cx={x(Math.max(geom.lo, Math.min(geom.hi, observed)))} cy={y(0)} r={4.5} fill={C.pvalInk} />
              <text x={x(Math.max(geom.lo, Math.min(geom.hi, observed)))} y={M.top + 10} dx={observed > (geom.lo + geom.hi) / 2 ? -5 : 5} textAnchor={observed > (geom.lo + geom.hi) / 2 ? 'end' : 'start'} fontSize="11" fontWeight="600" fill={C.pvalInk}>
                observed {statName} = {fmt(observed)}
              </text>
            </g>
          )}
          {h1OffChart && (
            <text x={width - M.right} y={M.top + 12} textAnchor="end" fontSize="11" fill={C.h1}>
              H₁ is centred at {fmt(lambda, 1)} → off the chart (power ≈ 100%)
            </text>
          )}
        </svg>
      </div>
      {!compactLegend && (
        <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
          <Swatch line color={C.h0} label={<>H₀ curve: where {statName} lands if there is no effect</>} />
          {showH1 && <Swatch line dashed color={C.h1} label={<>H₁ curve: where {statName} lands if the true effect is δ (centred at λ = {fmt(lambda)})</>} />}
          {layers.alpha && <Swatch color={C.type1} label={<>α = {fmtPct(design.alpha)} (Type I)</>} />}
          {showH1 && layers.beta && <Swatch color={C.type2} label={<>β = {fmtPct(1 - power)} (Type II)</>} />}
          {showH1 && layers.power && <Swatch color={C.power} label={<>power = {fmtPct(power)}</>} />}
          {pObs !== null && showPTail && <Swatch color={C.pval} label={<>p = {fmtP(pObs)} (area beyond the observed {statName})</>} />}
          {onAlphaChange && <span className="text-xs text-slate-500">Drag a critical-value handle to change α.</span>}
        </figcaption>
      )}
    </figure>
  );
}

function observedP(stat: number, d: Design, df: number): number {
  if (d.alternative === 'greater') return nullSf(stat, df);
  if (d.alternative === 'less') return nullCdf(stat, df);
  return Math.min(1, 2 * nullSf(Math.abs(stat), df));
}
