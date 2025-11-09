import React, { useState } from 'react';
import type { ExperimentState } from '../types';
import { ControlPanel } from '../components/ControlPanel';
import { PValueExplorer } from '../components/PValueExplorer';
import { DEFAULTS } from '../utils/constants';

export const PValue: React.FC = () => {
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

  return (
    <div className="max-w-7xl mx-auto space-y-2">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          p-value Explorer
        </h1>
        <p className="text-gray-600">
          Generate samples and understand what p-values really mean
        </p>
      </div>

      {/* Educational intro */}
      <div className="bg-purple-50 rounded-lg p-2 border border-purple-200">
        <h2 className="text-xl font-bold text-purple-900 mb-1">
          What is a p-value?
        </h2>
        <p className="text-gray-700 mb-1">
          The p-value is the probability, <strong>assuming H₀ is true</strong>, of observing
          data at least as extreme as what we actually observed. It's a measure of how
          surprising our data would be if the null hypothesis were correct.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-white rounded border border-purple-200">
            <p className="font-bold text-purple-800 mb-2">What p-value IS:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>P(data this extreme | H₀ true)</li>
              <li>A measure of evidence against H₀</li>
              <li>Used to make decisions with α</li>
            </ul>
          </div>
          <div className="p-2 bg-white rounded border border-red-200">
            <p className="font-bold text-red-800 mb-2">What p-value is NOT:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>NOT P(H₀ true | data)</li>
              <li>NOT the probability of a Type I error</li>
              <li>NOT a measure of effect size</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="lg:col-span-1">
          <ControlPanel
            state={state}
            onChange={handleStateChange}
            onReset={handleReset}
          />
        </div>

        <div className="lg:col-span-2">
          <PValueExplorer
            state={state}
            onSeedChange={(seed) => setState({ ...state, seed })}
          />
        </div>
      </div>
    </div>
  );
};
