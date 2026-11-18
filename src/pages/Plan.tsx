import { useMemo, useState } from 'react';
import { C, SERIES } from '../lib/colors';
import { fmt, fmtInt, fmtPct, fmtSig } from '../lib/format';
import { approximateN, minimumDetectableEffect, rejectionProbability, requiredN, type Design } from '../stats/design';
import { LineChart, type Series } from '../components/charts/LineChart';
import { Button, Segmented, Slider } from '../components/ui/controls';
import { Callout, Card, Stat } from '../components/ui/layout';
import { Cite } from '../components/ui/Cite';
import { DesignControls } from '../components/widgets/DesignControls';

type Axis = 'n' | 'effect';

interface Saved {
  id: number;
  label: string;
  d: Design;
}

function curveVsN(d: Design, nMax: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const seen = new Set<number>();
  for (let i = 0; i <= 90; i++) {
    const n = Math.max(2, Math.round(2 * Math.pow(nMax / 2, i / 90)));
    if (seen.has(n)) continue;
    seen.add(n);
    pts.push({ x: n, y: rejectionProbability({ ...d, n }) });
  }
  return pts;
}

function curveVsEffect(d: Design, dMax: number): { x: number; y: number }[] {
  const sign = d.alternative === 'less' ? -1 : 1;
  return Array.from({ length: 81 }, (_, i) => {
    const dd = (dMax * i) / 80;
    return { x: dd, y: rejectionProbability(d, sign * dd * d.sigma) };
  });
}

export default function Plan() {
  const [d, setD] = useState<Design>({ design: 'two-sample', test: 't', alternative: 'two-sided', alpha: 0.05, n: 64, delta: 0.5, sigma: 1 });
  const [units, setUnits] = useState('');
  const [target, setTarget] = useState(0.8);
  const [dropout, setDropout] = useState(0.1);
  const [axis, setAxis] = useState<Axis>('n');
  const [saved, setSaved] = useState<Saved[]>([]);
  const [copied, setCopied] = useState(false);

  const nReq = requiredN(d, target);
  const nApprox = d.delta === 0 ? null : Math.ceil(approximateN(d, target));
  const enrol = nReq === null ? null : Math.ceil(nReq / (1 - dropout));
  const powerNow = rejectionProbability(d);
  const mde = minimumDetectableEffect(d, target);
  const groups = d.design === 'two-sample' ? 2 : 1;
  const u = units ? ` ${units}` : '';

  const nMax = Math.max(200, (nReq ?? d.n) * 4, d.n * 2);
  const dMax = Math.max(1.2, Math.abs(d.delta / d.sigma) * 2, (Math.abs(mde) / d.sigma) * 1.6);

  const series: Series[] = useMemo(() => {
    const make = (x: Design, label: string, color: string, dashed?: boolean, id = label): Series => ({ id, label, color, dashed, points: axis === 'n' ? curveVsN(x, nMax) : curveVsEffect(x, dMax) });
    return [make(d, 'current', C.powerInk), ...saved.map((s, i) => make(s.d, s.label, SERIES[(i + 1) % SERIES.length], true, String(s.id)))];
  }, [d, saved, axis, nMax, dMax]);

  const sentence =
    nReq === null
      ? ''
      : `A sample size of ${fmtInt(nReq)}${groups === 2 ? ' per group' : ''} (${fmtInt(nReq * groups)} in total; ${fmtInt((enrol ?? nReq) * groups)} to be enrolled allowing for ${fmtPct(dropout, 0)} attrition) provides ${fmtPct(target, 0)} power to detect a ${d.design === 'two-sample' ? 'difference between groups' : 'mean difference'} of ${fmtSig(Math.abs(d.delta), 3)}${u} (SD ${fmtSig(d.sigma, 3)}${u}; standardised effect d = ${fmt(Math.abs(d.delta / d.sigma))}) using a ${d.alternative === 'two-sided' ? 'two-sided' : 'one-sided'} ${d.test === 't' ? (d.design === 'two-sample' ? 'two-sample t test' : 'one-sample/paired t test') : 'z test'} at α = ${d.alpha}. [State why this effect size matters and where the SD comes from.]`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sentence);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('Copy:', sentence);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sample size & power planner</h1>
      <p className="mt-1 max-w-3xl text-slate-600">
        Exact power for t tests (noncentral t) and z tests, the sample size for a target power, and the smallest effect a given n can detect. Plan from the smallest effect that matters, not the one you hope for <Cite k="lakens2022" />.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div className="space-y-6">
          <Card title="Study design">
            <DesignControls value={d} onChange={setD} show={['design', 'test', 'alternative', 'alpha']} />
          </Card>
          <Card title="Effect and noise">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-800">
                Units (optional)
                <input value={units} onChange={(e) => setUnits(e.target.value.slice(0, 12))} placeholder="e.g. mmHg" className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </label>
              <Slider label="Effect to detect δ" value={d.delta} min={-3 * d.sigma} max={3 * d.sigma} step={Number((d.sigma / 100).toPrecision(1))} onChange={(delta) => setD({ ...d, delta: Number(delta.toPrecision(4)) })} format={(v) => `${fmtSig(v, 3)}${u}`} editable hint={<>Cohen’s d = {fmt(d.delta / d.sigma)}. Use the smallest effect worth detecting.</>} />
              <Slider label="SD σ" value={d.sigma} min={0.01} max={1000} scale="log" round={(v) => Number(v.toPrecision(3))} onChange={(sigma) => setD({ ...d, sigma: Math.max(0.01, sigma) })} format={(v) => `${fmtSig(v, 3)}${u}`} editable hint="From prior studies or a pilot; for paired designs, the SD of the differences." />
              <Slider label="Target power" value={target} min={0.5} max={0.99} step={0.01} onChange={setTarget} format={(v) => fmtPct(v, 0)} accent="#009E73" />
              <Slider label="Expected attrition" value={dropout} min={0} max={0.6} step={0.01} onChange={setDropout} format={(v) => fmtPct(v, 0)} accent="#475569" />
              <Slider label={d.design === 'two-sample' ? 'Feasible n per group' : 'Feasible n'} value={d.n} min={2} max={100000} scale="log" round={Math.round} onChange={(n) => setD({ ...d, n })} format={(v) => v.toLocaleString('en-US')} editable accent="#0072B2" hint="Used for the power and detectable-effect readouts." />
            </div>
          </Card>
        </div>
        <div className="min-w-0 space-y-6">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Stat big label={`Required n${groups === 2 ? ' per group' : ''}`} value={nReq === null ? '—' : fmtInt(nReq)} color={C.powerInk} sub={nReq === null ? (d.delta === 0 ? 'δ = 0' : 'not reachable') : `exact; normal approx. ${fmtInt(nApprox ?? 0)}`} />
            <Stat big label={`Enrol${groups === 2 ? ' per group' : ''}`} value={enrol === null ? '—' : fmtInt(enrol)} sub={`n ÷ (1 − ${fmtPct(dropout, 0)})`} />
            <Stat big label={`Power at n = ${fmtInt(d.n)}`} value={fmtPct(powerNow)} color={powerNow >= target ? C.powerInk : C.type1Ink} />
            <Stat big label={`Detectable at n = ${fmtInt(d.n)}`} value={Number.isFinite(mde) ? `${fmtSig(mde, 3)}${u}` : '—'} sub={Number.isFinite(mde) ? `d = ${fmt(mde / d.sigma)} at ${fmtPct(target, 0)} power` : undefined} />
          </div>
          <Card
            title={axis === 'n' ? 'Power vs sample size' : 'Power vs effect size'}
            actions={
              <div className="w-32">
                <Segmented
                  size="sm"
                  label={<span className="sr-only">x-axis</span>}
                  value={axis}
                  onChange={setAxis}
                  options={[
                    { value: 'n', label: 'vs n' },
                    { value: 'effect', label: 'vs d' },
                  ]}
                />
              </div>
            }
          >
            <LineChart
              series={series}
              label={axis === 'n' ? 'Power as a function of sample size' : 'Power as a function of standardised effect size'}
              xLabel={axis === 'n' ? (groups === 2 ? 'n per group (log scale)' : 'n (log scale)') : 'standardised effect d = δ/σ'}
              yLabel="power"
              xScale={axis === 'n' ? 'log' : 'linear'}
              xDomain={axis === 'n' ? [2, nMax] : [0, dMax]}
              valueFormat={(v) => fmtPct(v)}
              xFormat={axis === 'n' ? (v) => (v >= 1000 ? `${v / 1000}k` : String(v)) : (v) => fmt(v, 2)}
              refLines={[{ y: target, color: C.powerInk, label: `target ${fmtPct(target, 0)}` }, { y: d.alpha, color: C.type1Ink, label: 'α' }]}
              marker={axis === 'n' ? (nReq !== null ? { x: nReq, y: rejectionProbability({ ...d, n: nReq }), label: `n = ${fmtInt(nReq)}`, color: C.powerInk } : null) : { x: Math.abs(d.delta / d.sigma), y: powerNow, label: `d = ${fmt(Math.abs(d.delta / d.sigma))}`, color: C.powerInk }}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button onClick={() => setSaved((s) => [...s, { id: Date.now(), label: `α=${d.alpha}, d=${fmt(d.delta / d.sigma)}, ${d.test}, ${d.alternative}${axis === 'effect' ? `, n=${d.n}` : ''}`, d }].slice(-5))}>Keep this curve</Button>
              {saved.length > 0 && (
                <Button variant="ghost" onClick={() => setSaved([])}>
                  Clear kept curves
                </Button>
              )}
              <span className="text-xs text-slate-500">Hover the chart to read power at any {axis === 'n' ? 'n' : 'effect'}.</span>
            </div>
          </Card>
          {nReq !== null && (
            <Card title="Sample size justification" actions={<Button onClick={copy}>{copied ? 'Copied' : 'Copy text'}</Button>}>
              <p className="text-sm leading-relaxed text-slate-800">{sentence}</p>
            </Card>
          )}
          <Callout kind="practice">
            <ul className="list-disc space-y-1 pl-5">
              <li>For two groups with unequal variances, plan with the larger SD or use Welch-based software; for binary outcomes, σ = √(p(1 − p)) is a good approximation when n is large.</li>
              <li>If n is fixed by resources, report the detectable effect (sensitivity analysis) instead of pretending to target one <Cite k="lakens2022" />.</li>
              <li>Multiple primary outcomes or interim looks need a smaller α per test — plan for it here.</li>
              <li>
                Never compute power from the observed effect after the study <Cite k="hoenig2001" />.
              </li>
            </ul>
          </Callout>
        </div>
      </div>
    </div>
  );
}
