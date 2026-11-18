import { Link } from 'react-router';
import { CASES } from '../content/cases';
import { C } from '../lib/colors';
import { fmt, fmtPct, fmtSig } from '../lib/format';
import { operatingCharacteristics } from '../stats/design';
import { DistributionChart } from '../components/charts/DistributionChart';
import { Cite } from '../components/ui/Cite';
import { Card, Stat } from '../components/ui/layout';
import { QuestionSet } from '../components/ui/Quiz';
import { TostExplorer, type TostSetup } from '../components/widgets/explorers';

const BE_SETUP: TostSetup = {
  estimate: 0.05,
  sd: 0.25,
  n: 24,
  margin: 0.223,
  units: 'log ratio',
  design: 'paired',
  logRatio: true,
  ranges: { estimate: [-0.4, 0.4, 0.005], sd: [0.05, 0.6, 0.01], margin: [0.05, 0.4, 0.001] },
};

export default function Cases() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Case studies</h1>
      <p className="mt-1 max-w-3xl text-slate-600">Four realistic designs from different fields. Each shows why the test, α, effect size and sample size were chosen, what each error would cost, and what to explore. Open any case in the Decision Lab to change it.</p>
      <nav className="mt-4 flex flex-wrap gap-2" aria-label="Cases">
        {CASES.map((c) => (
          <a key={c.id} href={`#${c.id}`} className="rounded-full bg-white px-3 py-1 text-sm text-slate-700 ring-1 ring-slate-300 hover:ring-slate-500">
            {c.title}
          </a>
        ))}
      </nav>
      <div className="mt-8 space-y-10">
        {CASES.map((c) => {
          const oc = operatingCharacteristics(c.design);
          const u = c.units && c.units !== 'log ratio' ? ` ${c.units}` : '';
          return (
            <Card key={c.id} id={c.id} eyebrow={c.field} title={c.title} actions={<Link to={`/lab?case=${c.id}`} className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700">Open in Decision Lab →</Link>}>
              <p className="text-slate-700">{c.summary}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Stat label="Design" value={<span className="text-sm">{c.design.design === 'two-sample' ? `2 groups × ${c.design.n.toLocaleString('en-US')}` : `n = ${c.design.n}`}</span>} sub={`${c.design.test} test, ${c.design.alternative}`} />
                <Stat label="Effect δ / SD σ" value={<span className="text-sm">{fmtSig(c.design.delta, 3)}{u} / {fmtSig(c.design.sigma, 3)}{u}</span>} sub={`d = ${fmt(oc.d)}`} />
                <Stat label="α" value={fmtSig(c.design.alpha, 2)} color={C.type1Ink} />
                <Stat label="Power" value={fmtPct(oc.power)} color={C.powerInk} />
              </div>
              <div className="mt-4">
                {c.id === 'bioequivalence' ? <TostExplorer setup={BE_SETUP} /> : <DistributionChart design={c.design} label={`${c.title}: sampling distributions`} height={220} />}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl p-3 text-sm ring-1" style={{ background: `${C.type1}10`, borderColor: C.type1 }}>
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.type1Ink }}>
                    Type I error here
                  </div>
                  <p className="mt-1 text-slate-800">{c.story.type1}</p>
                </div>
                <div className="rounded-xl p-3 text-sm ring-1" style={{ background: `${C.type2}10`, borderColor: C.type2 }}>
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.type2Ink }}>
                    Type II error here
                  </div>
                  <p className="mt-1 text-slate-800">{c.story.type2}</p>
                </div>
              </div>
              <h3 className="mt-5 font-semibold text-slate-900">Why this design</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700">
                {c.rationale.map((r) => (
                  <li key={r.point}>
                    {r.point} {r.refs && <Cite k={r.refs} />}
                  </li>
                ))}
              </ul>
              <h3 className="mt-5 font-semibold text-slate-900">Explore</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {c.explore.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
              <h3 className="mt-5 mb-2 font-semibold text-slate-900">Questions</h3>
              <QuestionSet questions={c.questions} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
