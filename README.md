# ErrorLab: Interactive Stats Playground

An educational web application for learning statistical hypothesis testing concepts through interactive visualizations and hands-on exploration.

## Overview

ErrorLab is designed to make statistical hypothesis testing intuitive and accessible. It provides interactive tools to explore:

- **Type I and Type II errors** (α and β)
- **Statistical power** (1 - β)
- **p-values** and their proper interpretation
- **The 2×2 decision table** for hypothesis testing
- **Real-world scenarios** (medical testing, A/B tests, quality control)

## Features

### 1. Interactive Dashboard
- Adjust parameters with sliders (α, sample size, effect size, variance)
- See distributions and decision regions update in real-time
- Visualize the 2×2 confusion matrix with animated counts
- Switch between z-test and t-test
- Choose one-sided or two-sided tests

### 2. p-value Explorer
- Generate random samples from H₀ or H₁
- See test statistics plotted on the null distribution
- Understand what p-values really mean (and what they don't)
- Visualize the tail area corresponding to the p-value

### 3. Power Analysis
- Plot power curves vs. sample size or effect size
- Save and compare multiple scenarios
- See how α, n, δ, and σ affect power
- Learn optimal study design principles

### 4. Real-World Scenarios
- Medical screening (disease testing)
- A/B testing (product experiments)
- Quality control (manufacturing)
- Contextual explanations of Type I and Type II errors
- Interactive quizzes to test understanding

### 5. Reference & Glossary
- Comprehensive definitions of key terms
- Common misconceptions explained
- Key formulas and decision guidelines
- Accessibility features throughout

## Educational Approach

### Progressive Disclosure
The app starts simple and gradually introduces complexity:
1. Start with α and the rejection region
2. Add H₁ distribution overlay
3. Introduce β and power
4. Explore p-values and their interpretation

### Concrete Metaphors
Abstract concepts are grounded in real scenarios:
- **Medical screening**: false alarms vs. missed diagnoses
- **A/B testing**: shipping bad features vs. missing good ones
- **Quality control**: unnecessary stoppages vs. shipping defects

### Common Misconceptions Addressed
- p-value ≠ probability that H₀ is true
- Failing to reject ≠ accepting H₀
- Smaller α is not always better
- Power ≠ 1 - α
- Statistical significance ≠ practical importance

## Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Animation**: Framer Motion
- **Routing**: React Router

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The app will be available at `http://localhost:5173`

## Project Structure

```
errorlab/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ControlPanel.tsx
│   │   ├── DistributionPlot.tsx
│   │   ├── TwoByTwoCard.tsx
│   │   ├── PValueExplorer.tsx
│   │   ├── PowerCurve.tsx
│   │   ├── ScenarioSwitcher.tsx
│   │   ├── Quiz.tsx
│   │   └── GlossaryCard.tsx
│   ├── pages/            # Page components
│   │   ├── Home.tsx
│   │   ├── Interactive.tsx
│   │   ├── PValue.tsx
│   │   ├── Power.tsx
│   │   ├── Scenarios.tsx
│   │   └── Reference.tsx
│   ├── utils/            # Statistical calculations and helpers
│   │   ├── statistics.ts
│   │   ├── scenarios.ts
│   │   └── constants.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx           # Main app component with routing
│   ├── main.tsx          # App entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── vite.config.ts        # Vite configuration
```

## Key Concepts Explained

### Type I Error (α)
The probability of rejecting H₀ when it is actually true (false positive). This is the significance level you set before the test.

### Type II Error (β)
The probability of failing to reject H₀ when H₁ is true (false negative). This depends on α, sample size, effect size, and variance.

### Statistical Power (1 - β)
The probability of correctly rejecting H₀ when H₁ is true. Higher power means better ability to detect true effects.

### p-value
The probability, assuming H₀ is true, of observing data at least as extreme as what was observed. It is NOT the probability that H₀ is true.

### The Tradeoff
- Decreasing α reduces Type I errors but increases Type II errors (reduces power)
- Increasing sample size reduces Type II errors (increases power) without affecting α
- Larger effect sizes are easier to detect (higher power)

## Statistical Implementation

### Distributions
- Standard normal distribution (z-test)
- Student's t-distribution (t-test)
- Numerical approximations for CDF and quantile functions

### Power Calculation
Power is computed by:
1. Finding the critical value(s) based on α
2. Computing the non-centrality parameter: δ / SE
3. Calculating the probability under H₁ of falling in the rejection region

### Sample Generation
Uses a seeded pseudo-random number generator (Linear Congruential Generator) with Box-Muller transform for reproducible normal samples.

## Accessibility

- WCAG 2.2 AA compliant
- Keyboard-navigable controls
- ARIA labels on interactive elements
- Sufficient color contrast
- Live region updates for screen readers
- Responsive mobile-first design

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

This is an educational project. Feel free to use and modify for learning purposes.

## Acknowledgments

Built following principles from:
- Statistical pedagogy research
- WCAG accessibility guidelines
- React best practices
- Plain language communication

## Contributing

This is an educational tool. Suggestions for improvements to pedagogy, accessibility, or statistical accuracy are welcome.

---

**Learn by doing. Understand through visualization. Master hypothesis testing with ErrorLab.**
