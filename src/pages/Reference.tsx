import { useState } from 'react';
import { Link } from 'react-router';
import { GLOSSARY } from '../content/glossary';
import { LESSON_BY_ID } from '../content/lessons';
import { MISCONCEPTIONS } from '../content/misconceptions';
import { REFERENCES } from '../content/references';
import { fmt, fmtP, fmtPct } from '../lib/format';
import { bayesFactorBound, confidenceInterval, falsePositiveRisk, pValue, rejectionProbability, requiredN, sValue, type Design } from '../stats/design';
import { familyWiseErrorRate } from '../stats/multiple';
import { normQuantile, tQuantile } from '../stats/distributions';
import { Cite } from '../components/ui/Cite';
import { Card, Formula } from '../components/ui/layout';

const SECTIONS = [
  { id: 'glossary', label: 'Glossary' },
  { id: 'formulas', label: 'Formulas' },
  { id: 'misconceptions', label: 'Misconceptions' },
  { id: 'checklists', label: 'Checklists' },
  { id: 'sources', label: 'Sources' },
];

// Worked example used across the formula cards: a two-arm BP trial.
const ex: Design = { design: 'two-sample', test: 't', alternative: 'two-sided', alpha: 0.05, n: 100, delta: -4, sigma: 15 };
const exSe = ex.sigma * Math.sqrt(2 / ex.n);
const exT = ex.delta / exSe;
const exDf = 2 * ex.n - 2;
const exP = pValue(exT, ex);
const exCi = confidenceInterval(ex.delta, exSe, exDf, 0.95);
const exPower = rejectionProbability({ ...ex, delta: -5 });
const exN = requiredN({ ...ex, delta: -5 }, 0.8)!;
const z975 = -normQuantile(0.025);
const z80 = -normQuantile(0.2);

const FORMULAS: { name: string; formula: string; where: string; example: string; refs?: string[] }[] = [
  { name: 'Standard error', formula: 'SE = σ/√n (one group, paired)   ·   SE = σ·√(2/n) (two groups of n)', where: 'σ = SD of observations (of differences, if paired)', example: `σ = 15 mmHg, 100 per arm: SE = 15·√(2/100) = ${fmt(exSe, 2)} mmHg.` },
  { name: 'Test statistic', formula: 't (or z) = (estimate − value under H₀) / SE', where: 'df = n − 1 (one group) or 2n − 2 (two groups, pooled)', example: `Observed difference −4 mmHg: t = −4 / ${fmt(exSe, 2)} = ${fmt(exT, 2)}, df = ${exDf}.` },
  { name: 'Two-sided p-value', formula: 'p = 2 · P(T ≥ |t_obs|)  under H₀', where: 'One-sided: P(T ≥ t_obs) or P(T ≤ t_obs), chosen in advance', example: `t = ${fmt(exT, 2)} with ${exDf} df: p = ${fmtP(exP)}.`, refs: ['asa2016'] },
  { name: 'Confidence interval', formula: 'estimate ± t*(1−α/2, df) · SE', where: 'Excludes 0 exactly when the two-sided p < α', example: `95% CI: −4 ± ${fmt(tQuantile(0.975, exDf), 3)} × ${fmt(exSe, 2)} = [${fmt(exCi[0], 2)}, ${fmt(exCi[1], 2)}] mmHg.`, refs: ['greenland2016'] },
  { name: 'Standardised effect (Cohen’s d)', formula: 'd = δ / σ', where: 'δ = true mean difference', example: '5 mmHg with σ = 15 mmHg: d = 0.33.', refs: ['cohen1988', 'funder2019'] },
  { name: 'Noncentrality', formula: 'λ = δ / SE = d·√(n/2) (two groups)  ·  d·√n (one group)', where: 'Centre of the statistic’s distribution under H₁', example: `δ = −5, SE = ${fmt(exSe, 2)}: λ = ${fmt(-5 / exSe, 2)}.` },
  { name: 'Power', formula: 'z test: Φ(λ − z₁₋α/₂) + Φ(−λ − z₁₋α/₂)   ·   t test: P(T′ ≥ t*) + P(T′ ≤ −t*), T′ ~ noncentral t(df, λ)', where: 'Φ = standard normal CDF; t* = critical value', example: `100 per arm, δ = −5 mmHg, σ = 15: power = ${fmtPct(exPower)} (exact t).` },
  { name: 'Sample size (normal approximation)', formula: 'n per group = 2 (z₁₋α/₂ + z₁₋β)² / d²   (one group: drop the 2)', where: `z₁₋α/₂ = ${fmt(z975, 3)} for α = 0.05; z₁₋β = ${fmt(z80, 3)} for 80% power`, example: `d = 0.33: 2(${fmt(z975, 2)} + ${fmt(z80, 2)})²/0.333² ≈ ${Math.ceil((2 * (z975 + z80) ** 2) / (1 / 3) ** 2)}; exact t test: ${exN} per group.`, refs: ['lakens2022'] },
  { name: 'False positive risk', formula: 'FPR = α(1 − π) / [α(1 − π) + power·π]', where: 'π = prior probability that H₁ is true', example: `α = 0.05, power 80%, π = 10%: FPR = ${fmtPct(falsePositiveRisk(0.05, 0.8, 0.1).fpr, 0)}.`, refs: ['colquhoun2014', 'ioannidis2005'] },
  { name: 'Family-wise error rate', formula: 'FWER = 1 − (1 − α)ᵐ   ·   Bonferroni: test each at α/m', where: 'm independent tests of true nulls', example: `m = 20 at α = 0.05: FWER = ${fmtPct(familyWiseErrorRate(20, 0.05), 0)}; Bonferroni threshold 0.0025.`, refs: ['holm1979', 'bh1995'] },
  { name: 'Type M and Type S errors', formula: 'exaggeration = E(|estimate| | significant) / |δ|   ·   Type S = P(wrong sign | significant)', where: 'Computed from estimate ~ N(δ, SE²)', example: 'At 20% power: about 2.3× exaggeration; at 10%: about 3.7×.', refs: ['gelman2014'] },
  { name: 'Equivalence (TOST)', formula: 'equivalent if the (1 − 2α) CI ⊂ (−Δ, +Δ)  ⇔  max(p_lower, p_upper) ≤ α', where: 'Δ = pre-specified equivalence margin', example: 'Bioequivalence: 90% CI of the geometric mean ratio within 80–125%.', refs: ['schuirmann1987', 'fda2001'] },
  { name: 'S-value and Bayes factor bound', formula: 's = −log₂ p   ·   BF₁₀ ≤ 1 / (−e · p · ln p)  (p < 1/e)', where: 'Bits of surprise; maximum evidence for H₁', example: `p = 0.05: s = ${fmt(sValue(0.05), 1)} bits, BF ≤ ${fmt(bayesFactorBound(0.05), 2)}.`, refs: ['rafi2020', 'sellke2001'] },
];

const CHECKLISTS: { title: string; items: string[] }[] = [
  {
    title: 'Before the study',
    items: [
      'State H₀ and H₁ in terms of a parameter and a primary outcome.',
      'Choose the smallest effect size of interest and justify it.',
      'Justify α and sidedness; account for multiple primary tests and interim looks.',
      'Compute the sample size from the effect, σ (with its source), α and power; inflate for attrition.',
      'Pre-register the hypotheses, outcome, analysis and stopping rule.',
    ],
  },
  {
    title: 'Reading a result',
    items: [
      'What is the estimate, in real units, and its confidence interval?',
      'Which effects does the interval rule out — and does it include effects that matter?',
      'Was this the pre-specified analysis and outcome? How many were tried?',
      'How plausible was the hypothesis, and how powerful the study? (false positive risk)',
      'Small study, big significant effect? Expect exaggeration; look for replications or a meta-analysis.',
      'A “no difference” claim needs an equivalence test or a narrow interval, not p > 0.05.',
    ],
  },
  {
    title: 'Reporting',
    items: [
      'Estimate with CI in meaningful units.',
      'Exact p-value and the test used (e.g. Welch’s t, two-sided).',
      'Sample-size justification.',
      'All analyses performed, multiplicity handling, deviations from the plan.',
      'Assumption checks and data availability.',
    ],
  },
];

export default function Reference() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const glossary = GLOSSARY.filter((g) => !q || `${g.term} ${g.symbol ?? ''} ${g.definition} ${g.confusion ?? ''}`.toLowerCase().includes(q)).sort((a, b) => a.term.localeCompare(b.term));
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reference</h1>
      <nav className="mt-3 flex flex-wrap gap-2" aria-label="Reference sections">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="rounded-full bg-white px-3 py-1 text-sm text-slate-700 ring-1 ring-slate-300 hover:ring-slate-500">
            {s.label}
          </a>
        ))}
      </nav>

      <section id="glossary" className="mt-8">
        <h2 className="text-2xl font-semibold text-slate-900">Glossary</h2>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter terms…" aria-label="Filter glossary" className="mt-3 w-full max-w-sm rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {glossary.map((g) => (
            <div key={g.term} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <dt className="font-semibold text-slate-900">
                {g.term} {g.symbol && <span className="font-mono text-sm font-normal text-slate-500">({g.symbol})</span>}
              </dt>
              <dd className="mt-1 space-y-1 text-sm leading-relaxed text-slate-700">
                <p>
                  {g.definition} {g.refs && <Cite k={g.refs} />}
                </p>
                {g.confusion && <p className="text-orange-900">⚠ {g.confusion}</p>}
                {g.lesson && (
                  <p>
                    <Link to={`/learn/${g.lesson}`} className="text-xs text-blue-700 underline">
                      Lesson: {LESSON_BY_ID[g.lesson]?.title}
                    </Link>
                  </p>
                )}
              </dd>
            </div>
          ))}
          {glossary.length === 0 && <p className="text-sm text-slate-500">No matching terms.</p>}
        </dl>
      </section>

      <section id="formulas" className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Formulas</h2>
        <p className="mt-1 text-sm text-slate-600">Worked examples use a two-arm blood-pressure trial and are computed live by the same code that runs the simulations.</p>
        <div className="mt-4 space-y-3">
          {FORMULAS.map((f) => (
            <Card key={f.name} title={f.name}>
              <Formula>{f.formula}</Formula>
              <p className="text-sm text-slate-600">{f.where}</p>
              <p className="mt-1 text-sm text-slate-800">
                <strong>Example:</strong> {f.example} {f.refs && <Cite k={f.refs} />}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section id="misconceptions" className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Misconceptions</h2>
        <p className="mt-1 text-sm text-slate-600">
          Drawn mainly from Greenland et al.’s catalogue of misinterpretations <Cite k="greenland2016" />.
        </p>
        <div className="mt-4 space-y-3">
          {MISCONCEPTIONS.map((m) => (
            <div key={m.claim} className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
              <p className="font-semibold text-orange-900">✗ {m.claim}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-800">
                <span className="font-semibold text-emerald-800">✓ </span>
                {m.reality} <Cite k={m.refs} />
              </p>
              {m.tryIt && (
                <Link to={m.tryIt.to} className="mt-2 inline-block text-xs font-medium text-blue-700 underline">
                  See it: {m.tryIt.label} →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="checklists" className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Checklists</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {CHECKLISTS.map((c) => (
            <Card key={c.title} title={c.title}>
              <ul className="space-y-1.5 text-sm text-slate-700">
                {c.items.map((i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="mt-0.5 text-slate-400">
                      ☐
                    </span>
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section id="sources" className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Sources</h2>
        <ol className="mt-4 space-y-3">
          {REFERENCES.map((r) => (
            <li key={r.key} id={`ref-${r.key}`} className="scroll-mt-20 rounded-xl bg-white p-3 text-sm ring-1 ring-slate-200 target:ring-2 target:ring-blue-500">
              <p className="text-slate-800">
                {r.citation}{' '}
                <a href={r.url} target="_blank" rel="noreferrer" className="break-all text-blue-700 underline">
                  {r.url.replace(/^https?:\/\//, '')}
                </a>
              </p>
              <p className="mt-1 text-xs text-slate-500">Used for: {r.note}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
