import React, { useState } from 'react';
import type { ExperimentState, Scenario } from '../types';
import { ControlPanel } from '../components/ControlPanel';
import { DistributionPlot } from '../components/DistributionPlot';
import { TwoByTwoCard } from '../components/TwoByTwoCard';
import { ScenarioSwitcher } from '../components/ScenarioSwitcher';
import { calculateDerivedValues, calculate2x2Data } from '../utils/statistics';
import { DEFAULTS } from '../utils/constants';

export const Interactive: React.FC = () => {
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

  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);

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
    setCurrentScenario(null);
  };

  const handleScenarioChange = (scenario: Scenario) => {
    setState(scenario.state);
    setCurrentScenario(scenario);
  };

  const derived = calculateDerivedValues(state);
  const tableData = calculate2x2Data(state, derived);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Interactive Hypothesis Testing
        </h1>
        <p className="text-gray-600">
          Adjust parameters and watch the distributions, errors, and power change in real-time
        </p>
      </div>

      {/* Scenario switcher */}
      <ScenarioSwitcher
        currentScenario={currentScenario}
        onScenarioChange={handleScenarioChange}
      />

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Controls */}
        <div className="lg:col-span-1">
          <ControlPanel
            state={state}
            onChange={handleStateChange}
            onReset={handleReset}
          />

          {/* Key metrics */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Current Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Type I Error (α)</span>
                <span className="text-lg font-bold text-red-600">
                  {(state.alpha * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Type II Error (β)</span>
                <span className="text-lg font-bold text-blue-600">
                  {(derived.beta * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Power (1-β)</span>
                <span className="text-lg font-bold text-green-600">
                  {(derived.power * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Visualizations */}
        <div className="lg:col-span-2 space-y-6">
          <DistributionPlot
            state={state}
            derived={derived}
            showH1={true}
            scenarioId={currentScenario?.id}
          />

          <TwoByTwoCard
            data={tableData}
            state={state}
            scenario={currentScenario?.metaphor}
          />
        </div>
      </div>

      {/* Educational callout */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
        <h3 className="text-lg font-bold text-gray-800 mb-3">
          Try This:
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            <strong>Increase α from 0.05 to 0.10:</strong> Watch the rejection region expand,
            Type I errors increase, and power increase
          </li>
          <li>
            <strong>Increase sample size from 100 to 500:</strong> See Type II errors decrease
            and power increase (with α fixed)
          </li>
          <li>
            <strong>Reduce α from 0.05 to 0.01:</strong> Observe the tradeoff –
            fewer Type I errors but more Type II errors
          </li>
          <li>
            <strong>Change effect size:</strong> Larger effects are easier to detect (higher power)
          </li>
        </ul>
      </div>
    </div>
  );
};
