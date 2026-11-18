import { Link } from 'react-router';
import { fmt, fmtPct } from '../lib/format';
import { familyWiseErrorRate } from '../stats/multiple';
import { normQuantile, normSf } from '../stats/distributions';
import { signAndMagnitude, rejectionProbability, type Design } from '../stats/design';
import { Cite } from '../components/ui/Cite';
import { Callout, Card, Formula } from '../components/ui/layout';
import { Predict } from '../components/ui/Predict';
import { ExaggerationSim, MultipleTests, PeekingSim } from '../components/widgets/simulations';
import { ObservedPowerChart, SampleSizeMini, TostExplorer } from '../components/widgets/explorers';

/** z design with a requested power (two-sided, α = .05), for the exaggeration table. */
function designForPower(power: number): Design {
  const c = -normQuantile(0.025);
  let lo = 0;
  let hi = 10;
  for (let i = 0; i < 80; i++) {
    const m = (lo + hi) / 2;
    if (normSf(c - m) + normSf(c + m) < power) lo = m;
    else hi = m;
  }
  return { design: 'one-sample', test: 'z', alternative: 'two-sided', alpha: 0.05, n: 1, delta: hi, sigma: 1 };
}

export function LessonExaggeration() {
  const sim: Design = { design: 'two-sample', test: 't', alternative: 'two-sided', alpha: 0.05, n: 20, delta: 0.3, sigma: 1 };
  const smSim = signAndMagnitude(sim)!;
  const rows = [0.08, 0.1, 0.2, 0.3, 0.5, 0.8].map((p) => ({ p, sm: signAndMagnitude(designForPower(p))! }));
  return (
    <div className="prose-lesson">
      <p>
        Every estimate is the true effect plus noise. When the noise (SE) is large relative to the effect, only estimates that happen to be <em>far</em> from zero reach significance. Filter on p ≤ α, and you have selected the lucky overestimates. Gelman and Carlin call the result a <strong>Type M (magnitude) error</strong>, measured by the <strong>exaggeration ratio</strong>, and a <strong>Type S (sign) error</strong> when the significant estimate points the wrong way <Cite k="gelman2014" />.
      </p>
      <Predict
        kind="estimate"
        prompt={`True effect d = 0.3, 20 per group (power ${fmtPct(rejectionProbability(sim), 0)}). Significant estimates will average how many times the true effect?`}
        min={1}
        max={5}
        step={0.1}
        format={(v) => `${v.toFixed(1)}×`}
        actual={Number(smSim.exaggeration.toFixed(1))}
        closeEnough={0.4}
        reveal={<p>About {fmt(smSim.exaggeration, 1)}×. A study that “found” d ≈ {fmt(0.3 * smSim.exaggeration, 2)} is typical of what reaches significance here, even though the truth is 0.3.</p>}
      />
      <Card>
        <ExaggerationSim />
      </Card>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Power</th>
              {rows.map((r) => (
                <th key={r.p} className="font-mono">
                  {fmtPct(r.p, 0)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Exaggeration ratio</td>
              {rows.map((r) => (
                <td key={r.p} className="font-mono">
                  {fmt(r.sm.exaggeration, 1)}×
                </td>
              ))}
            </tr>
            <tr>
              <td>Type S (wrong sign | significant)</td>
              {rows.map((r) => (
                <td key={r.p} className="font-mono">
                  {fmtPct(r.sm.typeS, 1)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">Two-sided test at α = 0.05, normal approximation (Gelman & Carlin 2014).</p>
      <Callout kind="evidence">
        <p>
          When 100 psychology studies were replicated with high power, 97% of originals but only 36% of replications were significant, and replication effect sizes were on average about half the original ones <Cite k="osc2015" />. Exaggeration under low power predicts this shrinkage without assuming any misconduct.
        </p>
      </Callout>
      <Callout kind="practice">
        <ul>
          <li>Do not plan a sample size from a small study’s significant estimate; use the smallest effect worth detecting or a conservative estimate from a meta-analysis.</li>
          <li>Report estimates with intervals whether or not they are significant, so that meta-analyses are not built only from winners.</li>
          <li>Treat a large effect from a small, significant study as an upper-end guess until replicated.</li>
        </ul>
      </Callout>
    </div>
  );
}

export function LessonMultiplicity() {
  const ms = [1, 5, 10, 20, 50, 100];
  return (
    <div className="prose-lesson">
      <p>
        α is a promise about <em>one</em> pre-planned test. Every additional look at the data, outcome, subgroup or analysis is another chance for noise to cross the line. These multiply quietly.
      </p>
      <h2>Peeking: optional stopping</h2>
      <Predict
        kind="estimate"
        prompt="No true effect. You test after every fifth of the planned sample (5 looks) and stop as soon as p < 0.05. What is the overall false positive rate?"
        min={0}
        max={50}
        step={1}
        format={(v) => `${Math.round(v)}%`}
        actual={14}
        closeEnough={4}
        reveal={
          <p>
            About 14% — nearly three times the nominal 5% <Cite k="armitage1969" />. With unlimited looks it approaches 100%. Reproduce it below: max n = 100, check every 20.
          </p>
        }
      />
      <Card>
        <PeekingSim />
      </Card>
      <Callout kind="practice">
        <ul>
          <li>Fix the sample size in advance and test once; or</li>
          <li>
            use a <strong>group-sequential design</strong> with pre-planned interim analyses and stricter thresholds at each look (Pocock; O’Brien–Fleming) <Cite k={['pocock1977', 'obrien1979']} />; or
          </li>
          <li>
            for continuously monitored A/B tests, use <strong>always-valid</strong> sequential tests designed for peeking <Cite k="johari2017" />.
          </li>
        </ul>
      </Callout>
      <h2>Many tests</h2>
      <Formula caption="m independent tests of true null hypotheses, each at level α.">P(at least one false positive) = 1 − (1 − α)ᵐ</Formula>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>tests m</th>
              {ms.map((m) => (
                <th key={m} className="font-mono">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>FWER at α = 0.05</td>
              {ms.map((m) => (
                <td key={m} className="font-mono">
                  {fmtPct(familyWiseErrorRate(m, 0.05), 0)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <Card>
        <MultipleTests />
      </Card>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Method</th>
              <th>Rule</th>
              <th>Controls</th>
              <th>Use when</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Bonferroni</td>
              <td>reject if p ≤ α/m</td>
              <td>FWER</td>
              <td>A few confirmatory tests; simple to explain</td>
            </tr>
            <tr>
              <td>
                Holm <Cite k="holm1979" />
              </td>
              <td>sort p; compare the k-th smallest with α/(m − k + 1); stop at the first failure</td>
              <td>FWER</td>
              <td>Always at least as powerful as Bonferroni — prefer it</td>
            </tr>
            <tr>
              <td>
                Benjamini–Hochberg <Cite k="bh1995" />
              </td>
              <td>largest k with p₍ₖ₎ ≤ (k/m)·q; reject the k smallest</td>
              <td>FDR</td>
              <td>Screening many hypotheses for follow-up (genes, features, metrics)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Callout kind="warn" title="The garden of forking paths">
        <p>
          Multiplicity is not only about the tests you report. Choosing among outcomes, covariates, exclusion rules or subgroups <em>after</em> seeing the data has the same effect: combining four common flexibilities pushed false-positive rates to about 61% in simulations <Cite k="simmons2011" />. Pre-register the hypothesis, primary outcome and analysis plan; label everything else exploratory.
        </p>
      </Callout>
    </div>
  );
}

export function LessonDesign() {
  return (
    <div className="prose-lesson">
      <h2>1. Start from the effect that matters</h2>
      <p>
        Choose the <strong>smallest effect size of interest</strong> (SESOI): the smallest effect that would change practice, such as a minimal clinically important difference. Design the study to detect that, not the effect you hope for <Cite k="lakens2022" />. Judge effect sizes against their context; Cohen’s small/medium/large labels are a last resort <Cite k={['cohen1988', 'funder2019']} />.
      </p>
      <Formula caption="Normal approximation, two groups, two-sided. ErrorLab’s calculators solve the exact noncentral-t version.">n per group ≈ 2·(z₁₋α/₂ + z₁₋β)² · σ² / δ²</Formula>
      <Card>
        <SampleSizeMini />
      </Card>
      <p>
        If the feasible n is fixed by budget, run the calculation backwards: which effect could this study detect with 80% power (the <strong>minimum detectable effect</strong>)? If that effect is implausibly large, the study is not worth running as planned. The <Link to="/plan">sample-size planner</Link> does both.
      </p>
      <h2>2. Do not compute “observed power”</h2>
      <p>
        Plugging the observed effect into a power formula after the study gives a number that is a fixed function of the p-value — at p = 0.05 it is always about 50% — and adds no information <Cite k="hoenig2001" />. Use the confidence interval to see which effects the data rule out.
      </p>
      <Card>
        <ObservedPowerChart />
      </Card>
      <h2>3. To claim “no meaningful effect”, test for equivalence</h2>
      <p>
        A non-significant difference is compatible with large effects in a small study. To support “no meaningful difference”, pre-specify a margin ±Δ and run <strong>two one-sided tests</strong> (TOST): equivalence is shown when the 90% CI (for α = 0.05) lies entirely within the margin <Cite k={['schuirmann1987', 'lakens2017']} />. Regulators require exactly this for generic drugs: the 90% CI of the ratio of means within 80–125% <Cite k="fda2001" />.
      </p>
      <Card>
        <TostExplorer />
      </Card>
      <h2>4. Report so others can judge</h2>
      <ul>
        <li>The pre-registered hypothesis, primary outcome and analysis plan, and any deviations.</li>
        <li>The sample-size justification (effect, σ, α, power, dropout).</li>
        <li>The estimate with its confidence interval, in meaningful units.</li>
        <li>The exact p-value (not “p &lt; 0.05” or “n.s.”) and the test used.</li>
        <li>Every analysis performed, and how multiplicity was handled.</li>
      </ul>
      <Callout kind="key">
        <p>
          A good study is one whose result is informative either way. That requires adequate power for a meaningful effect, a pre-specified analysis, and reporting that shows magnitude and uncertainty <Cite k={['asa2016', 'asa2019']} />.
        </p>
      </Callout>
    </div>
  );
}
