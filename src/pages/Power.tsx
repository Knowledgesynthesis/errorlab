import React, { useState } from 'react';
import type { ExperimentState } from '../types';
import { ControlPanel } from '../components/ControlPanel';
import { PowerCurve } from '../components/PowerCurve';
import { DEFAULTS } from '../utils/constants';
import { calculateDerivedValues } from '../utils/statistics';

export const Power: React.FC = () => {
  const [state, setState] = useState<ExperimentState>({
    alpha: DEFAULTS.ALPHA,
    n: DEFAULTS.N,
    delta: DEFAULTS.DELTA,
    sigma: DEFAULTS.SIGMA,
    testType: 'z-test',
    sidedness: 'two-sided',
    sampleType: 'one-sample',
    prevalence: DEFAULTS.PREVALENCE,
    N: DEFAULTS.N_POPULATION,
    seed: DEFAULTS.SEED,
  });

  const handleStateChange = (updates: Partial<ExperimentState>) => {
    setState({ ...state, ...updates });
  };

  const handleReset = () => {
    setState({
      alpha: DEFAULTS.ALPHA,
      n: DEFAULTS.N,
      delta: DEFAULTS.DELTA,
      sigma: DEFAULTS.SIGMA,
      testType: 'z-test',
      sidedness: 'two-sided',
      sampleType: 'one-sample',
      prevalence: DEFAULTS.PREVALENCE,
      N: DEFAULTS.N_POPULATION,
      seed: DEFAULTS.SEED,
    });
  };

  const derived = calculateDerivedValues(state);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Power Analysis
        </h1>
        <p className="text-gray-600">
          Explore how sample size and effect size affect your ability to detect true effects
        </p>
      </div>

      {/* Educational intro */}
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <h2 className="text-xl font-bold text-green-900 mb-3">
          Understanding Statistical Power
        </h2>
        <p className="text-gray-700 mb-3">
          Power is the probability of correctly rejecting H₀ when H₁ is actually true.
          In other words, it's your chance of detecting a real effect when it exists.
          Power = 1 - β (one minus Type II error rate).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-white rounded border border-green-200">
            <h3 className="font-bold text-green-800 mb-2">Why Power Matters</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Low power = high risk of missing real effects</li>
              <li>Typical target: 80% or 90% power</li>
              <li>Critical for planning studies</li>
              <li>Affects sample size requirements</li>
            </ul>
          </div>
          <div className="p-4 bg-white rounded border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-2">What Affects Power?</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>↑ Sample size → ↑ Power</li>
              <li>↑ Effect size → ↑ Power</li>
              <li>↑ Alpha (α) → ↑ Power</li>
              <li>↓ Variance (σ) → ↑ Power</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <ControlPanel
            state={state}
            onChange={handleStateChange}
            onReset={handleReset}
          />

          {/* Current power display */}
          <div className="mt-4 bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Current Settings</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <div className="text-xs text-gray-600 mb-1">Statistical Power</div>
                <div className="text-3xl font-bold text-green-600">
                  {(derived.power * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <div className="text-xs text-gray-600 mb-1">Type II Error (β)</div>
                <div className="text-2xl font-bold text-blue-600">
                  {(derived.beta * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-3">
                <strong>Interpretation:</strong> With these settings, you have a{' '}
                {(derived.power * 100).toFixed(1)}% chance of detecting the effect if it truly exists.
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <PowerCurve state={state} />

          {/* Power recommendations */}
          <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h3 className="text-lg font-bold text-yellow-900 mb-3">
              Power Recommendations
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>For exploratory research:</strong> 70-80% power is often acceptable
              </p>
              <p>
                <strong>For confirmatory studies:</strong> Aim for 80-90% power
              </p>
              <p>
                <strong>For critical decisions:</strong> Consider 90-95% power
              </p>
              <p className="mt-3 text-xs text-gray-600">
                Remember: Higher power requires larger sample sizes or stronger effects.
                The tradeoff between power and cost/time is a practical consideration in study design.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
