import { useState } from 'react';
import { C } from '../../lib/colors';
import { linearScale, linePath, logScale, logTicks, niceTicks, tickLabel, type Scale } from './scale';
import { useWidth } from './useWidth';

export interface Series {
  id: string;
  label: string;
  color: string;
  points: { x: number; y: number }[];
  dashed?: boolean;
  width?: number;
}

export interface RefLine {
  x?: number;
  y?: number;
  label?: string;
  color?: string;
}

interface Props {
  series: Series[];
  label: string;
  xLabel: string;
  yLabel: string;
  xScale?: 'linear' | 'log';
  xDomain?: [number, number];
  yDomain?: [number, number];
  xFormat?: (v: number) => string;
  yFormat?: (v: number) => string;
  /** format for the hover readout (defaults to yFormat) */
  valueFormat?: (v: number) => string;
  refLines?: RefLine[];
  marker?: { x: number; y: number; label?: string; color?: string } | null;
  height?: number;
}

const M = { top: 14, right: 16, bottom: 40, left: 46 };

function interpolate(points: { x: number; y: number }[], x: number): number | null {
  if (points.length === 0) return null;
  if (x <= points[0].x) return points[0].y;
  for (let i = 1; i < points.length; i++) {
    if (points[i].x >= x) {
      const a = points[i - 1];
      const b = points[i];
      const t = (x - a.x) / (b.x - a.x || 1);
      return a.y + t * (b.y - a.y);
    }
  }
  return points[points.length - 1].y;
}

export function LineChart({ series, label, xLabel, yLabel, xScale = 'linear', xDomain, yDomain = [0, 1], xFormat = tickLabel, yFormat = (v) => `${Math.round(v * 100)}%`, valueFormat, refLines = [], marker, height }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hoverX, setHoverX] = useState<number | null>(null);
  const h = height ?? (width < 480 ? 230 : 300);
  const allX = series.flatMap((s) => s.points.map((p) => p.x));
  const dom: [number, number] = xDomain ?? [Math.min(...allX), Math.max(...allX)];
  const x: Scale = xScale === 'log' ? logScale(dom, [M.left, width - M.right]) : linearScale(dom, [M.left, width - M.right]);
  const y = linearScale(yDomain, [h - M.bottom, M.top]);
  const xt = xScale === 'log' ? logTicks(dom[0], dom[1]).filter((_, i, a) => a.length <= 9 || i % 2 === 0) : niceTicks(dom[0], dom[1], width < 480 ? 4 : 7);
  const yt = niceTicks(yDomain[0], yDomain[1], 5);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * width;
    if (px < M.left || px > width - M.right) return setHoverX(null);
    setHoverX(x.invert(px));
  };

  const readout = hoverX !== null ? series.map((s) => ({ s, v: interpolate(s.points, hoverX) })) : [];

  return (
    <figure className="w-full">
      <div ref={ref} className="relative w-full">
        <svg width={width} height={h} role="img" aria-label={label} className="block" onPointerMove={onMove} onPointerLeave={() => setHoverX(null)}>
          {yt.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} stroke={C.grid} />
              <text x={M.left - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill={C.axis}>
                {yFormat(t)}
              </text>
            </g>
          ))}
          {xt.map((t) => (
            <g key={t} transform={`translate(${x(t)},${h - M.bottom})`}>
              <line y2="5" stroke={C.axis} />
              <text y="17" textAnchor="middle" fontSize="11" fill={C.axis}>
                {xFormat(t)}
              </text>
            </g>
          ))}
          <line x1={M.left} x2={width - M.right} y1={h - M.bottom} y2={h - M.bottom} stroke={C.axis} />
          <text x={(M.left + width - M.right) / 2} y={h - 4} textAnchor="middle" fontSize="11" fill={C.axis}>
            {xLabel}
          </text>
          <text transform={`translate(12,${(M.top + h - M.bottom) / 2}) rotate(-90)`} textAnchor="middle" fontSize="11" fill={C.axis}>
            {yLabel}
          </text>
          {refLines.map((r, i) =>
            r.y !== undefined ? (
              <g key={i}>
                <line x1={M.left} x2={width - M.right} y1={y(r.y)} y2={y(r.y)} stroke={r.color ?? C.axis} strokeDasharray="5 4" strokeWidth={1.25} />
                {r.label && (
                  <text x={width - M.right - 4} y={y(r.y) - 4} textAnchor="end" fontSize="11" fill={r.color ?? C.axis}>
                    {r.label}
                  </text>
                )}
              </g>
            ) : r.x !== undefined && r.x >= dom[0] && r.x <= dom[1] ? (
              <g key={i}>
                <line x1={x(r.x)} x2={x(r.x)} y1={M.top} y2={h - M.bottom} stroke={r.color ?? C.axis} strokeDasharray="5 4" strokeWidth={1.25} />
                {r.label && (
                  <text x={x(r.x) + 4} y={M.top + 10} fontSize="11" fill={r.color ?? C.axis}>
                    {r.label}
                  </text>
                )}
              </g>
            ) : null,
          )}
          {series.map((s) => (
            <path key={s.id} d={linePath(s.points.map((p) => [x(p.x), y(Math.max(yDomain[0], Math.min(yDomain[1], p.y)))]))} fill="none" stroke={s.color} strokeWidth={s.width ?? 2.5} strokeDasharray={s.dashed ? '6 4' : undefined} strokeLinejoin="round" />
          ))}
          {marker && marker.x >= dom[0] && marker.x <= dom[1] && (
            <g>
              <circle cx={x(marker.x)} cy={y(marker.y)} r={5.5} fill="white" stroke={marker.color ?? C.text} strokeWidth={2.5} />
              {marker.label && (
                <text x={x(marker.x)} y={y(marker.y) - 10} textAnchor={x(marker.x) > width * 0.7 ? 'end' : 'middle'} fontSize="11" fontWeight="600" fill={marker.color ?? C.text}>
                  {marker.label}
                </text>
              )}
            </g>
          )}
          {hoverX !== null && <line x1={x(hoverX)} x2={x(hoverX)} y1={M.top} y2={h - M.bottom} stroke={C.axis} strokeWidth={1} opacity={0.6} />}
        </svg>
        {hoverX !== null && readout.length > 0 && (
          <div className="pointer-events-none absolute top-1 rounded-md bg-white/95 px-2 py-1 text-xs shadow ring-1 ring-slate-200" style={{ left: Math.min(width - 170, Math.max(M.left, x(hoverX) + 8)) }}>
            <div className="font-medium text-slate-700">
              {xLabel.split(' (')[0]}: {xFormat(hoverX)}
            </div>
            {readout.map(({ s, v }) => (
              <div key={s.id} className="flex items-center gap-1.5 tabular-nums" style={{ color: s.color }}>
                <span className="inline-block h-0.5 w-3" style={{ background: s.color }} /> {s.label}: {v === null ? '—' : (valueFormat ?? yFormat)(v)}
              </div>
            ))}
          </div>
        )}
      </div>
    </figure>
  );
}
