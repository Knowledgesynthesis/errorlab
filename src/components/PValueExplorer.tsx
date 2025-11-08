import React, { useState } from 'react';
import type { ExperimentState, SampleData } from '../types';
import { generateSample } from '../utils/statistics';
import { DistributionPlot } from './DistributionPlot';
import { calculateDerivedValues } from '../utils/statistics';

interface PValueExplorerProps {
  state: ExperimentState;
  onSeedChange: (seed: number) => void;
}

export const PValueExplorer: React.FC<PValueExplorerProps> = ({ state, onSeedChange }) => {
  const [sampleData, setSampleData] = useState<SampleData | null>(null);
  const [underH1, setUnderH1] = useState(false);

  const handleGenerateSample = (fromH1: boolean) => {
    setUnderH1(fromH1);
    const newSample = generateSample(state, fromH1);
    setSampleData(newSample);
  };

  const handleNewSeed = () => {
    const newSeed = Math.floor(Math.random() * 1000000);
    onSeedChange(newSeed);
    setSampleData(null);
  };

  const derived = calculateDerivedValues(state);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">p-value Explorer</h3>

        <div className="mb-6">
          <p className="text-sm text-gray-700 mb-4">
            Generate a random sample and see where the test statistic falls on the H₀ distribution.
            The p-value is the probability (under H₀) of getting a result at least as extreme.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleGenerateSample(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              aria-label="Generate sample from H0"
            >
              Generate Sample from H₀
            </button>
            <button
              onClick={() => handleGenerateSample(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium transition-colors"
              aria-label="Generate sample from H1"
            >
              Generate Sample from H₁
            </button>
            <button
              onClick={handleNewSeed}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md font-medium transition-colors"
              aria-label="Change random seed"
            >
              New Random Seed
            </button>
          </div>
        </div>

        {sampleData && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Sample Mean</div>
                <div className="text-2xl font-bold text-gray-800">
                  {sampleData.mean.toFixed(3)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  (True: {underH1 ? state.delta.toFixed(2) : '0'})
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Test Statistic</div>
                <div className="text-2xl font-bold text-gray-800">
                  {sampleData.testStatistic.toFixed(3)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ({state.testType})
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-md border border-purple-200">
                <div className="text-xs text-gray-600 mb-1">p-value</div>
                <div className="text-2xl font-bold text-purple-700">
                  {sampleData.pValue.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {sampleData.pValue < state.alpha ? 'p < α (reject)' : 'p ≥ α (fail to reject)'}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-md border ${
              sampleData.decision === 'reject'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <p className="text-sm font-semibold mb-2">
                Decision: {sampleData.decision === 'reject' ? 'Reject H₀' : 'Fail to Reject H₀'}
              </p>
              <p className="text-xs text-gray-700">
                {sampleData.decision === 'reject' ? (
                  <>
                    The p-value ({sampleData.pValue.toFixed(4)}) is less than α ({state.alpha.toFixed(3)}),
                    so we reject the null hypothesis.
                    {underH1 ? ' This is a correct decision (true positive)!' : ' This is a Type I error (false positive)!'}
                  </>
                ) : (
                  <>
                    The p-value ({sampleData.pValue.toFixed(4)}) is greater than or equal to α ({state.alpha.toFixed(3)}),
                    so we fail to reject the null hypothesis.
                    {underH1 ? ' This is a Type II error (false negative)!' : ' This is a correct decision (true negative)!'}
                  </>
                )}
              </p>
            </div>

            {/* Common misconception callout */}
            <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
              <p className="text-xs text-yellow-900 leading-relaxed">
                <strong>Important:</strong> The p-value of {sampleData.pValue.toFixed(4)} does NOT mean
                there is a {(sampleData.pValue * 100).toFixed(2)}% chance that H₀ is true.
                It means: "If H₀ were true, we would see a test statistic this extreme or more extreme{' '}
                {(sampleData.pValue * 100).toFixed(2)}% of the time by random chance."
              </p>
            </div>
          </div>
        )}

        {!sampleData && (
          <div className="p-8 bg-gray-50 rounded-md border-2 border-dashed border-gray-300 text-center">
            <p className="text-gray-500">
              Click one of the buttons above to generate a sample and see the p-value calculation
            </p>
          </div>
        )}
      </div>

      {/* Distribution plot with sample */}
      {sampleData && (
        <DistributionPlot
          state={state}
          derived={derived}
          sampleData={sampleData}
          showH1={true}
        />
      )}
    </div>
  );
};
