# ErrorLab

Learn hypothesis testing by running the experiments yourself: Type I and Type II errors, power, p-values, false positive risk, exaggerated effects, peeking, multiple testing, equivalence tests and sample-size planning. Every number is computed exactly and every claim links to its source.

## What's inside

| Section | What it does |
| --- | --- |
| **Learn** | Nine lessons (~90 min total). Each has a live simulation, "predict, then reveal" tasks and end-of-lesson checks with feedback on every option. Progress is saved in the browser. |
| **Mastery test** | 15 applied questions across all lessons, in mixed order; 80% counts as mastery. |
| **Decision Lab** | Every lever of a test (design, z/t, sidedness, α, n, δ, σ, prior) in one place: H₀/H₁ distributions with α, β and power shaded, a draggable critical value, the 2×2 table in natural frequencies, false positive risk, Type S/M errors, A/B comparison and shareable URLs. |
| **Simulations** | One study, the p-value distribution, the dance of p-values, exaggeration, optional stopping, and Bonferroni / Holm / Benjamini–Hochberg. |
| **Sample-size planner** | Exact n for a target power, attrition, minimum detectable effect, power curves (vs n or d) and a copy-ready justification sentence. |
| **Cases** | A blood-pressure RCT, an A/B test, a Shewhart control chart and a bioequivalence (TOST) study, each with design rationale and sources. |
| **Reference** | Searchable glossary, formulas with live worked examples, 16 misconceptions, checklists, and 46 sources with DOIs or links. |

### The lessons

1. Two truths, two decisions: the 2×2 table
2. Signal, noise and the standard error: z vs t
3. α and the rejection region: choosing and justifying α
4. Power and β: the four levers
5. What a p-value is — and isn't: S-values, Bayes factor bound, ASA principles
6. Significant is not the same as true: false positive risk
7. Underpowered studies exaggerate: Type M and Type S errors
8. Peeking and multiple tests: optional stopping, FWER, FDR
9. Design and report a study: SESOI, sample size, observed-power fallacy, TOST, reporting

## Correctness

The statistics engine (`src/stats`) is tested against SciPy reference values (`npm test`):

- Normal CDF/quantile accurate to better than 1e-12 relative (typically ~1e-15), including far tails; noncentral t to ~1e-8.
- Student t CDF and quantile for any df (no large-df normal shortcut).
- **Power for t tests uses the noncentral t distribution**, not a shifted central t.
- Sample sizes reproduce standard tables (e.g. d = 0.5, 80% power, α = .05 → 64 per group).
- Simulations draw studies exactly from their sufficient statistics and are tested against theory (rejection rate = α under H₀, = power under H₁; uniform p-values; Armitage's ≈14% error rate for five looks).
- Type S/M errors reproduce Gelman & Carlin (2014); the false positive risk reproduces Colquhoun's (2014) 36% example.

Content tests check that every citation resolves to a listed source, every multiple-choice question has exactly one correct answer with feedback for each option, and numeric answers agree with the engine. Every page and lesson is render-tested. The UI passes axe-core WCAG 2.2 AA checks.

## Teaching approach

- **Predict, then reveal** before each demonstration (Crouch et al. 2004).
- **Retrieval practice** at the end of every lesson (Roediger & Karpicke 2006; Dunlosky et al. 2013).
- **Interleaved** mastery test (Rohrer & Taylor 2007).
- **Natural frequencies** for conditional probabilities (Gigerenzer & Hoffrage 1995).
- **Simulation-based inference** (GAISE 2016).
- Colour-blind-safe palette (Okabe–Ito); every control is keyboard-operable.

## Run it

Requires Node.js 22.12+.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # stats, content and render tests
npm run lint
npm run build      # type-check + production build in dist/
npm run check      # lint + test + build
```

Deploys as a static single-page app; `vercel.json` rewrites all routes to `index.html`.

## Project structure

```
src/
├── stats/          # distributions, design/power, simulation, multiplicity, TOST (+ tests)
├── content/        # lessons metadata, questions, cases, glossary, misconceptions, references (+ tests)
├── lessons/        # lesson bodies (part1–3) and registry
├── components/
│   ├── charts/     # SVG charts: distributions, lines, histograms, icon arrays, CI stacks…
│   ├── widgets/    # interactive explorers and simulations used by lessons and pages
│   └── ui/         # controls, layout, quiz, predict-reveal, citations
├── pages/          # Home, Learn, LessonPage, Mastery, Lab, Simulate, Plan, Cases, Reference
└── lib/            # formatting, colours, progress storage
```

Stack: React 19, React Router 7, TypeScript 6, Vite 8, Tailwind CSS 4, Vitest. Charts are hand-written SVG (no chart library).

## Scope

ErrorLab models tests of one mean (or paired differences) and of two independent means with equal group sizes and a common σ. For real two-group analyses use Welch's t test, and for other designs (proportions with small n, unequal groups, clustering, survival) use dedicated software.

## Contributing

Corrections to the statistics, sources or teaching are welcome. Please add a test for any change to `src/stats` or to a numeric claim.

## License

Free to use and modify for learning and teaching.

---

Made by Bashar Hasan, MD.
