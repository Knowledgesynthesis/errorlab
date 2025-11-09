import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { ExperimentState } from '../types';
import { generatePowerCurve } from '../utils/statistics';
import { COLORS, POWER_CURVE_POINTS } from '../utils/constants';

interface PowerCurveProps {
  state: ExperimentState;
}

export const PowerCurve: React.FC<PowerCurveProps> = ({ state }) => {
  const [variable, setVariable] = useState<'n' | 'delta'>('n');
  const [savedCurves, setSavedCurves] = useState<Array<{ id: string; data: any[]; label: string }>>([]);

  const curveData = useMemo(() => {
    if (variable === 'n') {
      return generatePowerCurve(state, 'n', 0, 1000, POWER_CURVE_POINTS);
    } else {
      return generatePowerCurve(state, 'delta', 0, 2, POWER_CURVE_POINTS);
    }
  }, [state, variable]);

  const handleSaveCurve = () => {
    const id = Date.now().toString();
    const label = variable === 'n'
      ? `δ=${state.delta.toFixed(2)}, α=${state.alpha.toFixed(3)}`
      : `n=${state.n}, α=${state.alpha.toFixed(3)}`;

    setSavedCurves([...savedCurves, { id, data: curveData, label }]);
  };

  const handleClearCurves = () => {
    setSavedCurves([]);
  };

  const currentValue = variable === 'n' ? state.n : state.delta;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-xl font-bold text-gray-800">Power Analysis</h3>
        <div className="flex gap-2">
          <button
            onClick={handleSaveCurve}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md font-medium transition-colors"
            aria-label="Save current curve"
          >
            Save Curve
          </button>
          {savedCurves.length > 0 && (
            <button
              onClick={handleClearCurves}
              className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm rounded-md font-medium transition-colors"
              aria-label="Clear saved curves"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="mb-1">
        <label className="text-sm font-medium text-gray-700 mr-3">Plot power vs:</label>
        <div className="inline-flex gap-2">
          <button
            onClick={() => setVariable('n')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              variable === 'n'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-pressed={variable === 'n'}
          >
            Sample Size (n)
          </button>
          <button
            onClick={() => setVariable('delta')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              variable === 'delta'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-pressed={variable === 'delta'}
          >
            Effect Size (δ)
          </button>
        </div>
      </div>

      <div className="w-full" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={curveData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="x"
              domain={variable === 'n' ? [0, 'auto'] : ['auto', 'auto']}
              label={{
                value: variable === 'n' ? 'Sample Size (n)' : 'Effect Size (δ)',
                position: 'insideBottom',
                offset: -10,
              }}
              stroke="#6b7280"
            />
            <YAxis
              domain={[0, 1]}
              label={{ value: 'Power (1 - β)', angle: -90, position: 'insideLeft' }}
              stroke="#6b7280"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
              }}
              formatter={(value: number) => value.toFixed(3)}
            />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ paddingBottom: '20px' }}
            />

            {/* Current curve */}
            <Line
              type="monotone"
              dataKey="power"
              stroke={COLORS.POWER}
              strokeWidth={3}
              dot={false}
              name="Current Power"
              isAnimationActive={false}
            />

            {/* Reference line for current value */}
            <ReferenceLine
              x={currentValue}
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: `Current: ${currentValue}`,
                position: 'top',
                fill: '#8b5cf6',
                fontSize: 11,
              }}
            />

            {/* Reference lines for common power thresholds */}
            <ReferenceLine
              y={0.8}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{
                value: '80% power',
                position: 'right',
                fill: '#f59e0b',
                fontSize: 10,
              }}
            />
            <ReferenceLine
              y={0.9}
              stroke="#10b981"
              strokeDasharray="5 5"
              label={{
                value: '90% power',
                position: 'right',
                fill: '#10b981',
                fontSize: 10,
              }}
            />

            {/* Saved curves */}
            {savedCurves.map((curve, idx) => (
              <Line
                key={curve.id}
                data={curve.data}
                type="monotone"
                dataKey="power"
                stroke={`hsl(${(idx * 60) % 360}, 70%, 50%)`}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name={curve.label}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="p-2 bg-green-50 rounded-md border border-green-200">
          <p className="text-xs text-green-900 leading-relaxed">
            <strong>What is power?</strong> Power is the probability of correctly rejecting H₀ when H₁ is true.
            Common targets are 80% or 90%. Higher power means fewer Type II errors.
          </p>
        </div>
        <div className="p-2 bg-blue-50 rounded-md border border-blue-200">
          <p className="text-xs text-blue-900 leading-relaxed">
            <strong>How to increase power:</strong> Increase sample size (n), increase effect size (δ),
            increase α (accept more Type I errors), or decrease variance (σ).
          </p>
        </div>
      </div>

      {/* Current power display */}
      <div className="mt-1 p-2 bg-purple-50 rounded-md border border-purple-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Current Power at {variable} = {currentValue}:
          </span>
          <span className="text-2xl font-bold" style={{ color: COLORS.POWER }}>
            {(curveData.find((d) => Math.abs(d.x - currentValue) < 0.5)?.power || 0).toFixed(3)}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {variable === 'n'
            ? `With n=${currentValue}, you have a ${((curveData.find((d) => Math.abs(d.x - currentValue) < 0.5)?.power || 0) * 100).toFixed(1)}% chance of detecting the effect if it exists.`
            : `With δ=${currentValue.toFixed(2)}, you have a ${((curveData.find((d) => Math.abs(d.x - currentValue) < 0.5)?.power || 0) * 100).toFixed(1)}% chance of detecting the effect if it exists.`}
        </p>
      </div>
    </div>
  );
};
