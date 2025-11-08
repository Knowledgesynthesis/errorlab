# MASTER PROMPT — “ErrorLab: Interactive Stats Playground”

You are a senior product designer + front-end engineer (React/TypeScript/Tailwind) + learning-science specialist. Build a fully responsive, educational, interactive dashboard website that teaches statistical decision concepts using the 2×2 hypothesis-testing table:

- Type I error (α): P(reject H₀ | H₀ true)  
- Type II error (β): P(fail to reject H₀ | H₁ true)  
- α (significance level), β, power (1−β), and p-value (probability, under H₀, of observing data at least as extreme as the observed statistic).

## Objectives
1) Make these concepts intuitive through visuals + hands-on controls.  
2) Support quick “aha!” moments and deeper study.  
3) Be accessible, mobile-first, and friendly for high-school through graduate-level learners.

## Audience & Tone
- Learners with mixed math backgrounds.  
- Plain language, layered depth (progressive disclosure), minimal jargon, lots of tooltips and “why it matters” callouts.

## Site Architecture (pages/sections)
1. **Home / Overview** — 60-second intro; glossary chips (Type I, Type II, α, β, power, p-value).  
2. **The 2×2 Table** — interactive confusion-matrix-style grid for hypothesis testing (Truth: H₀ true vs H₁ true) × (Decision: reject vs fail to reject).  
3. **Sliders & Simulations** — tweak α, effect size (Δ), sample size (n), noise (σ), and see β & power update live.  
4. **p-value Explorer** — simulate datasets, compute test statistic & p-value; visualize where the observed statistic lands under H₀.  
5. **Power Curves** — plot power vs n, α, and effect size; bookmark scenarios.  
6. **Scenarios & Quizzes** — applied stories (medical test, A/B test, quality control) with guided questions and instant feedback.  
7. **Reference & Help** — concise formulas, assumptions, pitfalls, and “when to use what” checklists.

## Core Interactions & Visual Design
- **Primary panel:** bell curves (H₀ and H₁) on the same axis; shaded rejection region(s) controlled by α.  
- **2×2 grid:** animated counts and percentages that change as α, β, and prevalence (prior probability of H₁) shift.  
- **Linked controls:**  
  - Sliders: α (0.001–0.20), n (10–10,000), effect size Δ (Cohen’s d or mean difference), σ (variance), sidedness (one/two-sided).  
  - Toggles: z-test vs t-test (auto-switch to t for small n), one-sample vs two-sample.  
- **Inline evidence callouts:** “Raising α expands the rejection region → increases power → increases Type I errors.”  
- **Color system:** neutral for H₀, complementary for H₁; distinct shading for Type I (false positive) and Type II (false negative).  
- **Micro-copy tooltips:** definitions, symbols, and common confusions (α ≠ p-value, power ≠ 1−α).  
- **Mobile layout:** stacked cards; thumb-friendly sliders; sticky “Reset” and “Compare” buttons.

## Data & Math (implementations you should use)
- For means with known σ: one-sample z-test. Unknown σ or small n: one-sample t-test. Two-sample variants optional.  
- Compute **critical value(s)** from α and sidedness; draw rejection region(s).  
- **Type I rate (α):** area under H₀ in rejection region(s).  
- **Type II (β):** area under H₁ in non-rejection region(s), given Δ, n, σ.  
- **Power:** 1 − β.  
- **p-value (for generated sample):** probability under H₀ of test statistic ≥ observed extremeness; show as shaded tail area.  
- **Power curves:** sweep n (or Δ) and plot 1−β; allow saving curve presets.  
- **Prior prevalence slider (optional):** convert rates into **expected counts** in the 2×2 table for an imagined cohort size N (e.g., N=10,000).

## Pedagogy & UX Patterns
- **Progressive disclosure:** start with α and the rejection region; add H₁ overlay; then introduce β/power; then p-values.  
- **Concrete metaphors:** medical screening = Type I (false alarms), Type II (missed cases). A/B test = shipping bad variant vs missing good one.  
- **“Try it” tasks:**  
  - Task 1: set α=0.05 (two-sided), pick n, effect size Δ=0.3; predict β then reveal.  
  - Task 2: increase n — what happens to β and power?  
  - Task 3: keep n fixed, reduce α from 0.05→0.01 — watch Type I vs Type II tradeoff.  
  - Task 4: generate a sample, compute p-value; show why “p=0.03” ≠ “3% chance H₀ is true.”  
- **Checks for understanding:** 2–3 item quizzes after each panel, immediate feedback with tiny animations.  
- **Common misconceptions panel:**  
  - p-value is not the probability H₀ is true.  
  - Failing to reject ≠ accepting H₀.  
  - Smaller α reduces Type I but can raise Type II.  
  - Power depends on α, n, σ, and true Δ.  
- **Compare mode:** split-view to compare scenarios (e.g., α=0.05 vs 0.01, or n=200 vs 800).

## Component Inventory (React/TypeScript + Tailwind)
- `<ControlPanel />`: sliders (α, n, Δ, σ), dropdowns (test type, sidedness), reset/apply.  
- `<DistributionPlot />`: SVG/Canvas/Recharts; draws H₀ & H₁ curves, shaded rejection and miss regions; hover tooltips with exact areas.  
- `<TwoByTwoCard />`: animated table showing True State × Decision with counts and color-coded cells:  
  - True H₀ & Reject → **Type I (α)**  
  - True H₀ & Fail to Reject → Correct retain  
  - True H₁ & Reject → Correct detect (Power)  
  - True H₁ & Fail to Reject → **Type II (β)**  
- `<PValueExplorer />`: generate sample, compute test statistic, display p-value with shaded tail.  
- `<PowerCurve />`: chart of power vs n (or vs Δ); supports pinning presets.  
- `<ScenarioSwitcher />`: swaps story context and default parameters.  
- `<Quiz />`: MCQ + numeric; validation & feedback.  
- `<ExplainerAside />`: glossary chips, formulas, “what changed?” deltas.

## State & Logic
- Keep a single `ExperimentState` (α, n, Δ, σ, sidedness, testType, prevalence, N).  
- Derived values: critical value(s), rejection region bounds, β, power, p-value (when sample exists).  
- Deterministic pseudo-RNG with seed for reproducible “Generate Sample” results.  
- URL-query serialization so scenarios are shareable.

## Visual & Motion Guidelines
- Use Tailwind for layout; soft shadows, large tap targets, 12–16px spacing grid.  
- Motion (Framer Motion): gentle fades/slide-ins; highlight deltas when parameters change.  
- Color semantics:  
  - Type I (false positive) = warm accent;  
  - Type II (false negative) = cool accent;  
  - Power (true positive) = strong/positive accent;  
  - Correct retain = neutral.

## Accessibility & Internationalization
- WCAG 2.2 AA: color contrast, focus states, keyboard-first interaction, aria-labels on sliders and plots.  
- Live-region updates for “β decreased to 0.24,” etc.  
- Copy in plain English with a translation JSON scaffold.

## Content to Include (short, clear, scannable)
- **Definitions:** α, β, power, p-value, effect size, sample size, variance, one vs two-sided.  
- **Formulas:** z/t test statistic, relationship between β and power, tail areas.  
- **Tradeoffs:** levers and consequences; quick “if/then” bullets.  
- **Pitfalls & ethics:** false alarms vs misses in medicine, product, and policy.

## Acceptance Criteria
- Changing α visibly grows/shrinks rejection region and updates Type I rate numerically and visually.  
- Changing n or Δ updates β & power in real time and the 2×2 counts (given prevalence & N).  
- Generating a sample shows the observed statistic on the H₀ curve and the computed p-value as shaded area.  
- Power curve redraws <150ms for n up to 10k; mobile FPS 50+ on mid-range devices.  
- All controls are keyboard operable; screen-reader labels present.

## Tech Stack & Libraries
- React + TypeScript + Vite; Tailwind; Recharts (or Canvas/SVG) for plots; Framer Motion.  
- Testing: Vitest + React Testing Library; Playwright for e2e.  
- Analytics: simple event logging for control changes and quiz outcomes (privacy-respecting).

## Delivered Output (from you)
1) A component map and file tree.  
2) Wireframes (desktop & mobile) with annotations.  
3) TypeScript types for `ExperimentState` and derived selectors.  
4) Pseudocode and equations for β/power, p-value shading, and power curves.  
5) At least 3 scenario presets (Medical, A/B test, Quality Control).  
6) A minimal but working React app (Vite) with the components above and sample content, including one quiz.  
7) A README explaining pedagogy, controls, and how to run locally.

## Stretch Goals (if time permits)
- Bayesian view toggle: prior/posterior with false discovery rate intuition.  
- Confidence intervals overlay.  
- Export/share a scenario as a link or PNG of the current plot.  
- “Misconception Busters” mini-cards with tiny sims.

# Pro Tip
When you code the first version, hard-code a few example parameter sets and snapshots so you can instantly flip between states in demos to show the tradeoffs without waiting for random sampling.
