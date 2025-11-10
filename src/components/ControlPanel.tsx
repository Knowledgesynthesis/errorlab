import React from 'react';
import type { ExperimentState, TestType, Sidedness } from '../types';
import { RANGES } from '../utils/constants';

interface ControlPanelProps {
  state: ExperimentState;
  onChange: (updates: Partial<ExperimentState>) => void;
  onReset: () => void;
  showPrevalence?: boolean; // Only show prevalence slider when 2×2 table is used
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  state,
  onChange,
  onReset,
  showPrevalence = false
}) => {
  const handleSliderChange = (key: keyof ExperimentState, value: number) => {
    onChange({ [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-gray-800">Controls</h2>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium transition-colors"
          aria-label="Reset all parameters to defaults"
        >
          Reset
        </button>
      </div>

      {/* Alpha slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="alpha-slider" className="text-sm font-medium text-gray-700">
            Significance Level (α)
            <span className="ml-2 text-xs text-gray-500" title="Type I error rate">
              Type I error rate
            </span>
          </label>
          <span className="text-sm font-semibold text-gray-900">{state.alpha.toFixed(3)}</span>
        </div>
        <input
          id="alpha-slider"
          type="range"
          min={RANGES.ALPHA.min}
          max={RANGES.ALPHA.max}
          step={RANGES.ALPHA.step}
          value={state.alpha}
          onChange={(e) => handleSliderChange('alpha', parseFloat(e.target.value))}
          className="w-full bg-red-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #fecaca 0%, #ef4444 ${((state.alpha - RANGES.ALPHA.min) / (RANGES.ALPHA.max - RANGES.ALPHA.min)) * 100}%, #e5e7eb ${((state.alpha - RANGES.ALPHA.min) / (RANGES.ALPHA.max - RANGES.ALPHA.min)) * 100}%, #e5e7eb 100%)`
          }}
          aria-label={`Significance level: ${state.alpha.toFixed(3)}`}
        />
        <div className="flex justify-between text-xs text-gray-600 font-medium">
          <span>{RANGES.ALPHA.min}</span>
          <span>{RANGES.ALPHA.max}</span>
        </div>
      </div>

      {/* Sample size slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="n-slider" className="text-sm font-medium text-gray-700">
            Sample Size (n)
          </label>
          <span className="text-sm font-semibold text-gray-900">{state.n}</span>
        </div>
        <input
          id="n-slider"
          type="range"
          min={RANGES.N.min}
          max={RANGES.N.max}
          step={RANGES.N.step}
          value={state.n}
          onChange={(e) => handleSliderChange('n', parseInt(e.target.value))}
          className="w-full bg-blue-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #bfdbfe 0%, #3b82f6 ${((state.n - RANGES.N.min) / (RANGES.N.max - RANGES.N.min)) * 100}%, #e5e7eb ${((state.n - RANGES.N.min) / (RANGES.N.max - RANGES.N.min)) * 100}%, #e5e7eb 100%)`
          }}
          aria-label={`Sample size: ${state.n}`}
        />
        <div className="flex justify-between text-xs text-gray-600 font-medium">
          <span>{RANGES.N.min}</span>
          <span>{RANGES.N.max}</span>
        </div>
      </div>

      {/* Effect size slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="delta-slider" className="text-sm font-medium text-gray-700">
            Effect Size (δ)
            <span className="ml-2 text-xs text-gray-500" title="Mean difference in standard deviations">
              Cohen's d
            </span>
          </label>
          <span className="text-sm font-semibold text-gray-900">{state.delta.toFixed(2)}</span>
        </div>
        <input
          id="delta-slider"
          type="range"
          min={RANGES.DELTA.min}
          max={RANGES.DELTA.max}
          step={RANGES.DELTA.step}
          value={state.delta}
          onChange={(e) => handleSliderChange('delta', parseFloat(e.target.value))}
          className="w-full bg-amber-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #fde68a 0%, #f59e0b ${((state.delta - RANGES.DELTA.min) / (RANGES.DELTA.max - RANGES.DELTA.min)) * 100}%, #e5e7eb ${((state.delta - RANGES.DELTA.min) / (RANGES.DELTA.max - RANGES.DELTA.min)) * 100}%, #e5e7eb 100%)`
          }}
          aria-label={`Effect size: ${state.delta.toFixed(2)}`}
        />
        <div className="flex justify-between text-xs text-gray-600 font-medium">
          <span>{RANGES.DELTA.min}</span>
          <span>{RANGES.DELTA.max}</span>
        </div>
      </div>

      {/* Standard deviation slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="sigma-slider" className="text-sm font-medium text-gray-700">
            Standard Deviation (σ)
          </label>
          <span className="text-sm font-semibold text-gray-900">{state.sigma.toFixed(2)}</span>
        </div>
        <input
          id="sigma-slider"
          type="range"
          min={RANGES.SIGMA.min}
          max={RANGES.SIGMA.max}
          step={RANGES.SIGMA.step}
          value={state.sigma}
          onChange={(e) => handleSliderChange('sigma', parseFloat(e.target.value))}
          className="w-full bg-gray-300 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #d1d5db 0%, #6b7280 ${((state.sigma - RANGES.SIGMA.min) / (RANGES.SIGMA.max - RANGES.SIGMA.min)) * 100}%, #e5e7eb ${((state.sigma - RANGES.SIGMA.min) / (RANGES.SIGMA.max - RANGES.SIGMA.min)) * 100}%, #e5e7eb 100%)`
          }}
          aria-label={`Standard deviation: ${state.sigma.toFixed(2)}`}
        />
        <div className="flex justify-between text-xs text-gray-600 font-medium">
          <span>{RANGES.SIGMA.min}</span>
          <span>{RANGES.SIGMA.max}</span>
        </div>
      </div>

      {/* Test type dropdown */}
      <div className="space-y-2">
        <label htmlFor="test-type" className="text-sm font-medium text-gray-700">
          Test Type
        </label>
        <select
          id="test-type"
          value={state.testType}
          onChange={(e) => onChange({ testType: e.target.value as TestType })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Test type"
        >
          <option value="z-test">z-test (known σ)</option>
          <option value="t-test">t-test (unknown σ)</option>
        </select>
      </div>

      {/* Sidedness dropdown */}
      <div className="space-y-2">
        <label htmlFor="sidedness" className="text-sm font-medium text-gray-700">
          Alternative Hypothesis
        </label>
        <select
          id="sidedness"
          value={state.sidedness}
          onChange={(e) => onChange({ sidedness: e.target.value as Sidedness })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Sidedness"
        >
          <option value="two-sided">Two-sided (μ ≠ μ₀)</option>
          <option value="one-sided-right">One-sided right (μ &gt; μ₀)</option>
          <option value="one-sided-left">One-sided left (μ &lt; μ₀)</option>
        </select>
      </div>

      {/* Prevalence slider for 2x2 table */}
      {showPrevalence && (
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <label htmlFor="prevalence-slider" className="text-sm font-medium text-gray-700">
              Prevalence
              <span className="ml-2 text-xs text-gray-500" title="Prior probability that H₁ is true">
                P(H₁ true)
              </span>
            </label>
            <span className="text-sm font-semibold text-gray-900">
              {(state.prevalence * 100).toFixed(0)}%
            </span>
          </div>
          <input
            id="prevalence-slider"
            type="range"
            min={RANGES.PREVALENCE.min}
            max={RANGES.PREVALENCE.max}
            step={RANGES.PREVALENCE.step}
            value={state.prevalence}
            onChange={(e) => handleSliderChange('prevalence', parseFloat(e.target.value))}
            className="w-full bg-purple-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #e9d5ff 0%, #a855f7 ${((state.prevalence - RANGES.PREVALENCE.min) / (RANGES.PREVALENCE.max - RANGES.PREVALENCE.min)) * 100}%, #e5e7eb ${((state.prevalence - RANGES.PREVALENCE.min) / (RANGES.PREVALENCE.max - RANGES.PREVALENCE.min)) * 100}%, #e5e7eb 100%)`
            }}
            aria-label={`Prevalence: ${(state.prevalence * 100).toFixed(0)}%`}
          />
          <div className="flex justify-between text-xs text-gray-600 font-medium">
            <span>{(RANGES.PREVALENCE.min * 100).toFixed(0)}%</span>
            <span>{(RANGES.PREVALENCE.max * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      {/* Info callouts */}
      <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-xs text-blue-800 leading-relaxed">
          <strong>Tip:</strong> Increasing α expands the rejection region → increases power → increases Type I errors.
          Increasing n or δ decreases β and increases power.
        </p>
      </div>
    </div>
  );
};
