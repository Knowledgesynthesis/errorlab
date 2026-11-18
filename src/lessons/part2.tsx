import { C } from '../lib/colors';
import { fmt, fmtPct, fmtSig } from '../lib/format';
import { bayesFactorBound, falsePositiveRisk, rejectionProbability, sValue, type Design } from '../stats/design';
import { Cite } from '../components/ui/Cite';
import { Callout, Card, Formula } from '../components/ui/layout';
import { Predict } from '../components/ui/Predict';
import { ManyStudies, OneStudy, PDance } from '../components/widgets/simulations';
import { FprExplorer, PowerExplorer } from '../components/widgets/explorers';

const base: Design = { design: 'two-sample', test: 't', alternative: 'two-sided', alpha: 0.05, n: 50, delta: 0.3, sigma: 1 };
const pct = (x: number) => Math.round(x * 100);

export function LessonPower() {
  const p1 = rejectionProbability(base);
  const p2 = rejectionProbability({ ...base, n: 200 });
  const p3 = rejectionProbability({ ...base, alpha: 0.01 });
  return (
    <div className="prose-lesson">
      <p>
        If H₁ is true with effect δ, the test statistic is no longer centred on 0. It is centred near <strong>λ = δ / SE</strong>, the noncentrality. <strong>Power</strong> is the share of the H₁ curve that falls in the rejection region; <strong>β</strong> is the rest.
      </p>
      <Formula caption="Two groups of n each: λ = d·√(n/2), with d = δ/σ. The approximation ignores the negligible opposite tail; ErrorLab computes power exactly (noncentral t).">power ≈ Φ(λ − z₁₋α/₂)</Formula>
      <Predict
        kind="estimate"
        prompt="Two groups of 50, true effect d = 0.3, two-sided α = 0.05. Guess the power."
        min={0}
        max={100}
        step={1}
        format={(v) => `${Math.round(v)}%`}
        actual={pct(p1)}
        closeEnough={8}
        reveal={<p>Exact power is {fmtPct(p1)}: an effect of d = 0.3 with 50 per group is missed about two times in three.</p>}
      />
      <Card>
        <PowerExplorer initial={base} />
      </Card>
      <Predict
        kind="estimate"
        prompt="Keep d = 0.3 and α = 0.05, but use 200 per group. Power now?"
        min={0}
        max={100}
        step={1}
        format={(v) => `${Math.round(v)}%`}
        actual={pct(p2)}
        closeEnough={8}
        reveal={<p>{fmtPct(p2)}. Four times the data doubles λ. Check it on the chart above by setting n = 200.</p>}
      />
      <Predict
        kind="estimate"
        prompt="Back to 50 per group, but α tightened from 0.05 to 0.01. Power now?"
        min={0}
        max={100}
        step={1}
        format={(v) => `${Math.round(v)}%`}
        actual={pct(p3)}
        closeEnough={6}
        reveal={<p>{fmtPct(p3)}, down from {fmtPct(p1)}. Fewer false positives cost more misses unless n increases.</p>}
      />
      <h2>The levers</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Lever</th>
              <th>Effect on power</th>
              <th>How to pull it in practice</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>True effect δ ↑</td>
              <td>↑ (cannot be chosen)</td>
              <td>Stronger intervention, adequate dose, outcome closest to the mechanism</td>
            </tr>
            <tr>
              <td>Noise σ ↓</td>
              <td>↑ (n ∝ σ²)</td>
              <td>Reliable measurement, paired/crossover designs, covariate adjustment for baseline</td>
            </tr>
            <tr>
              <td>Sample size n ↑</td>
              <td>↑ (λ ∝ √n)</td>
              <td>More participants, longer follow-up, pooling sites</td>
            </tr>
            <tr>
              <td>α ↑</td>
              <td>↑, at the cost of more false positives</td>
              <td>Only with a justification of error costs</td>
            </tr>
            <tr>
              <td>One-sided test</td>
              <td>↑ in one direction, zero in the other</td>
              <td>Only when pre-specified and the other direction is irrelevant</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Callout kind="evidence">
        <p>
          The 80% convention comes from Cohen, who suggested β = 0.20 alongside α = 0.05 — treating a false positive as roughly four times as costly as a miss <Cite k="cohen1988" />. Many literatures fall far short: the median power of neuroscience studies was estimated at about 21% <Cite k="button2013" />. Lessons 6 and 7 show why that undermines even the significant results.
        </p>
      </Callout>
      <Callout kind="key">
        <p>
          Power belongs to a <strong>design and an assumed effect</strong>, computed before the data. Once the study is done, the confidence interval tells you what it could and could not rule out.
        </p>
      </Callout>
    </div>
  );
}

export function LessonPValues() {
  const ps = [0.1, 0.05, 0.01, 0.005, 0.001];
  return (
    <div className="prose-lesson">
      <Formula caption="Computed assuming H₀ and every other assumption of the model (independence, the chosen analysis, no selective reporting).">p = P(a statistic at least as extreme as the one observed | H₀ and model)</Formula>
      <p>
        A p-value measures how surprising the data would be if the null model were true. Small p: the data sit in the tail of the null distribution. That is all — but it is a useful all. Run single studies and watch where the statistic lands.
      </p>
      <Card>
        <OneStudy />
      </Card>
      <h2>p-values are random variables</h2>
      <Predict
        kind="estimate"
        prompt="H₀ is true. You run 1,000 studies. What share will have p < 0.20?"
        min={0}
        max={100}
        step={1}
        format={(v) => `${Math.round(v)}%`}
        actual={20}
        closeEnough={4}
        reveal={<p>20%. Under H₀ p-values are uniform: P(p ≤ x) = x for every x. That is exactly why rejecting at p ≤ α gives a Type I error rate of α.</p>}
      />
      <Card>
        <ManyStudies />
      </Card>
      <h2>The dance of the p-values</h2>
      <p>
        Repeat the same experiment, with the same true effect, twenty times. The p-values jump around far more than most researchers expect <Cite k="cumming2008" />. The intervals are more informative: their positions vary, but each shows the range of effects compatible with its data.
      </p>
      <Card>
        <PDance />
      </Card>
      <h2>Two better scales for the same number</h2>
      <p>
        The <strong>S-value</strong> s = −log₂(p) converts p into bits of surprise against H₀: p = 0.05 carries 4.3 bits — about as surprising as four heads in a row from a fair coin <Cite k="rafi2020" />. The <strong>Bayes factor bound</strong> 1/(−e·p·ln p) is the most evidence for H₁ over H₀ that a p-value can represent under any reasonable prior on the effect <Cite k="sellke2001" />.
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>p</th>
              {ps.map((p) => (
                <th key={p} className="font-mono">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>S-value (bits)</td>
              {ps.map((p) => (
                <td key={p} className="font-mono">
                  {fmt(sValue(p), 1)}
                </td>
              ))}
            </tr>
            <tr>
              <td>max. Bayes factor for H₁</td>
              {ps.map((p) => (
                <td key={p} className="font-mono">
                  {fmtSig(bayesFactorBound(p), 3)} : 1
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <h2>What the American Statistical Association says</h2>
      <ol>
        <li>p-values can indicate how incompatible the data are with a specified statistical model.</li>
        <li>They do not measure the probability that the studied hypothesis is true, or the probability that the data were produced by random chance alone.</li>
        <li>Conclusions and decisions should not rest only on whether p passes a threshold.</li>
        <li>Proper inference requires full reporting and transparency.</li>
        <li>A p-value, or statistical significance, does not measure the size of an effect or the importance of a result.</li>
        <li>By itself, a p-value is not a good measure of evidence about a model or hypothesis.</li>
      </ol>
      <p>
        <Cite k="asa2016" /> A 2021 ASA task force added the other half: p-values and significance tests, properly applied and interpreted, increase the rigour of conclusions and should not be abandoned <Cite k="asa2021" />.
      </p>
      <Callout kind="warn">
        <ul>
          <li>p is not the probability that H₀ is true.</li>
          <li>p is not the probability the result is “due to chance.”</li>
          <li>1 − p is not the probability the result will replicate.</li>
          <li>p does not measure effect size or importance.</li>
          <li>
            A significant and a non-significant result do not show that two effects differ — compare them directly <Cite k="gelman2006" />.
          </li>
        </ul>
      </Callout>
    </div>
  );
}

export function LessonFpr() {
  const f = falsePositiveRisk(0.05, 0.8, 0.1);
  const postH0 = 1 / (1 + bayesFactorBound(0.05));
  return (
    <div className="prose-lesson">
      <p>
        α answers: <em>if H₀ is true, how often will I reject?</em> The question you usually care about is the reverse: <em>if I rejected, how likely is it that H₀ was true?</em> That needs one more ingredient — the <strong>prior</strong>, the share of tested hypotheses that are actually true.
      </p>
      <Predict
        kind="estimate"
        prompt="A field tests hypotheses of which 10% are true, with 80% power and α = 0.05. What share of its significant results are false positives?"
        min={0}
        max={100}
        step={1}
        format={(v) => `${Math.round(v)}%`}
        actual={pct(f.fpr)}
        closeEnough={6}
        reveal={
          <p>
            {fmtPct(f.fpr, 0)}. Per 1,000 hypotheses: 100 true × 80% = 80 true positives; 900 null × 5% = 45 false positives; 45 / 125 = 36% <Cite k="colquhoun2014" />.
          </p>
        }
      />
      <p>Counting cases — “natural frequencies” — makes this reasoning far easier than manipulating conditional probabilities <Cite k="gigerenzer1995" />. Move the sliders:</p>
      <Card>
        <FprExplorer />
      </Card>
      <Formula caption="π = prior probability that H₁ is true.">false positive risk = α(1 − π) / [α(1 − π) + power · π]</Formula>
      <ul>
        <li>
          <strong>Low power hurts twice</strong>: more real effects are missed, and the significant results that remain are less trustworthy <Cite k="button2013" />.
        </li>
        <li>
          <strong>Bias makes it worse.</strong> Selective reporting and flexible analysis raise the effective α above its nominal value, inflating the false positive risk further <Cite k="ioannidis2005" />.
        </li>
        <li>
          <strong>p just under 0.05 is weaker than “p ≤ 0.05”.</strong> The table above pools all significant results. For a result with p ≈ 0.05 specifically, the Bayes factor bound implies that even at 50:50 prior odds, P(H₀ | data) is at least {fmtPct(postH0, 0)} <Cite k="sellke2001" />.
        </li>
      </ul>
      <Callout kind="practice" title="Same logic, different field">
        <p>
          A screening test with 80% sensitivity and 95% specificity for a condition with 1% prevalence: per 10,000 people, 80 true positives and 495 false positives. Only {fmtPct(80 / 575, 0)} of positives have the condition. Sensitivity ↔ power, 1 − specificity ↔ α, prevalence ↔ prior.
        </p>
      </Callout>
      <Callout kind="key">
        <p>
          The false positive risk is a property of a <strong>body of studies</strong>, not of one result. In practice the prior is uncertain: compute the risk across a range of plausible priors, and treat surprising single findings as needing replication.
        </p>
      </Callout>
      <p className="text-sm" style={{ color: C.axis }}>
        Also called the false discovery proportion; for individual results Colquhoun uses “false positive risk.”
      </p>
    </div>
  );
}
