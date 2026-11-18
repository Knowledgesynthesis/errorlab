import { useMemo, useState } from 'react';
import { C } from '../../lib/colors';
import { fmt, fmtInt, fmtP, fmtPct, fmtSig } from '../../lib/format';
import {
  bayesFactorBound,
  benjaminiHochberg,
  bonferroni,
  degreesOfFreedom,
  drawSample,
  familyWiseErrorRate,
  holm,
  noncentrality,
  normQuantile,
  normSf,
  rejectionProbability,
  signAndMagnitude,
  simulateFamily,
  simulatePeeking,
  simulateStudies,
  sValue,
  confidenceInterval,
  type Design,
} from '../../stats';
import { CIStack, EstimateStrip, PHistogram, PPaths, SortedPChart } from '../charts/plots';
import { DistributionChart } from '../charts/DistributionChart';
import { Button, Segmented, Slider, Toggle } from '../ui/controls';
import { Stat } from '../ui/layout';
import { ALPHA_PRESETS } from '../../lib/presets';
import { DesignControls } from './DesignControls';

const newSeed = () => Math.floor(Math.random() * 2 ** 31);

// ---------------------------------------------------------------------------
// Lesson 1: 100 studies on a grid
// ---------------------------------------------------------------------------

export function StudyGrid() {
  const [world, setWorld] = useState<'null' | 'effect'>('null');
  const [alpha, setAlpha] = useState(0.05);
  const [seed, setSeed] = useState(7);
  const [history, setHistory] = useState<{ world: string; alpha: number; rejected: number; total: number }[]>([]);
  const design = useMemo<Design>(() => ({ design: 'two-sample', test: 't', alternative: 'two-sided', alpha, n: 30, delta: world === 'null' ? 0 : 0.5, sigma: 1 }), [alpha, world]);
  const sims = useMemo(() => simulateStudies(design, 100, seed), [design, seed]);
  const rejected = sims.rejectRate * 100;
  const expected = world === 'null' ? alpha : rejectionProbability(design);
  const tally = history.filter((h) => h.world === world && h.alpha === alpha);
  const tallyRej = tally.reduce((s, h) => s + h.rejected, 0);
  const tallyN = tally.reduce((s, h) => s + h.total, 0);

  const run = () => {
    setHistory((h) => [...h, { world, alpha, rejected: Math.round(rejected), total: 100 }]);
    setSeed(newSeed());
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Segmented
          label="Which world are we in?"
          value={world}
          onChange={setWorld}
          options={[
            { value: 'null', label: 'H₀ true: drug does nothing' },
            { value: 'effect', label: 'H₁ true: d = 0.5' },
          ]}
        />
        <Slider label="α" value={alpha} min={0.001} max={0.2} scale="log" round={(v) => Number(v.toPrecision(2))} onChange={setAlpha} format={(v) => fmtSig(v, 2)} accent="#D55E00" presets={ALPHA_PRESETS.slice(0, 4)} />
      </div>
      <p className="text-sm text-slate-600">Each square is one two-group trial with 30 patients per arm, analysed with a two-sided t test.</p>
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5" role="img" aria-label={`${Math.round(rejected)} of 100 studies rejected H₀`}>
        {Array.from(sims.significant).map((sig, i) => {
          const color = world === 'null' ? (sig ? C.type1 : '#E2E8F0') : sig ? C.power : 'white';
          const border = world === 'effect' && !sig ? C.type2 : 'transparent';
          return <div key={i} className="aspect-square rounded-[3px] border-2" style={{ background: color, borderColor: border }} title={`study ${i + 1}: p = ${fmtP(sims.p[i])}`} />;
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={run}>
          Run 100 more studies
        </Button>
        <span className="text-sm text-slate-700">
          This batch: <strong className="font-mono">{Math.round(rejected)}</strong> of 100 rejected H₀ —{' '}
          {world === 'null' ? (
            <span style={{ color: C.type1Ink }}>every one a false positive</span>
          ) : (
            <span>
              <span style={{ color: C.powerInk }}>{Math.round(rejected)} detections</span>, <span style={{ color: C.type2Ink }}>{100 - Math.round(rejected)} misses</span>
            </span>
          )}
          . Expected in the long run: <strong className="font-mono">{fmtPct(expected, 1)}</strong> ({world === 'null' ? 'α' : 'power'}).
        </span>
      </div>
      {tallyN > 0 && (
        <p className="text-sm text-slate-600">
          All batches so far in this world at α = {alpha}: {fmtInt(tallyRej)} of {fmtInt(tallyN)} = <strong className="font-mono">{fmtPct(tallyRej / tallyN)}</strong>. Single batches bounce around; the long-run share settles on {world === 'null' ? 'α' : 'the power'}.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// One study: data → statistic → p-value
// ---------------------------------------------------------------------------

export function OneStudy({ initial }: { initial?: Partial<Design> }) {
  const [d, setD] = useState<Design>({ design: 'two-sample', test: 't', alternative: 'two-sided', alpha: 0.05, n: 25, delta: 0.5, sigma: 1, ...initial });
  const [draw, setDraw] = useState<{ seed: number; world: 'H0' | 'H1' } | null>(null);
  const [showH1, setShowH1] = useState(false);
  const sample = useMemo(() => (draw ? drawSample(d, draw.seed, draw.world === 'H0' ? 0 : d.delta) : null), [d, draw]);
  const statName = d.test === 't' ? 't' : 'z';
  let verdict: { text: string; color: string } | null = null;
  if (sample && draw) {
    if (draw.world === 'H0') verdict = sample.significant ? { text: 'Type I error: a false positive. H₀ was true.', color: C.type1Ink } : { text: 'Correct: no effect existed and none was claimed.', color: C.correctInk };
    else verdict = sample.significant ? { text: 'Correct detection of a real effect.', color: C.powerInk } : { text: 'Type II error: a real effect was missed.', color: C.type2Ink };
  }
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,300px)_1fr]">
      <div className="space-y-4">
        <DesignControls value={d} onChange={setD} show={['design', 'test', 'alternative', 'alpha', 'n', 'delta']} nMax={500} />
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => setDraw({ seed: newSeed(), world: 'H0' })}>
            Run a study where H₀ is true
          </Button>
          <Button variant="primary" className="bg-amber-700 hover:bg-amber-800" onClick={() => setDraw({ seed: newSeed(), world: 'H1' })} disabled={d.delta === 0}>
            Run a study where δ = {fmt(d.delta)}
          </Button>
        </div>
        {sample && draw ? (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label={d.design === 'two-sample' ? 'Estimate (mean B − mean A)' : 'Sample mean'} value={fmt(sample.estimate, 3)} sub={`truth: ${draw.world === 'H0' ? 0 : fmt(d.delta)}`} />
              <Stat label="Standard error" value={fmt(sample.se, 3)} sub={d.test === 't' ? `from sample SD ${fmt(sample.sd, 2)}` : 'from known σ'} />
              <Stat label={`${statName} = estimate ÷ SE`} value={fmt(sample.stat, 2)} sub={Number.isFinite(sample.df) ? `df = ${sample.df}` : 'normal reference'} />
              <Stat label="p-value" value={fmtP(sample.p)} color={C.pvalInk} sub={sample.p <= d.alpha ? `≤ α = ${d.alpha}: reject H₀` : `> α = ${d.alpha}: do not reject`} />
            </div>
            {verdict && (
              <p className="rounded-lg px-3 py-2 text-sm font-semibold ring-1" style={{ color: verdict.color, borderColor: verdict.color, background: `${verdict.color}10` }}>
                {verdict.text} <span className="font-normal text-slate-600">(In real research you never get to see this line.)</span>
              </p>
            )}
            <DistributionChart design={d} observed={sample.stat} showPTail showH1={showH1} layers={{ alpha: true, beta: false, power: false }} label="Null distribution with the observed statistic and its p-value tail" />
            <Toggle label="Also show the H₁ curve" checked={showH1} onChange={setShowH1} />
            <div className="grid gap-2 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
                <div className="text-xs font-medium text-slate-600">{Math.round((1 - (d.alternative === 'two-sided' ? d.alpha : 2 * d.alpha)) * 100)}% confidence interval</div>
                <div className="font-mono font-semibold">
                  [{fmt(sample.ci[0], 3)}, {fmt(sample.ci[1], 3)}]
                </div>
                <div className="text-xs text-slate-500">Values of δ compatible with the data at this α.</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
                <div className="text-xs font-medium text-slate-600">S-value (surprisal)</div>
                <div className="font-mono font-semibold">{fmt(sValue(sample.p), 1)} bits</div>
                <div className="text-xs text-slate-500">As surprising as {Math.max(0, Math.round(sValue(sample.p)))} heads in a row from a fair coin.</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
                <div className="text-xs font-medium text-slate-600">Max. evidence for H₁ (Bayes factor bound)</div>
                <div className="font-mono font-semibold">≤ {fmtSig(bayesFactorBound(sample.p), 3)} : 1</div>
                <div className="text-xs text-slate-500">Upper limit over all priors; usually less.</div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Run a study to see its test statistic land on the null distribution.</div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Many studies: the distribution of p-values
// ---------------------------------------------------------------------------

export function ManyStudies({ initial, count = 5000 }: { initial?: Partial<Design>; count?: number }) {
  const [d, setD] = useState<Design>({ design: 'two-sample', test: 't', alternative: 'two-sided', alpha: 0.05, n: 30, delta: 0.5, sigma: 1, ...initial });
  const [world, setWorld] = useState<'H0' | 'H1'>('H0');
  const [seed, setSeed] = useState(11);
  const delta = world === 'H0' ? 0 : d.delta;
  const sims = useMemo(() => simulateStudies(d, count, seed, delta), [d, count, seed, delta]);
  const expected = rejectionProbability(d, delta);
  const below01 = Array.from(sims.p).filter((p) => p <= 0.01).length / count;
  const between = Array.from(sims.p).filter((p) => p > 0.01 && p <= 0.05).length / count;
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,300px)_1fr]">
      <div className="space-y-4">
        <Segmented
          label="True state of the world"
          value={world}
          onChange={setWorld}
          options={[
            { value: 'H0', label: 'H₀ true' },
            { value: 'H1', label: 'H₁ true' },
          ]}
        />
        <DesignControls value={d} onChange={setD} show={world === 'H0' ? ['test', 'alpha', 'n'] : ['test', 'alpha', 'n', 'delta']} nMax={1000} />
        <Button onClick={() => setSeed(newSeed())}>Re-run {fmtInt(count)} studies</Button>
      </div>
      <div className="space-y-3">
        <PHistogram values={sims.p} alpha={d.alpha} label={`Histogram of ${count} p-values`} expectedUniform={world === 'H0'} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label={`p ≤ α (${d.alpha})`} value={fmtPct(sims.rejectRate)} sub={`theory: ${fmtPct(expected)} (${world === 'H0' ? 'α' : 'power'})`} color={world === 'H0' ? C.type1Ink : C.powerInk} />
          <Stat label="p ≤ 0.01" value={fmtPct(below01)} />
          <Stat label="0.01 < p ≤ 0.05" value={fmtPct(between)} />
          <Stat label="median p" value={fmtP(median(sims.p))} />
        </div>
        <p className="text-sm text-slate-600">
          {world === 'H0'
            ? 'Under H₀ every p-value is equally likely: the histogram is flat (dashed line). A p of 0.03 is exactly as common as a p of 0.83.'
            : `Under H₁ p-values pile up near 0. How steeply depends on power (${fmtPct(expected)} here). With modest power, p-values between 0.01 and 0.05 are common even though the effect is real.`}
        </p>
      </div>
    </div>
  );
}

function median(xs: ArrayLike<number>): number {
  const a = Array.from(xs).sort((x, y) => x - y);
  return a.length % 2 ? a[(a.length - 1) / 2] : 0.5 * (a[a.length / 2 - 1] + a[a.length / 2]);
}

// ---------------------------------------------------------------------------
// The dance of the p-values (Cumming 2008)
// ---------------------------------------------------------------------------

export function PDance() {
  const [d, setD] = useState<Design>({ design: 'two-sample', test: 't', alternative: 'two-sided', alpha: 0.05, n: 32, delta: 0.5, sigma: 1 });
  const [seed, setSeed] = useState(3);
  const rows = useMemo(() => {
    const sims = simulateStudies(d, 20, seed);
    const df = degreesOfFreedom(d);
    return Array.from({ length: 20 }, (_, i) => {
      const [lo, hi] = confidenceInterval(sims.estimate[i], sims.se[i], df, 1 - d.alpha);
      return { estimate: sims.estimate[i], lo, hi, p: sims.p[i], significant: sims.significant[i] === 1 };
    });
  }, [d, seed]);
  const ps = rows.map((r) => r.p);
  const sig = rows.filter((r) => r.significant).length;
  const covered = rows.filter((r) => r.lo <= d.delta && r.hi >= d.delta).length;
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,300px)_1fr]">
      <div className="space-y-4">
        <DesignControls value={d} onChange={setD} show={['n', 'delta']} nMax={500} />
        <p className="text-sm text-slate-600">
          Power for this design: <strong className="font-mono">{fmtPct(rejectionProbability(d))}</strong>
        </p>
        <Button onClick={() => setSeed(newSeed())}>Replicate 20 more times</Button>
      </div>
      <div className="space-y-2">
        <CIStack rows={rows} truth={d.delta} label="Twenty exact replications with confidence intervals and p-values" />
        <p className="text-sm text-slate-700">
          Twenty identical experiments, same true effect. p ranged from <strong className="font-mono">{fmtP(Math.min(...ps))}</strong> to <strong className="font-mono">{fmtP(Math.max(...ps))}</strong>; {sig} of 20 were significant. {covered} of 20 intervals contain the true δ (expected ≈ {Math.round(20 * (1 - d.alpha))}).
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exaggeration (Type M) and sign (Type S) errors
// ---------------------------------------------------------------------------

export function ExaggerationSim() {
  const [d, setD] = useState<Design>({ design: 'two-sample', test: 't', alternative: 'two-sided', alpha: 0.05, n: 20, delta: 0.3, sigma: 1 });
  const [seed, setSeed] = useState(5);
  const sims = useMemo(() => simulateStudies(d, 400, seed), [d, seed]);
  const sm = signAndMagnitude(d);
  const sigEst = Array.from(sims.estimate).filter((_, i) => sims.significant[i]);
  const meanSig = sigEst.length ? sigEst.reduce((s, v) => s + Math.abs(v), 0) / sigEst.length : null;
  const wrongSign = sigEst.filter((e) => Math.sign(e) !== Math.sign(d.delta)).length;
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,300px)_1fr]">
      <div className="space-y-4">
        <DesignControls value={d} onChange={setD} show={['n', 'delta', 'alpha']} nMax={1000} />
        <Button onClick={() => setSeed(newSeed())}>Run 400 new studies</Button>
      </div>
      <div className="space-y-3">
        <EstimateStrip estimates={sims.estimate} significant={sims.significant} truth={d.delta} meanSignificant={meanSig === null ? null : meanSig * Math.sign(d.delta || 1)} label="Estimates from 400 studies; significant ones highlighted" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Power" value={fmtPct(rejectionProbability(d))} color={C.powerInk} />
          <Stat label="Exaggeration (Type M)" value={sm ? `${fmt(sm.exaggeration, 2)}×` : '—'} sub={meanSig !== null && d.delta !== 0 ? `this run: ${fmt(meanSig / Math.abs(d.delta), 2)}×` : undefined} />
          <Stat label="Wrong sign (Type S)" value={sm ? fmtPct(sm.typeS) : '—'} sub={sigEst.length ? `this run: ${wrongSign} of ${sigEst.length}` : undefined} color={C.type1Ink} />
          <Stat label="Significant this run" value={`${sigEst.length} / 400`} />
        </div>
        <p className="text-sm text-slate-600">Green dots are the studies that reached p ≤ α — the ones most likely to be published. Their average sits well beyond the true effect when power is low. Raise n and watch the green cloud close in on the truth.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Optional stopping
// ---------------------------------------------------------------------------

export function PeekingSim() {
  const [nMax, setNMax] = useState(100);
  const [step, setStep] = useState(10);
  const [alpha, setAlpha] = useState(0.05);
  const [seed, setSeed] = useState(9);
  const res = useMemo(() => simulatePeeking({ design: 'two-sample', test: 't', alternative: 'two-sided', alpha, n: nMax, delta: 0, sigma: 1 }, step, 2000, seed, 25), [nMax, step, alpha, seed]);
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,300px)_1fr]">
      <div className="space-y-4">
        <Slider label="Maximum n per group" value={nMax} min={20} max={400} step={10} onChange={(v) => setNMax(Math.round(v / 10) * 10)} format={String} accent="#0072B2" />
        <Slider label="Check the p-value every … observations per group" value={step} min={1} max={Math.max(5, nMax / 2)} step={1} onChange={(v) => setStep(Math.round(v))} format={String} accent="#CC79A7" hint={`${res.looks.length} looks in total. Stop at the first p ≤ α.`} />
        <Slider label="α at each look" value={alpha} min={0.005} max={0.1} step={0.005} onChange={(v) => setAlpha(Number(v.toFixed(3)))} format={(v) => String(v)} accent="#D55E00" />
        <Button onClick={() => setSeed(newSeed())}>Re-run 2,000 null studies</Button>
      </div>
      <div className="space-y-3">
        <PPaths paths={res.paths} firstHit={res.firstHit} alpha={alpha} nMax={nMax} label="p-value paths of 25 studies with no true effect" />
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Nominal α" value={fmtPct(alpha)} />
          <Stat label="Fixed n, one test" value={fmtPct(res.finalOnly)} sub="≈ α, as promised" />
          <Stat label={`Peeking (${res.looks.length} looks)`} value={fmtPct(res.anyLook)} color={C.type1Ink} sub={`${fmt(res.anyLook / alpha, 1)}× the nominal rate`} />
        </div>
        <p className="text-sm text-slate-600">Every path is a study with <strong>no</strong> true effect. Red paths dipped below α at some look and would have been stopped and reported as “significant.” p-values wander; if you wait for one to cross the line, it eventually will.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Multiple tests and corrections
// ---------------------------------------------------------------------------

export function MultipleTests() {
  const [m, setM] = useState(20);
  const [real, setReal] = useState(4);
  const [power, setPower] = useState(0.8);
  const [alpha, setAlpha] = useState(0.05);
  const [seed, setSeed] = useState(21);
  const realClamped = Math.min(real, m);
  // λ giving the requested power for a two-sided z test at the unadjusted α
  const lambda = useMemo(() => {
    const c = -normQuantile(alpha / 2);
    let lo = 0;
    let hi = 20;
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      const pw = normSf(c - mid) + normSf(c + mid);
      if (pw < power) lo = mid;
      else hi = mid;
    }
    return hi;
  }, [alpha, power]);
  const tests = useMemo(() => simulateFamily(m, realClamped, lambda, seed), [m, realClamped, lambda, seed]);
  const p = tests.map((t) => t.p);
  const methods = [
    { name: 'No correction', reject: p.map((x) => x <= alpha), controls: 'nothing' },
    { name: 'Bonferroni', reject: bonferroni(p, alpha), controls: 'FWER' },
    { name: 'Holm', reject: holm(p, alpha), controls: 'FWER' },
    { name: 'Benjamini–Hochberg', reject: benjaminiHochberg(p, alpha), controls: 'FDR' },
  ];
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,300px)_1fr]">
      <div className="space-y-4">
        <Slider label="Number of tests m" value={m} min={2} max={500} scale="log" round={Math.round} onChange={setM} format={String} accent="#0072B2" />
        <Slider label="…of which have a real effect" value={realClamped} min={0} max={m} step={1} onChange={(v) => setReal(Math.round(v))} format={String} accent="#009E73" />
        <Slider label="Power of each real test (unadjusted)" value={power} min={0.1} max={0.99} step={0.01} onChange={setPower} format={(v) => fmtPct(v, 0)} accent="#009E73" />
        <Slider label="α (FWER) or q (FDR)" value={alpha} min={0.01} max={0.2} step={0.01} onChange={(v) => setAlpha(Number(v.toFixed(2)))} format={String} accent="#D55E00" />
        <Button onClick={() => setSeed(newSeed())}>Run a new family of tests</Button>
      </div>
      <div className="space-y-3">
        <SortedPChart tests={tests} alpha={alpha} label={`Sorted p-values of ${m} tests`} />
        <div className="flex flex-wrap gap-4 text-xs text-slate-700">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: C.power }} /> real effect
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full border-2" style={{ borderColor: C.type1Ink }} /> no effect (true null)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-left">
                <th className="py-1.5 pr-2 font-semibold">Method</th>
                <th className="px-2 font-semibold">Controls</th>
                <th className="px-2 text-right font-semibold">Discoveries</th>
                <th className="px-2 text-right font-semibold" style={{ color: C.type1Ink }}>
                  False
                </th>
                <th className="px-2 text-right font-semibold" style={{ color: C.type2Ink }}>
                  Missed
                </th>
              </tr>
            </thead>
            <tbody>
              {methods.map((mt) => {
                const disc = mt.reject.filter(Boolean).length;
                const fals = mt.reject.filter((r, i) => r && !tests[i].isReal).length;
                const missed = tests.filter((t, i) => t.isReal && !mt.reject[i]).length;
                return (
                  <tr key={mt.name} className="border-b border-slate-100">
                    <td className="py-1.5 pr-2">{mt.name}</td>
                    <td className="px-2 text-slate-600">{mt.controls}</td>
                    <td className="px-2 text-right font-mono">{disc}</td>
                    <td className="px-2 text-right font-mono" style={{ color: C.type1Ink }}>
                      {fals}
                    </td>
                    <td className="px-2 text-right font-mono" style={{ color: C.type2Ink }}>
                      {missed}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-600">
          With {m - realClamped} true nulls each tested at α = {alpha}, the chance of at least one false positive is <strong className="font-mono">{fmtPct(familyWiseErrorRate(m - realClamped, alpha))}</strong> without correction. One run is noisy; re-run to see the typical pattern.
        </p>
      </div>
    </div>
  );
}

/** Small helper reused by pages: power and λ readouts. */
export function PowerReadout({ d }: { d: Design }) {
  const power = rejectionProbability(d);
  return (
    <div className="grid grid-cols-3 gap-2">
      <Stat label="Power" value={fmtPct(power)} color={C.powerInk} />
      <Stat label="β" value={fmtPct(1 - power)} color={C.type2Ink} />
      <Stat label="λ = δ / SE" value={fmt(noncentrality(d))} />
    </div>
  );
}
