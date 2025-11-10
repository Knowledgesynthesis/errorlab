import React, { useMemo } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { ExperimentState, DerivedValues, SampleData } from '../types';
import { normalPDF, tPDF } from '../utils/statistics';
import { COLORS, DISTRIBUTION_POINTS } from '../utils/constants';

interface DistributionPlotProps {
  state: ExperimentState;
  derived: DerivedValues;
  sampleData?: SampleData;
  showH1?: boolean;
  scenarioId?: string;
}

export const DistributionPlot: React.FC<DistributionPlotProps> = ({
  state,
  derived,
  sampleData,
  showH1 = true,
}) => {
  // Calculate the axis range separately so we can use it for both data generation and domain
  const axisRange = useMemo(() => {
    const { ncp } = derived;

    // Determine x-axis range - dynamic to show all relevant content
    const h1Center = ncp || 0;
    const margin = 4; // Standard deviations to show on each side

    // Start with showing H₀ (centered at 0) and H₁ (centered at ncp)
    // We want to show at least ±4 standard deviations from each center
    let xMin = Math.min(-margin, h1Center - margin);
    let xMax = Math.max(margin, h1Center + margin);

    // IMPORTANT: Extend range to include the observed test statistic if it exists
    if (sampleData) {
      const testStat = sampleData.testStatistic;
      xMin = Math.min(xMin, testStat - 1);
      xMax = Math.max(xMax, testStat + 1);
    }

    // Ensure some minimum range
    if (xMax - xMin < 8) {
      const center = (xMin + xMax) / 2;
      xMin = center - 4;
      xMax = center + 4;
    }

    return { xMin, xMax };
  }, [derived, sampleData]);

  const data = useMemo(() => {
    const { testType } = state;
    const { rejectionRegion, ncp } = derived;
    const { xMin, xMax } = axisRange;

    const df = testType === 't-test' ? state.n - 1 : undefined;

    const step = (xMax - xMin) / DISTRIBUTION_POINTS;

    const points = [];

    for (let i = 0; i <= DISTRIBUTION_POINTS; i++) {
      const x = xMin + i * step;

      // H0 distribution (centered at 0)
      const h0Density = testType === 'z-test' ? normalPDF(x) : tPDF(x, df!);

      // H1 distribution (shifted by ncp)
      const h1Density = testType === 'z-test'
        ? normalPDF(x - (ncp || 0))
        : tPDF(x - (ncp || 0), df!);

      // Check if in rejection region
      let inRejectionRegion = false;
      if (rejectionRegion.lower !== null && x <= rejectionRegion.lower) {
        inRejectionRegion = true;
      }
      if (rejectionRegion.upper !== null && x >= rejectionRegion.upper) {
        inRejectionRegion = true;
      }

      points.push({
        x: parseFloat(x.toFixed(3)),
        h0: parseFloat(h0Density.toFixed(4)),
        h1: parseFloat(h1Density.toFixed(4)),
        // Only show h0 value in rejection region for shading
        h0Rejection: inRejectionRegion ? parseFloat(h0Density.toFixed(4)) : null,
      });
    }

    return points;
  }, [state, derived, axisRange]);

  const { criticalValues } = derived;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        Sampling Distributions
      </h3>

      <div className="w-full" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
          >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="x"
            domain={[axisRange.xMin, axisRange.xMax]}
            type="number"
            label={{ value: 'Test Statistic', position: 'insideBottom', offset: -10 }}
            stroke="#6b7280"
          />
          <YAxis
            width={40}
            label={{ value: 'Probability Density', angle: -90, position: 'insideLeft' }}
            stroke="#6b7280"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
            }}
            formatter={(value: number) => value.toFixed(4)}
          />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ paddingBottom: '20px' }}
          />

          {/* Shaded rejection region - only shows where we reject H0 */}
          <Area
            type="monotone"
            dataKey="h0Rejection"
            fill={COLORS.TYPE1}
            fillOpacity={0.3}
            stroke="none"
            isAnimationActive={false}
            connectNulls={false}
          />

          {/* H0 distribution */}
          <Line
            type="monotone"
            dataKey="h0"
            stroke={COLORS.H0}
            strokeWidth={2}
            dot={false}
            name="H₀ (null)"
            isAnimationActive={false}
          />

          {/* H1 distribution */}
          {showH1 && (
            <Line
              type="monotone"
              dataKey="h1"
              stroke={COLORS.H1}
              strokeWidth={2}
              dot={false}
              name="H₁ (alternative)"
              strokeDasharray="5 5"
              isAnimationActive={false}
            />
          )}

          {/* Critical values */}
          {criticalValues.map((cv, idx) => (
            <ReferenceLine
              key={`cv-${idx}`}
              x={parseFloat(cv.toFixed(3))}
              stroke={COLORS.TYPE1}
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: `CV: ${cv.toFixed(2)}`,
                position: 'top',
                fill: COLORS.TYPE1,
                fontSize: 12,
              }}
            />
          ))}

          {/* Sample test statistic - PURPLE LINE */}
          {sampleData && (
            <ReferenceLine
              x={parseFloat(sampleData.testStatistic.toFixed(3))}
              stroke="#8b5cf6"
              strokeWidth={3}
              label={{
                value: `Observed: ${sampleData.testStatistic.toFixed(2)}`,
                position: 'top',
                fill: '#8b5cf6',
                fontSize: 12,
              }}
              name="Observed Test Statistic"
            />
          )}
        </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* How to Read This Figure */}
      <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-300">
        <h4 className="text-sm font-bold text-blue-900 mb-1">📖 How to Read This Figure:</h4>
        <ol className="text-xs text-blue-900 space-y-1 list-decimal list-inside">
          <li><strong>Gray solid line (H₀):</strong> Shows where test statistics fall when the null hypothesis is true (no effect)</li>
          <li><strong>Orange dashed line (H₁):</strong> Shows where test statistics fall when there's a real effect of size δ</li>
          <li><strong>Red shaded area:</strong> The rejection region - if your test statistic lands here, you reject H₀</li>
          <li><strong>Vertical dashed red lines:</strong> Critical values that mark the boundaries of the rejection region</li>
          {sampleData && <li><strong>Purple vertical line:</strong> Your observed test statistic from the sample you generated</li>}
        </ol>
      </div>

      {/* Key Observations */}
      <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-300">
        <h4 className="text-sm font-bold text-green-900 mb-1">👁️ Key Observations:</h4>
        <ul className="text-xs text-green-900 space-y-1">
          <li><strong>Type I Error (α = {(state.alpha * 100).toFixed(1)}%):</strong> The shaded area under the H₀ curve. This is the probability of rejecting H₀ when it's actually true.</li>
          {showH1 && (
            <>
              <li><strong>Type II Error (β = {(derived.beta * 100).toFixed(1)}%):</strong> The unshaded area under the H₁ curve (between the critical values). This is the probability of failing to reject H₀ when H₁ is true.</li>
              <li><strong>Power ({(derived.power * 100).toFixed(1)}%):</strong> The shaded area under the H₁ curve. This is your chance of correctly detecting the effect when it exists.</li>
              <li><strong>Distance between curves:</strong> Determined by the effect size (δ = {state.delta.toFixed(2)}). Larger effects = more separation = easier to detect.</li>
            </>
          )}
          {sampleData && (
            <li><strong>Your sample:</strong> The purple line shows where your observed test statistic landed. {sampleData.decision === 'reject' ? 'It fell in the rejection region, so we reject H₀!' : 'It did not fall in the rejection region, so we fail to reject H₀.'}</li>
          )}
        </ul>
      </div>

      {/* Legend explanations */}
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.H0 }}></div>
          <span className="text-gray-700">
            <strong>H₀:</strong> Null hypothesis distribution (mean = 0)
          </span>
        </div>
        {showH1 && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.H1 }}></div>
            <span className="text-gray-700">
              <strong>H₁:</strong> Alternative hypothesis distribution (mean = δ)
            </span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded opacity-50" style={{ backgroundColor: COLORS.TYPE1 }}></div>
          <span className="text-gray-700">
            <strong>Shaded:</strong> Rejection region (α = {state.alpha.toFixed(3)})
          </span>
        </div>
        {sampleData && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-purple-600"></div>
            <span className="text-gray-700">
              <strong>Purple line:</strong> Observed test statistic
            </span>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="mt-2 p-4 bg-amber-50 rounded-md border border-amber-200">
        <p className="text-xs text-amber-900 leading-relaxed">
          <strong>What you're seeing:</strong> The shaded region shows where we reject H₀.
          Under H₀ (solid line), the probability of landing in this region is exactly α = {state.alpha.toFixed(3)}.
          {showH1 && ` Under H₁ (dashed line), the probability of landing in the rejection region is the power = ${derived.power.toFixed(3)}.`}
        </p>
      </div>
    </div>
  );
};
