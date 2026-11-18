import { C } from '../lib/colors';
import { fmt, fmtPct } from '../lib/format';
import { normQuantile, tCdf, tQuantile } from '../stats/distributions';
import { Cite } from '../components/ui/Cite';
import { Callout, Card, Formula } from '../components/ui/layout';
import { Predict } from '../components/ui/Predict';
import { StudyGrid } from '../components/widgets/simulations';
import { AlphaExplorer, SamplingDemo, TvsZ } from '../components/widgets/explorers';

function ConceptTable() {
  const cell = 'border border-slate-200 p-3 align-top text-sm';
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left text-xs font-medium text-slate-500">Truth ↓ · Decision →</th>
            <th className="p-2 text-left text-sm font-semibold">Do not reject H₀</th>
            <th className="p-2 text-left text-sm font-semibold">Reject H₀</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row" className={`${cell} bg-slate-50 text-left font-semibold`}>
              H₀ true <span className="block text-xs font-normal text-slate-500">no effect</span>
            </th>
            <td className={cell}>
              <strong style={{ color: C.correctInk }}>Correct</strong>
              <div className="font-mono text-xs">probability 1 − α</div>
            </td>
            <td className={cell} style={{ background: `${C.type1}12` }}>
              <strong style={{ color: C.type1Ink }}>Type I error</strong> — false positive
              <div className="font-mono text-xs">probability α</div>
            </td>
          </tr>
          <tr>
            <th scope="row" className={`${cell} bg-slate-50 text-left font-semibold`}>
              H₁ true <span className="block text-xs font-normal text-slate-500">effect of size δ</span>
            </th>
            <td className={cell} style={{ background: `${C.type2}12` }}>
              <strong style={{ color: C.type2Ink }}>Type II error</strong> — false negative
              <div className="font-mono text-xs">probability β</div>
            </td>
            <td className={cell} style={{ background: `${C.power}12` }}>
              <strong style={{ color: C.powerInk }}>Correct detection</strong>
              <div className="font-mono text-xs">probability 1 − β = power</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function LessonDecisions() {
  return (
    <div className="prose-lesson">
      <p>
        A study is run to choose between two claims. The <strong>null hypothesis H₀</strong> says there is no effect — the drug lowers blood pressure no more than placebo. The <strong>alternative H₁</strong> says there is one. Data are noisy, so any rule for deciding will sometimes be wrong. A hypothesis test is a decision rule whose error rates are fixed <em>before</em> the data arrive.
      </p>
      <h2>Two truths × two decisions</h2>
      <ConceptTable />
      <Callout kind="key">
        <p>
          Read the table <strong>across rows</strong>. α is the share of H₀-true studies that end in “reject”; power is the share of H₁-true studies that do. Each rate is conditional on a truth you never get to observe.
        </p>
        <p>α and β condition on different rows. They are not complements, and nothing forces them to sum to anything.</p>
      </Callout>
      <h2>Watch the rates emerge</h2>
      <Predict
        kind="estimate"
        prompt="In a world where the drug does nothing, 100 trials are each tested at α = 0.05. How many will reject H₀?"
        min={0}
        max={30}
        step={1}
        format={(v) => String(Math.round(v))}
        actual={5}
        closeEnough={2}
        reveal={
          <p>
            About 5 on average, but a single batch of 100 varies: 98% of batches land between 1 and 10. Every one of those rejections is a false positive — and nothing in the individual study tells you so.
          </p>
        }
      />
      <Card>
        <StudyGrid />
      </Card>
      <h2>The same structure elsewhere</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>
                <span className="sr-only">Outcome</span>
              </th>
              <th>Hypothesis test</th>
              <th>Diagnostic test</th>
              <th>Criminal trial</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ color: C.type1Ink }}>
                <strong>Type I</strong>
              </td>
              <td>declare an effect that is not there</td>
              <td>healthy person tests positive (rate = 1 − specificity)</td>
              <td>innocent person convicted</td>
            </tr>
            <tr>
              <td style={{ color: C.type2Ink }}>
                <strong>Type II</strong>
              </td>
              <td>miss a real effect</td>
              <td>disease missed (rate = 1 − sensitivity)</td>
              <td>guilty person acquitted</td>
            </tr>
            <tr>
              <td style={{ color: C.powerInk }}>
                <strong>Power</strong>
              </td>
              <td>detect a real effect</td>
              <td>sensitivity</td>
              <td>guilty person convicted</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Callout kind="warn">
        <p>
          <strong>“Not guilty” is not “innocent.”</strong> Failing to reject H₀ means the evidence was insufficient — not that H₀ is true. A study can fail to reject because the effect is absent <em>or</em> because the study was too small to see it. Lesson 9 shows how to actually support “no meaningful effect.”
        </p>
      </Callout>
    </div>
  );
}

export function LessonNoise() {
  const dfs = [4, 9, 29, 99];
  const z = -normQuantile(0.025);
  const alpha29 = 2 * tCdf(-z, 29);
  return (
    <div className="prose-lesson">
      <p>
        Individual blood-pressure readings scatter widely (σ ≈ 10–20 mmHg). An <em>average</em> of many readings scatters much less. How much less is the most important number in statistics: the <strong>standard error</strong>.
      </p>
      <Formula caption="σ: SD of individual observations. n: sample size (per group for two groups).">SE(mean) = σ / √n &nbsp;&nbsp;·&nbsp;&nbsp; SE(difference of two group means) = σ·√(2/n)</Formula>
      <Card>
        <SamplingDemo />
      </Card>
      <Predict
        kind="choice"
        prompt="To halve the standard error, multiply the sample size by…"
        options={['2', '4', '8']}
        answer={1}
        reveal={
          <p>
            <strong>4.</strong> SE ∝ 1/√n, so halving it needs √4 = 2. Precision has diminishing returns: the first 100 participants buy far more than the next 100.
          </p>
        }
      />
      <h2>The test statistic is signal ÷ noise</h2>
      <Formula>statistic = (estimate − value under H₀) / SE</Formula>
      <p>
        A statistic of 2 means the estimate sits two standard errors away from what H₀ predicts. Under H₀ the statistic follows a known reference distribution, so we can say how surprising any value would be.
      </p>
      <h2>z or t?</h2>
      <p>
        If σ is <strong>known</strong> from outside the study (for example a manufacturing process with years of data), the statistic is compared with the standard normal: a <strong>z test</strong>. In research σ is almost always <strong>estimated</strong> from the same data by the sample SD <em>s</em>. That extra uncertainty gives the statistic heavier tails: a <strong>t distribution</strong> with df = n − 1 (one group or paired) or 2n − 2 (two groups, pooled).
      </p>
      <Card>
        <TvsZ />
      </Card>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>df</th>
              {dfs.map((d) => (
                <th key={d} className="font-mono">
                  {d}
                </th>
              ))}
              <th>∞ (z)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>two-sided critical value at α = 0.05</td>
              {dfs.map((d) => (
                <td key={d} className="font-mono">
                  {fmt(tQuantile(0.975, d), 3)}
                </td>
              ))}
              <td className="font-mono">{fmt(z, 3)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Callout kind="warn">
        <p>
          <strong>The “n &gt; 30 → use z” rule is obsolete.</strong> Whenever σ is estimated, t is the correct reference at every n; for large n, t and z simply agree. Using z with 30 observations (df = 29) and an estimated σ gives a true Type I error rate of {fmtPct(alpha29)} instead of 5%.
        </p>
      </Callout>
      <Callout kind="practice">
        <p>
          For two independent groups, real analyses should default to <strong>Welch’s t test</strong>, which stays valid when the group variances differ and loses almost nothing when they are equal <Cite k="delacre2017" />. ErrorLab simulates equal-sized groups with equal variances, where Welch’s and Student’s tests nearly coincide. For paired data (before/after on the same people), analyse the differences as one sample: σ is then the SD of the differences, often much smaller.
        </p>
        <p>Both tests assume independent observations and an approximately normal sampling distribution of the mean. The central limit theorem makes the second hold for moderate n unless the data are very skewed or have heavy outliers.</p>
      </Callout>
    </div>
  );
}

export function LessonAlpha() {
  return (
    <div className="prose-lesson">
      <p>
        Before seeing data, decide which test statistics are extreme enough to reject H₀. That set is the <strong>rejection region</strong>, and its probability under H₀ is α. The red area below <em>is</em> α. Drag a handle to change it.
      </p>
      <Card>
        <AlphaExplorer />
      </Card>
      <Predict
        kind="choice"
        prompt="At the same α = 0.05, you switch from a two-sided to a one-sided (greater) test. The upper critical value…"
        options={['moves toward 0', 'stays at 1.96', 'moves away from 0']}
        answer={0}
        reveal={
          <p>
            It moves from 1.96 to 1.645, because all 5% now sits in one tail. The test becomes more sensitive to increases — and completely blind to decreases, however large.
          </p>
        }
      />
      <h2>One-sided or two-sided?</h2>
      <ul>
        <li>Use a one-sided test only if an effect in the other direction would lead to the same action as no effect, and say so in the protocol before seeing data.</li>
        <li>
          Choosing the side after seeing the data doubles the real Type I error rate. Regulators therefore expect two-sided α = 0.05, or one-sided α = 0.025 <Cite k="ich1998" />.
        </li>
      </ul>
      <h2>How small should α be?</h2>
      <p>0.05 is a convention, not a law. Different fields set α by the number of tests they run and the cost of a false claim:</p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Context</th>
              <th>Typical α</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Many research fields</td>
              <td className="font-mono">0.05</td>
              <td>Convention dating to Fisher</td>
            </tr>
            <tr>
              <td>Confirmatory drug trials</td>
              <td className="font-mono">0.05 two-sided / 0.025 one-sided</td>
              <td>
                Regulatory standard <Cite k="ich1998" />
              </td>
            </tr>
            <tr>
              <td>Claims of new discoveries (proposal)</td>
              <td className="font-mono">0.005</td>
              <td>
                p = 0.05 is weak evidence <Cite k="benjamin2018" />
              </td>
            </tr>
            <tr>
              <td>Shewhart control charts</td>
              <td className="font-mono">0.0027 (±3σ)</td>
              <td>
                Hourly testing; false alarms are costly <Cite k="montgomery2019" />
              </td>
            </tr>
            <tr>
              <td>Genome-wide association studies</td>
              <td className="font-mono">5 × 10⁻⁸</td>
              <td>
                ~10⁶ independent tests <Cite k="peer2008" />
              </td>
            </tr>
            <tr>
              <td>Particle physics discovery</td>
              <td className="font-mono">5σ ≈ 2.9 × 10⁻⁷</td>
              <td>
                Many searches, extraordinary claims <Cite k="lyons2013" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Callout kind="key">
        <p>
          <strong>Justify your α.</strong> A smaller α buys fewer false positives at the price of power (unless n grows). Choose α from the costs of each error, how many tests you run and how plausible the hypothesis is <Cite k="lakens2018alpha" />. Lesson 4 shows the price in power.
        </p>
      </Callout>
    </div>
  );
}
