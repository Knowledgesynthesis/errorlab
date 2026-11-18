import { C } from '../../lib/colors';
import { fmtInt, fmtPct } from '../../lib/format';
import { falsePositiveRisk, naturalFrequencies } from '../../stats/design';
import { IconArray } from '../charts/plots';

export interface ErrorStory {
  h0: string;
  h1: string;
  type1: string;
  type2: string;
}

interface Props {
  alpha: number;
  power: number;
  /** share of tested hypotheses where H₁ is true */
  prior: number;
  /** imagined number of studies / hypotheses */
  cohort?: number;
  story?: ErrorStory;
  showIcons?: boolean;
}

function Cell({ count, rate, rateLabel, title, color, desc }: { count: number; rate: number; rateLabel: string; title: string; color: string; desc?: string }) {
  return (
    <td className="border border-slate-200 p-0 align-top">
      <div className="h-full border-t-4 p-2 sm:p-3" style={{ borderTopColor: color, background: `${color}14` }}>
        <div className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
          {title}
        </div>
        <div className="font-mono text-xl font-semibold tabular-nums text-slate-900 sm:text-2xl">{fmtInt(count)}</div>
        <div className="text-xs text-slate-600">
          {rateLabel} = <span className="font-mono font-semibold">{fmtPct(rate)}</span>
          <span className="hidden sm:inline"> of this row</span>
        </div>
        {desc && <div className="mt-1 text-xs italic leading-snug text-slate-600">{desc}</div>}
      </div>
    </td>
  );
}

export function DecisionTable({ alpha, power, prior, cohort = 1000, story, showIcons = false }: Props) {
  const f = naturalFrequencies(alpha, power, prior, cohort);
  const risk = falsePositiveRisk(alpha, power, prior);
  const rejections = f.fp + f.tp;
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] table-fixed border-collapse text-left">
          <caption className="mb-2 text-left text-sm text-slate-600">
            Expected outcomes of <strong>{fmtInt(cohort)}</strong> studies, when the effect is real in <strong>{fmtPct(prior, 0)}</strong> of them.
          </caption>
          <thead>
            <tr>
              <th className="w-[28%] p-1.5 text-xs font-medium text-slate-500 sm:p-2" scope="col">
                Truth ↓ · Decision →
              </th>
              <th className="p-2 text-sm font-semibold text-slate-900" scope="col">
                Do not reject H₀
              </th>
              <th className="p-2 text-sm font-semibold text-slate-900" scope="col">
                Reject H₀ (“significant”)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="border border-slate-200 bg-slate-50 p-1.5 text-sm font-semibold text-slate-900 sm:p-2">
                H₀ true
                <div className="text-xs font-normal text-slate-600">{story?.h0 ?? 'no effect'}</div>
                <div className="mt-1 font-mono text-xs text-slate-500">{fmtInt(f.nulls)} studies</div>
              </th>
              <Cell count={f.tn} rate={1 - alpha} rateLabel="1 − α" title="Correct" color={C.correctInk} />
              <Cell count={f.fp} rate={alpha} rateLabel="α" title="Type I error" color={C.type1Ink} desc={story?.type1} />
            </tr>
            <tr>
              <th scope="row" className="border border-slate-200 bg-slate-50 p-1.5 text-sm font-semibold text-slate-900 sm:p-2">
                H₁ true
                <div className="text-xs font-normal text-slate-600">{story?.h1 ?? 'real effect'}</div>
                <div className="mt-1 font-mono text-xs text-slate-500">{fmtInt(f.real)} studies</div>
              </th>
              <Cell count={f.fn} rate={1 - power} rateLabel="β" title="Type II error" color={C.type2Ink} desc={story?.type2} />
              <Cell count={f.tp} rate={power} rateLabel="power" title="Correct detection" color={C.powerInk} />
            </tr>
          </tbody>
        </table>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl bg-orange-50 px-3 py-2 ring-1 ring-orange-200">
          <div className="text-xs font-medium text-orange-900">False positive risk — read down the “Reject” column</div>
          <div className="font-mono text-xl font-semibold text-orange-900">{fmtPct(risk.fpr)}</div>
          <div className="text-xs text-orange-900">
            {fmtInt(f.fp)} of {fmtInt(rejections)} significant results are false alarms. This is <em>not</em> α.
          </div>
        </div>
        <div className="rounded-xl bg-sky-50 px-3 py-2 ring-1 ring-sky-200">
          <div className="text-xs font-medium text-sky-900">Among non-significant results, effect was real</div>
          <div className="font-mono text-xl font-semibold text-sky-900">{fmtPct(1 - risk.npv)}</div>
          <div className="text-xs text-sky-900">
            {fmtInt(f.fn)} of {fmtInt(f.fn + f.tn)} “no effect” conclusions are misses.
          </div>
        </div>
      </div>
      {showIcons && (
        <div className="space-y-2">
          <IconArray
            label={`Icon array of ${cohort} studies: ${f.tp} true positives, ${f.fn} false negatives, ${f.fp} false positives, ${f.tn} true negatives.`}
            groups={[
              { count: f.tp, color: C.power, label: 'true positive' },
              { count: f.fp, color: C.type1, label: 'false positive' },
              { count: f.fn, color: C.type2, label: 'false negative', hollow: true },
              { count: f.tn, color: '#CBD5E1', label: 'true negative', hollow: true },
            ]}
          />
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ background: C.power }} /> true positive ({f.tp})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ background: C.type1 }} /> false positive ({f.fp})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm border-2" style={{ borderColor: C.type2 }} /> missed effect ({f.fn})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm border-2 border-slate-300" /> true negative ({f.tn})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
