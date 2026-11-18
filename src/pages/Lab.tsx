import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CASE_BY_ID, CASES } from '../content/cases';
import { C } from '../lib/colors';
import { fmt, fmtPct, fmtSig } from '../lib/format';
import { criticalValues, falsePositiveRisk, operatingCharacteristics, requiredN, signAndMagnitude, type Alternative, type Design, type DesignKind, type TestKind } from '../stats/design';
import { DistributionChart, type DistributionLayers } from '../components/charts/DistributionChart';
import { Button, Slider, Toggle } from '../components/ui/controls';
import { Card, LiveRegion, Stat } from '../components/ui/layout';
import { Cite } from '../components/ui/Cite';
import { DecisionTable } from '../components/widgets/DecisionTable';
import { DesignControls } from '../components/widgets/DesignControls';

interface LabState {
  d: Design;
  prior: number;
  caseId: string | null;
}

const DEFAULT: LabState = { d: { design: 'two-sample', test: 't', alternative: 'two-sided', alpha: 0.05, n: 50, delta: 0.5, sigma: 1 }, prior: 0.1, caseId: null };

const num = (v: string | null, lo: number, hi: number, fallback: number) => {
  const x = v === null ? NaN : Number(v);
  return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : fallback;
};

function parse(sp: URLSearchParams): LabState {
  const caseId = sp.get('case');
  const c = caseId ? CASE_BY_ID[caseId] : undefined;
  const base = c ? { d: c.design, prior: c.prior, caseId: c.id } : DEFAULT;
  const alt = sp.get('alt');
  const test = sp.get('test');
  const des = sp.get('design');
  return {
    caseId: base.caseId,
    prior: num(sp.get('prior'), 0.01, 0.99, base.prior),
    d: {
      design: des === 'one-sample' || des === 'two-sample' ? (des as DesignKind) : base.d.design,
      test: test === 'z' || test === 't' ? (test as TestKind) : base.d.test,
      alternative: alt === 'two-sided' || alt === 'greater' || alt === 'less' ? (alt as Alternative) : base.d.alternative,
      alpha: num(sp.get('alpha'), 0.0001, 0.5, base.d.alpha),
      n: Math.round(num(sp.get('n'), 2, 1_000_000, base.d.n)),
      delta: num(sp.get('delta'), -1e6, 1e6, base.d.delta),
      sigma: num(sp.get('sigma'), 1e-6, 1e6, base.d.sigma),
    },
  };
}

function serialize(s: LabState): URLSearchParams {
  const p = new URLSearchParams();
  if (s.caseId) p.set('case', s.caseId);
  p.set('design', s.d.design);
  p.set('test', s.d.test);
  p.set('alt', s.d.alternative);
  p.set('alpha', String(s.d.alpha));
  p.set('n', String(s.d.n));
  p.set('delta', String(Number(s.d.delta.toPrecision(6))));
  p.set('sigma', String(Number(s.d.sigma.toPrecision(6))));
  p.set('prior', String(s.prior));
  return p;
}

interface Snapshot {
  label: string;
  d: Design;
  prior: number;
}

export default function Lab() {
  const [sp, setSp] = useSearchParams();
  // Local state drives the controls synchronously; the URL mirrors it for sharing.
  const [state, setState] = useState<LabState>(() => parse(sp));
  const { d, prior, caseId } = state;
  const cs = caseId ? CASE_BY_ID[caseId] : undefined;
  const replaceAll = (next: LabState) => {
    setState(next);
    setSp(serialize(next), { replace: true });
  };
  const set = (patch: Partial<LabState>) => replaceAll({ ...state, ...patch });
  const [layers, setLayers] = useState<DistributionLayers>({ alpha: true, beta: true, power: true });
  const [pinned, setPinned] = useState<Snapshot | null>(null);
  const [copied, setCopied] = useState(false);

  const oc = operatingCharacteristics(d);
  const sm = signAndMagnitude(d);
  const risk = falsePositiveRisk(d.alpha, oc.power, prior);
  const n80 = requiredN(d, 0.8);
  const units = cs?.units ?? '';
  const crit = criticalValues(d);
  const wrongDirection = (d.alternative === 'greater' && d.delta < 0) || (d.alternative === 'less' && d.delta > 0);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('Copy this link:', window.location.href);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Decision Lab</h1>
          <p className="mt-1 max-w-2xl text-slate-600">Every lever of a test in one place. All numbers are exact (noncentral t for t tests). The URL keeps your settings, so you can share a scenario.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={copyLink}>{copied ? 'Link copied' : 'Copy link'}</Button>
          <Button onClick={() => setPinned({ label: cs ? cs.title : 'Pinned design', d, prior })}>{pinned ? 'Re-pin as A' : 'Pin as A to compare'}</Button>
          <Button variant="ghost" onClick={() => replaceAll(DEFAULT)}>
            Reset
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Scenario presets">
        <button type="button" onClick={() => replaceAll(DEFAULT)} className={`rounded-full px-3 py-1 text-sm ring-1 ${!caseId ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-700 ring-slate-300 hover:ring-slate-500'}`}>
          Generic (d = 0.5)
        </button>
        {CASES.map((c) => (
          <button key={c.id} type="button" onClick={() => replaceAll({ d: c.design, prior: c.prior, caseId: c.id })} className={`rounded-full px-3 py-1 text-sm ring-1 ${caseId === c.id ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-700 ring-slate-300 hover:ring-slate-500'}`}>
            {c.title}
          </button>
        ))}
      </div>
      {cs && (
        <p className="mt-3 text-sm text-slate-700">
          {cs.summary}{' '}
          <Link to={`/cases#${cs.id}`} className="text-blue-700 underline">
            Read the full case
          </Link>
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0 lg:col-start-2 lg:row-start-1">
          <Card>
            <DistributionChart design={d} layers={layers} onAlphaChange={(alpha) => set({ d: { ...d, alpha } })} label="Sampling distributions under H₀ and H₁" />
            <div className="mt-3 flex flex-wrap gap-4">
              <Toggle label="Shade α" checked={!!layers.alpha} onChange={(v) => setLayers({ ...layers, alpha: v })} />
              <Toggle label="Shade β" checked={!!layers.beta} onChange={(v) => setLayers({ ...layers, beta: v })} />
              <Toggle label="Shade power" checked={!!layers.power} onChange={(v) => setLayers({ ...layers, power: v })} />
            </div>
            {wrongDirection && (
              <p className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-900 ring-1 ring-orange-200">
                The one-sided test looks in the opposite direction to the true effect: power is below α, however large the effect.
              </p>
            )}
          </Card>
        </div>
        <div className="space-y-6 lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <Card title="Design">
            <DesignControls value={d} onChange={(nd) => set({ d: nd })} units={units} scale={cs?.scale ?? 1} nMax={cs?.nMax ?? 20000} />
          </Card>
          <Card title="Research context">
            <Slider label="Prior: share of tested effects that are real" value={prior} min={0.01} max={0.99} step={0.01} onChange={(v) => set({ prior: Number(v.toFixed(2)) })} format={(v) => fmtPct(v, 0)} accent="#B45309" hint="Only affects the false positive risk and the 2×2 table below." />
          </Card>
        </div>

        <div className="min-w-0 space-y-6 lg:col-start-2 lg:row-start-2">

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat big label="Power (1 − β)" value={fmtPct(oc.power)} color={C.powerInk} sub="P(reject | effect δ)" />
            <Stat big label="β (Type II)" value={fmtPct(oc.beta)} color={C.type2Ink} sub="P(miss | effect δ)" />
            <Stat big label="α (Type I)" value={fmtPct(d.alpha)} color={C.type1Ink} sub="P(reject | no effect)" />
            <Stat big label="False positive risk" value={fmtPct(risk.fpr)} color={C.type1Ink} sub={`P(no effect | reject), prior ${fmtPct(prior, 0)}`} />
            <Stat label="Cohen’s d = δ/σ" value={fmt(oc.d)} />
            <Stat label="SE" value={`${fmtSig(oc.se, 3)}${units ? ` ${units}` : ''}`} sub={d.design === 'two-sample' ? 'σ·√(2/n)' : 'σ/√n'} />
            <Stat label="λ = δ/SE" value={fmt(oc.lambda)} sub={Number.isFinite(oc.df) ? `df = ${oc.df}` : 'z test'} />
            <Stat label="Critical value(s)" value={[crit.lower, crit.upper].filter((c) => c !== null).map((c) => fmt(c!)).join(' / ')} />
            <Stat label="Exaggeration (Type M)" value={sm ? `${fmt(sm.exaggeration, 2)}×` : '—'} sub="mean |significant estimate| ÷ |δ|" />
            <Stat label="Wrong sign (Type S)" value={sm ? fmtPct(sm.typeS, 2) : '—'} sub="among significant results" />
            <Stat label="n for 80% power" value={n80 === null ? '—' : n80.toLocaleString('en-US')} sub={d.design === 'two-sample' ? 'per group' : 'total'} />
            <Stat label="Detectable at this n" value={d.delta === 0 ? 'H₀ true' : oc.power >= 0.8 ? 'yes (≥ 80%)' : 'underpowered'} color={oc.power >= 0.8 ? C.powerInk : C.type1Ink} />
          </div>
          <LiveRegion>
            Power {fmtPct(oc.power)}, beta {fmtPct(oc.beta)}, false positive risk {fmtPct(risk.fpr)}.
          </LiveRegion>

          {pinned && <Compare a={pinned} b={{ label: 'Current', d, prior }} onClear={() => setPinned(null)} />}

          <Card title="The 2×2 table in natural frequencies">
            <DecisionTable alpha={d.alpha} power={oc.power} prior={prior} cohort={1000} story={cs?.story} />
            <p className="mt-3 text-xs text-slate-500">
              Rows are what α and power control. The “Reject” column is what readers of significant results experience <Cite k={['ioannidis2005', 'colquhoun2014']} />.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Compare({ a, b, onClear }: { a: Snapshot; b: Snapshot; onClear: () => void }) {
  const rows = [a, b].map((s) => {
    const oc = operatingCharacteristics(s.d);
    return { s, oc, fpr: falsePositiveRisk(s.d.alpha, oc.power, s.prior).fpr, sm: signAndMagnitude(s.d) };
  });
  const cols: { label: string; get: (r: (typeof rows)[number]) => string }[] = [
    { label: 'α', get: (r) => fmtSig(r.s.d.alpha, 2) },
    { label: 'n', get: (r) => r.s.d.n.toLocaleString('en-US') },
    { label: 'd', get: (r) => fmt(r.oc.d) },
    { label: 'power', get: (r) => fmtPct(r.oc.power) },
    { label: 'FPR', get: (r) => fmtPct(r.fpr) },
    { label: 'Type M', get: (r) => (r.sm ? `${fmt(r.sm.exaggeration, 2)}×` : '—') },
  ];
  return (
    <Card
      title="Compare"
      actions={
        <Button variant="ghost" className="text-xs" onClick={onClear}>
          Clear
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left">
              <th className="py-1.5 pr-2 font-semibold" />
              {cols.map((c) => (
                <th key={c.label} className="px-2 text-right font-semibold">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-1.5 pr-2 font-medium">{i === 0 ? `A · ${r.s.label}` : 'B · current'}</td>
                {cols.map((c) => (
                  <td key={c.label} className="px-2 text-right font-mono">
                    {c.get(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
