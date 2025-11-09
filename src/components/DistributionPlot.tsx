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
} from 'recharts';
import type { ExperimentState, DerivedValues, SampleData } from '../types';
import { normalPDF, tPDF, getStandardError } from '../utils/statistics';
import { COLORS, DISTRIBUTION_POINTS } from '../utils/constants';

interface DistributionPlotProps {
  state: ExperimentState;
  derived: DerivedValues;
  sampleData?: SampleData;
  showH1?: boolean;
}

export const DistributionPlot: React.FC<DistributionPlotProps> = ({
  state,
  derived,
  sampleData,
  showH1 = true,
}) => {
  const data = useMemo(() => {
    const { delta, sigma, n, testType } = state;
    const { rejectionRegion, ncp } = derived;

    const se = getStandardError(sigma, n);
    const df = testType === 't-test' ? n - 1 : undefined;

    // Determine x-axis range
    const maxRange = Math.max(4, Math.abs(delta / se) + 3);
    const xMin = -maxRange;
    const xMax = maxRange;
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
  }, [state, derived]);

  const { criticalValues } = derived;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Sampling Distributions
      </h3>

      <div className="w-full overflow-x-auto">
        <ComposedChart
          width={700}
          height={400}
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="x"
            label={{ value: 'Test Statistic', position: 'insideBottom', offset: -10 }}
            stroke="#6b7280"
          />
          <YAxis
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
              x={cv.toFixed(3)}
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

          {/* Sample test statistic */}
          {sampleData && (
            <ReferenceLine
              x={sampleData.testStatistic.toFixed(3)}
              stroke="#8b5cf6"
              strokeWidth={3}
              label={{
                value: `Observed: ${sampleData.testStatistic.toFixed(2)}`,
                position: 'top',
                fill: '#8b5cf6',
                fontSize: 12,
              }}
            />
          )}
        </ComposedChart>
      </div>

      {/* Legend explanations */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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
      <div className="mt-4 p-4 bg-amber-50 rounded-md border border-amber-200">
        <p className="text-xs text-amber-900 leading-relaxed">
          <strong>What you're seeing:</strong> The shaded region shows where we reject H₀.
          Under H₀ (solid line), the probability of landing in this region is exactly α = {state.alpha.toFixed(3)}.
          {showH1 && ` Under H₁ (dashed line), the probability of landing in the rejection region is the power = ${derived.power.toFixed(3)}.`}
        </p>
      </div>
    </div>
  );
};
