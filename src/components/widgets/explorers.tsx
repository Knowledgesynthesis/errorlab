import { useState } from 'react';
import { C } from '../../lib/colors';
import { fmt, fmtInt, fmtP, fmtPct, fmtSig } from '../../lib/format';
import {
  criticalValues,
  mulberry32,
  normalGenerator,
  normPdf,
  observedPowerFromP,
  rejectionProbability,
  requiredN,
  standardError,
  tost,
  tCdf,
  tPdf,
  tQuantile,
  normQuantile,
  type Alternative,
  type Design,
} from '../../stats';
import { DistributionChart, type DistributionLayers } from '../charts/DistributionChart';
import { LineChart } from '../charts/LineChart';
import { TostChart } from '../charts/plots';
import { linearScale, niceTicks } from '../charts/scale';
import { useWidth } from '../charts/useWidth';
import { Button, Segmented, Slider, Toggle } from '../ui/controls';
import { Stat } from '../ui/layout';
import { DecisionTable } from './DecisionTable';
import { ALPHA_PRESETS } from '../../lib/presets';
import { DesignControls } from './DesignControls';

// ---------------------------------------------------------------------------
// Lesson 2: sampling distribution of the mean
// ---------------------------------------------------------------------------

export function SamplingDemo() {
  const [n, setN] = useState(16);
  const [sigma, setSigma] = useState(10);
  const [means, setMeans] = useState<number[]>([]);
  const [seed, setSeed] = useState(1);
  const mu = 100;
  const se = sigma / Math.sqrt(n);

  const drawMany = (k: number) => {
    const rng = mulberry32(seed);
    const normal = normalGenerator(rng);
    const next: number[] = [];
    for (let s = 0; s < k; s++) {
      let sum = 0;
      for (let i = 0; i < n; i++) sum += mu + sigma * normal();
      next.push(sum / n);
    }
    setSeed((x) => x + 1);
    setMeans((m) => [...m, ...next].slice(-2000));
  };

  const sd = means.length > 1 ? Math.sqrt(means.reduce((s, x) => s + (x - mean(means)) ** 2, 0) / (means.length - 1)) : NaN;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,280px)_1fr]">
      <div className="space-y-4">
        <Slider label="Sample size n" value={n} min={1} max={400} scale="log" round={Math.round} onChange={(v) => { setN(v); setMeans([]); }} format={String} accent="#0072B2" />
        <Slider label="Population SD σ" value={sigma} min={2} max={30} step={1} onChange={(v) => { setSigma(v); setMeans([]); }} format={(v) => `${v} mmHg`} accent="#475569" />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => drawMany(1)}>Draw 1 sample</Button>
          <Button variant="primary" onClick={() => drawMany(200)}>
            Draw 200 samples
          </Button>
          <Button variant="ghost" onClick={() => setMeans([])}>
            Clear
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="SE = σ/√n" value={`${fmt(se, 2)}`} sub="theory" />
          <Stat label="SD of your sample means" value={Number.isFinite(sd) ? fmt(sd, 2) : '—'} sub={`${fmtInt(means.length)} samples`} />
        </div>
      </div>
      <SamplingPlot mu={mu} sigma={sigma} se={se} means={means} />
    </div>
  );
}

function mean(xs: number[]) {
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

function SamplingPlot({ mu, sigma, se, means }: { mu: number; sigma: number; se: number; means: number[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const h = width < 480 ? 230 : 280;
  const M = { top: 16, right: 12, bottom: 36, left: 12 };
  const lo = mu - 3.6 * sigma;
  const hi = mu + 3.6 * sigma;
  const x = linearScale([lo, hi], [M.left, width - M.right]);
  const peak = normPdf(0) / se;
  const y = linearScale([0, peak * 1.1], [h - M.bottom, M.top]);
  const curve = (s: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 300; i++) {
      const v = lo + ((hi - lo) * i) / 300;
      pts.push(`${i ? 'L' : 'M'}${x(v).toFixed(1)},${y(normPdf((v - mu) / s) / s).toFixed(1)}`);
    }
    return pts.join('');
  };
  // histogram of sample means scaled to density
  const bins = 60;
  const bw = (hi - lo) / bins;
  const counts = new Array(bins).fill(0);
  for (const m of means) {
    const b = Math.floor((m - lo) / bw);
    if (b >= 0 && b < bins) counts[b]++;
  }
  return (
    <div ref={ref} className="w-full">
      <svg width={width} height={h} role="img" aria-label={`Population distribution with SD ${sigma} and sampling distribution of the mean with SE ${fmt(se, 2)}; ${means.length} sample means drawn.`} className="block">
        {means.length > 0 &&
          counts.map((c, i) => {
            const dens = c / (means.length * bw);
            return <rect key={i} x={x(lo + i * bw) + 0.5} width={Math.max(0, x(lo + bw) - x(lo) - 1)} y={y(dens)} height={y(0) - y(dens)} fill={C.type2} opacity={0.35} />;
          })}
        <path d={curve(sigma)} fill="none" stroke={C.correct} strokeWidth={2} />
        <path d={curve(se)} fill="none" stroke={C.type2Ink} strokeWidth={2.5} />
        <line x1={M.left} x2={width - M.right} y1={y(0)} y2={y(0)} stroke={C.axis} />
        {niceTicks(lo, hi, width < 480 ? 5 : 9).map((t) => (
          <text key={t} x={x(t)} y={y(0) + 15} textAnchor="middle" fontSize="11" fill={C.axis}>
            {t}
          </text>
        ))}
        <text x={width / 2} y={h - 3} textAnchor="middle" fontSize="11" fill={C.axis}>
          systolic blood pressure (mmHg)
        </text>
        <text x={x(mu + 1.3 * sigma)} y={y(normPdf(1.3) / sigma) - 6} fontSize="11" fill={C.correctInk}>
          individual patients (σ = {sigma})
        </text>
        <text x={x(mu + 0.7 * se) + 6} y={y(peak * 0.85)} fontSize="11" fill={C.type2Ink} fontWeight="600">
          sample means (SE = {fmt(se, 2)})
        </text>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lesson 2: t vs normal
// ---------------------------------------------------------------------------

export function TvsZ() {
  const [df, setDf] = useState(4);
  const xs = Array.from({ length: 161 }, (_, i) => -5 + i / 16);
  const series = [
    { id: 'z', label: 'normal (z)', color: C.h0, points: xs.map((x) => ({ x, y: normPdf(x) })) },
    { id: 't', label: `t, df = ${df}`, color: C.h1, points: xs.map((x) => ({ x, y: tPdf(x, df) })), dashed: true },
  ];
  const zc = -normQuantile(0.025);
  const tc = tQuantile(0.975, df);
  return (
    <div className="space-y-3">
      <Slider label="Degrees of freedom" value={df} min={1} max={200} scale="log" round={Math.round} onChange={setDf} format={String} accent="#B45309" hint="One-sample: df = n − 1. Two groups (pooled): df = 2n − 2." />
      <LineChart series={series} label={`Normal and t densities with ${df} degrees of freedom`} xLabel="statistic" yLabel="density" yDomain={[0, 0.42]} yFormat={(v) => v.toFixed(1)} valueFormat={(v) => v.toFixed(3)} refLines={[{ x: tc, color: C.h1, label: `t* = ${fmt(tc)}` }, { x: zc, color: C.h0 }]} height={220} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="z* (two-sided .05)" value={fmt(zc, 3)} />
        <Stat label={`t* with df = ${df}`} value={fmt(tc, 3)} color={C.h1} />
        <Stat label="P(|t| > 1.96)" value={fmtPct(2 * tCdf(-1.96, df), 1)} sub="Type I rate if you wrongly used z" color={C.type1Ink} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lesson 3: α and the rejection region
// ---------------------------------------------------------------------------

export function AlphaExplorer() {
  const [d, setD] = useState<Design>({ design: 'one-sample', test: 'z', alternative: 'two-sided', alpha: 0.05, n: 25, delta: 0, sigma: 1 });
  const crit = criticalValues(d);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Segmented<Alternative>
          label="Alternative hypothesis"
          value={d.alternative}
          onChange={(alternative) => setD({ ...d, alternative })}
          options={[
            { value: 'two-sided', label: 'two-sided' },
            { value: 'greater', label: 'greater' },
            { value: 'less', label: 'less' },
          ]}
        />
        <Slider label="α" value={d.alpha} min={0.0005} max={0.3} scale="log" round={(v) => Number(v.toPrecision(2))} onChange={(alpha) => setD({ ...d, alpha })} format={(v) => fmtSig(v, 2)} accent="#D55E00" presets={ALPHA_PRESETS} />
      </div>
      <DistributionChart design={d} showH1={false} onAlphaChange={(alpha) => setD({ ...d, alpha })} label="Null distribution with rejection region" />
      <p className="text-sm text-slate-700">
        Reject H₀ when the statistic is {crit.lower !== null && <>≤ <strong className="font-mono">{fmt(crit.lower, 3)}</strong></>}
        {crit.lower !== null && crit.upper !== null && ' or '}
        {crit.upper !== null && <>≥ <strong className="font-mono">{fmt(crit.upper, 3)}</strong></>}. If H₀ is true, that happens in {fmtPct(d.alpha)} of studies — no more, no less.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lesson 4: power explorer
// ---------------------------------------------------------------------------

export function PowerExplorer({ initial }: { initial?: Partial<Design> }) {
  const [d, setD] = useState<Design>({ design: 'two-sample', test: 't', alternative: 'two-sided', alpha: 0.05, n: 50, delta: 0.3, sigma: 1, ...initial });
  const [layers, setLayers] = useState<DistributionLayers>({ alpha: true, beta: true, power: true });
  const power = rejectionProbability(d);
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,290px)_1fr]">
      <DesignControls value={d} onChange={setD} show={['alternative', 'alpha', 'n', 'delta', 'sigma']} nMax={2000} />
      <div className="space-y-3">
        <DistributionChart design={d} layers={layers} onAlphaChange={(alpha) => setD({ ...d, alpha })} label="Null and alternative distributions with α, β and power shaded" />
        <div className="flex flex-wrap gap-4">
          <Toggle label="α" checked={!!layers.alpha} onChange={(v) => setLayers({ ...layers, alpha: v })} />
          <Toggle label="β" checked={!!layers.beta} onChange={(v) => setLayers({ ...layers, beta: v })} />
          <Toggle label="power" checked={!!layers.power} onChange={(v) => setLayers({ ...layers, power: v })} />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Power = 1 − β" value={fmtPct(power)} color={C.powerInk} big />
          <Stat label="β (miss rate)" value={fmtPct(1 - power)} color={C.type2Ink} big />
          <Stat label="SE" value={fmtSig(standardError(d), 3)} />
          <Stat label="λ = δ / SE" value={fmt(d.delta / standardError(d))} sub="how far H₁ sits from H₀" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lesson 6: false positive risk
// ---------------------------------------------------------------------------

export function FprExplorer() {
  const [prior, setPrior] = useState(0.1);
  const [power, setPower] = useState(0.8);
  const [alpha, setAlpha] = useState(0.05);
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,280px)_1fr]">
      <div className="space-y-4">
        <Slider label="Prior: share of tested hypotheses that are true" value={prior} min={0.01} max={0.9} step={0.01} onChange={setPrior} format={(v) => fmtPct(v, 0)} accent="#B45309" hint="Unknown in practice. Plausibly high for confirmatory tests of well-supported treatments, very low for exploratory screens." />
        <Slider label="Power" value={power} min={0.05} max={0.99} step={0.01} onChange={setPower} format={(v) => fmtPct(v, 0)} accent="#009E73" />
        <Slider label="α" value={alpha} min={0.001} max={0.1} scale="log" round={(v) => Number(v.toPrecision(2))} onChange={setAlpha} format={(v) => fmtSig(v, 2)} accent="#D55E00" presets={ALPHA_PRESETS.slice(1)} />
      </div>
      <DecisionTable alpha={alpha} power={power} prior={prior} cohort={1000} showIcons />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lesson 9: equivalence test
// ---------------------------------------------------------------------------

export interface TostSetup {
  estimate: number;
  sd: number;
  n: number;
  margin: number;
  units: string;
  /** two independent groups, or paired / crossover (SE = sd/√n) */
  design: 'two-sample' | 'paired';
  /** outcome is a log ratio: also show results as % ratios */
  logRatio?: boolean;
  ranges: { estimate: [number, number, number]; sd: [number, number, number]; margin: [number, number, number] };
}

const TOST_BP: TostSetup = { estimate: 1.2, sd: 8, n: 40, margin: 4, units: 'mmHg', design: 'two-sample', ranges: { estimate: [-8, 8, 0.1], sd: [2, 20, 0.5], margin: [0.5, 10, 0.5] } };

export function TostExplorer({ setup = TOST_BP }: { setup?: TostSetup }) {
  const [estimate, setEstimate] = useState(setup.estimate);
  const [sd, setSd] = useState(setup.sd);
  const [n, setN] = useState(setup.n);
  const [margin, setMargin] = useState(setup.margin);
  const paired = setup.design === 'paired';
  const se = paired ? sd / Math.sqrt(n) : sd * Math.sqrt(2 / n);
  const df = paired ? n - 1 : 2 * n - 2;
  const r = tost(estimate, se, df, -margin, margin, 0.05);
  const digits = setup.ranges.estimate[2] < 0.1 ? 3 : 1;
  const show = (v: number) => (setup.logRatio ? `${(Math.exp(v) * 100).toFixed(1)}%` : `${fmt(v, digits)} ${setup.units}`);
  const verdict = r.different ? (r.equivalent ? 'Significant difference, but too small to matter: both tests reject.' : 'Significant difference that may matter.') : r.equivalent ? 'No significant difference AND equivalence shown: the effect is within the margin.' : 'Inconclusive: no significant difference, but equivalence not shown either. Absence of evidence is not evidence of absence.';
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,280px)_1fr]">
      <div className="space-y-4">
        <Slider label={setup.logRatio ? 'Observed log ratio (test/reference)' : 'Observed difference'} value={estimate} min={setup.ranges.estimate[0]} max={setup.ranges.estimate[1]} step={setup.ranges.estimate[2]} onChange={(v) => setEstimate(Number(v.toFixed(digits)))} format={(v) => (setup.logRatio ? `${fmt(v, 3)} (ratio ${show(v)})` : show(v))} accent="#B45309" />
        <Slider label={paired ? 'SD of within-subject differences' : 'SD of observations'} value={sd} min={setup.ranges.sd[0]} max={setup.ranges.sd[1]} step={setup.ranges.sd[2]} onChange={setSd} format={(v) => `${fmt(v, digits === 3 ? 2 : 1)}${setup.logRatio ? '' : ` ${setup.units}`}`} accent="#475569" />
        <Slider label={paired ? 'n (subjects, crossover)' : 'n per group'} value={n} min={4} max={1000} scale="log" round={Math.round} onChange={setN} format={String} accent="#0072B2" />
        <Slider label="Equivalence margin ±Δ" value={margin} min={setup.ranges.margin[0]} max={setup.ranges.margin[1]} step={setup.ranges.margin[2]} onChange={setMargin} format={(v) => (setup.logRatio ? `±${fmt(v, 3)} (${(Math.exp(-v) * 100).toFixed(0)}–${(Math.exp(v) * 100).toFixed(0)}%)` : `±${v} ${setup.units}`)} accent="#009E73" hint="Fixed before the study: the largest difference you would consider unimportant." />
      </div>
      <div className="space-y-3">
        <TostChart estimate={estimate} ci90={r.ciEquivalence} ci95={r.ciDifference} margin={margin} unit={setup.logRatio ? 'log ratio' : setup.units} label="Confidence intervals compared with the equivalence margins" />
        {setup.logRatio && (
          <p className="text-sm text-slate-700">
            Ratio {show(estimate)}, 90% CI {show(r.ciEquivalence[0])} to {show(r.ciEquivalence[1])}; required: within {(Math.exp(-margin) * 100).toFixed(0)}–{(Math.exp(margin) * 100).toFixed(0)}%.
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Difference test (H₀: δ = 0)" value={`p = ${fmtP(r.pDifference)}`} sub={r.different ? 'significant difference' : 'not significant'} color={r.different ? C.type1Ink : C.correctInk} />
          <Stat label="Equivalence test (H₀: |δ| ≥ Δ)" value={`p = ${fmtP(r.p)}`} sub={r.equivalent ? 'equivalence shown' : 'equivalence not shown'} color={r.equivalent ? C.powerInk : C.correctInk} />
        </div>
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 ring-1 ring-slate-200">{verdict}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lesson 9: observed power is just the p-value in disguise
// ---------------------------------------------------------------------------

export function ObservedPowerChart() {
  const pts = Array.from({ length: 200 }, (_, i) => {
    const p = 0.0005 + (i / 199) * 0.9995;
    return { x: p, y: observedPowerFromP(p) };
  });
  return <LineChart series={[{ id: 'op', label: 'observed power', color: C.type1Ink, points: pts }]} label="Observed power as a function of the p-value" xLabel="p-value of the completed study" yLabel="“observed power”" refLines={[{ x: 0.05, color: C.axis, label: 'p = 0.05' }, { y: 0.5, color: C.axis, label: '50%' }]} marker={{ x: 0.05, y: observedPowerFromP(0.05), label: '≈ 50%', color: C.type1Ink }} valueFormat={(v) => fmtPct(v)} height={220} />;
}

// ---------------------------------------------------------------------------
// Lesson 9: compact sample size calculator
// ---------------------------------------------------------------------------

export function SampleSizeMini() {
  const [d, setD] = useState<Design>({ design: 'two-sample', test: 't', alternative: 'two-sided', alpha: 0.05, n: 50, delta: 5, sigma: 15 });
  const [target, setTarget] = useState(0.9);
  const [dropout, setDropout] = useState(0.1);
  const n = requiredN(d, target);
  const enrol = n === null ? null : Math.ceil(n / (1 - dropout));
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,290px)_1fr]">
      <div className="space-y-4">
        <DesignControls value={d} onChange={setD} show={['alpha', 'delta', 'sigma']} units="mmHg" scale={10} />
        <Slider label="Target power" value={target} min={0.5} max={0.99} step={0.01} onChange={setTarget} format={(v) => fmtPct(v, 0)} accent="#009E73" />
        <Slider label="Expected dropout" value={dropout} min={0} max={0.5} step={0.01} onChange={setDropout} format={(v) => fmtPct(v, 0)} accent="#475569" />
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Stat big label="Analysable n per group" value={n === null ? '—' : fmtInt(n)} color={C.powerInk} sub={n === null ? 'δ = 0: no n is enough' : `exact power ${fmtPct(rejectionProbability({ ...d, n }))}`} />
          <Stat big label="Enrol per group" value={enrol === null ? '—' : fmtInt(enrol)} sub={`inflated for ${fmtPct(dropout, 0)} dropout: n ÷ (1 − dropout)`} />
        </div>
        {n !== null && (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-800 ring-1 ring-slate-200">
            “A sample of {fmtInt(n)} participants per group ({fmtInt(2 * n)} total; {fmtInt(2 * (enrol ?? n))} to be enrolled allowing for {fmtPct(dropout, 0)} dropout) provides {fmtPct(target, 0)} power to detect a difference of {fmt(Math.abs(d.delta), 1)} mmHg (SD {fmt(d.sigma, 1)}; d = {fmt(Math.abs(d.delta / d.sigma))}) with a two-sided t test at α = {d.alpha}.”
          </p>
        )}
      </div>
    </div>
  );
}
