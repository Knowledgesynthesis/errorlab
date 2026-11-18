import { useState } from 'react';
import { Link } from 'react-router';
import { LESSONS } from '../content/lessons';
import { C } from '../lib/colors';
import { fmtPct } from '../lib/format';
import { useProgress } from '../lib/progress-context';
import { rejectionProbability, type Design } from '../stats/design';
import { DistributionChart } from '../components/charts/DistributionChart';
import { Cite } from '../components/ui/Cite';
import { Slider } from '../components/ui/controls';

const CONCEPTS = [
  { term: 'α', name: 'Type I error rate', def: 'P(reject H₀ | no effect). Chosen in advance.', color: C.type1Ink },
  { term: 'β', name: 'Type II error rate', def: 'P(miss | real effect of size δ). Set by the design.', color: C.type2Ink },
  { term: '1 − β', name: 'Power', def: 'P(detect | real effect of size δ). Plan for ≥ 80%.', color: C.powerInk },
  { term: 'p', name: 'p-value', def: 'P(data this extreme | H₀ and model). Not P(H₀ | data).', color: C.pvalInk },
];

const TOOLS = [
  { to: '/lab', title: 'Decision Lab', desc: 'All levers of a test, the 2×2 table in natural frequencies, false positive risk, shareable links.' },
  { to: '/simulate', title: 'Simulations', desc: 'p-value distributions, the dance of p, exaggeration, peeking and multiple testing.' },
  { to: '/plan', title: 'Sample-size planner', desc: 'Exact n for a target power, detectable effects, power curves and a ready-to-paste justification.' },
  { to: '/cases', title: 'Case studies', desc: 'A drug trial, an A/B test, a control chart and a bioequivalence study — designed correctly.' },
  { to: '/reference', title: 'Reference', desc: 'Glossary, formulas with worked examples, misconceptions, checklists and every source.' },
];

export function Home() {
  const [d, setD] = useState<Design>({ design: 'two-sample', test: 't', alternative: 'two-sided', alpha: 0.05, n: 30, delta: 0.5, sigma: 1 });
  const { completed } = useProgress();
  const next = LESSONS.find((l) => !completed[l.id]) ?? LESSONS[0];
  const power = rejectionProbability(d);
  return (
    <div>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:py-14">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">Know what a significant result really tells you.</h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">ErrorLab teaches Type I and II errors, power, p-values, false positive risk, multiplicity and study design by letting you run the experiments yourself. Every number is computed exactly.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={`/learn/${next.id}`} className="rounded-xl bg-slate-900 px-5 py-2.5 font-medium text-white hover:bg-slate-700">
                {Object.keys(completed).length ? `Continue: ${next.title}` : 'Start lesson 1'} →
              </Link>
              <Link to="/lab" className="rounded-xl px-5 py-2.5 font-medium text-slate-800 ring-1 ring-slate-300 hover:bg-slate-50">
                Open the Decision Lab
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold text-slate-900">Try it: a two-group trial</h2>
              <span className="text-sm text-slate-600">
                power <strong className="font-mono" style={{ color: C.powerInk }}>{fmtPct(power)}</strong> · α <strong className="font-mono" style={{ color: C.type1Ink }}>{fmtPct(d.alpha)}</strong>
              </span>
            </div>
            <DistributionChart design={d} onAlphaChange={(alpha) => setD({ ...d, alpha })} label="Null and alternative distributions for a two-group trial" height={210} compactLegend />
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Slider label="n per group" value={d.n} min={4} max={500} scale="log" round={Math.round} onChange={(n) => setD({ ...d, n })} format={String} accent="#0072B2" />
              <Slider label="True effect d" value={d.delta} min={0} max={1.5} step={0.05} onChange={(delta) => setD({ ...d, delta: Number(delta.toFixed(2)) })} format={(v) => v.toFixed(2)} accent="#B45309" />
            </div>
            <p className="mt-3 text-xs text-slate-600">
              <span style={{ color: C.type1Ink }}>Red</span>: false positives if H₀ is true (α). <span style={{ color: C.powerInk }}>Green</span>: detections if the effect is real (power). <span style={{ color: C.type2Ink }}>Blue</span>: misses (β). Drag the handle on a critical value to change α.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="text-xl font-semibold text-slate-900">Four numbers to get exactly right</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CONCEPTS.map((c) => (
            <div key={c.term} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <div className="font-mono text-2xl font-semibold" style={{ color: c.color }}>
                {c.term}
              </div>
              <div className="mt-1 font-medium text-slate-900">{c.name}</div>
              <p className="mt-1 text-sm text-slate-600">{c.def}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold text-slate-900">The learning path</h2>
          <Link to="/learn" className="text-sm text-blue-700 underline">
            All lessons and progress
          </Link>
        </div>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {LESSONS.map((l, i) => (
            <li key={l.id}>
              <Link to={`/learn/${l.id}`} className="flex h-full gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200 hover:ring-slate-400">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ${completed[l.id] ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{completed[l.id] ? '✓' : i + 1}</span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{l.title}</span>
                  <span className="block text-xs text-slate-600">{l.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <h2 className="text-xl font-semibold text-slate-900">Tools</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {TOOLS.map((t) => (
            <Link key={t.to} to={t.to} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 transition hover:shadow-md hover:ring-slate-300">
              <div className="font-semibold text-slate-900">{t.title}</div>
              <p className="mt-1 text-sm text-slate-600">{t.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-4">
        <div className="grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200 md:grid-cols-3">
          <div>
            <h3 className="font-semibold text-slate-900">Exact, tested maths</h3>
            <p className="mt-1 text-sm text-slate-600">Power uses the noncentral t distribution; tails stay accurate below 10⁻¹⁵. A test suite checks the engine against SciPy and published tables.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Sourced content</h3>
            <p className="mt-1 text-sm text-slate-600">
              Claims link to primary sources, including the ASA statements on p-values <Cite k={['asa2016', 'asa2021']} />. <Link to="/reference#sources" className="text-blue-700 underline">All sources</Link>.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Built for learning</h3>
            <p className="mt-1 text-sm text-slate-600">
              Predict before you see, retrieve from memory, practise mixed problems <Cite k={['crouch2004', 'roediger2006', 'rohrer2007']} />.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
