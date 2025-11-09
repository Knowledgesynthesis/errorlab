import React from 'react';
import { motion } from 'framer-motion';
import type { TwoByTwoData, ExperimentState } from '../types';
import { COLORS } from '../utils/constants';

interface TwoByTwoCardProps {
  data: TwoByTwoData;
  state: ExperimentState;
  scenario?: {
    h0: string;
    h1: string;
    type1Description: string;
    type2Description: string;
  };
}

export const TwoByTwoCard: React.FC<TwoByTwoCardProps> = ({ data, state, scenario }) => {
  const total = data.trueNegative + data.falsePositive + data.falseNegative + data.truePositive;

  const getCellPercentage = (count: number) => {
    return ((count / total) * 100).toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-xl font-bold text-gray-800 mb-1">2×2 Decision Table</h3>

      {scenario && (
        <div className="mb-1 p-2 bg-gray-50 rounded-md text-sm text-gray-700">
          <p><strong>H₀:</strong> {scenario.h0}</p>
          <p><strong>H₁:</strong> {scenario.h1}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-2 border-gray-300 p-2 bg-gray-100"></th>
              <th className="border-2 border-gray-300 p-2 bg-gray-100 text-center font-bold" colSpan={2}>
                Decision
              </th>
            </tr>
            <tr>
              <th className="border-2 border-gray-300 p-2 bg-gray-100 text-center font-bold">
                Truth
              </th>
              <th className="border-2 border-gray-300 p-2 bg-blue-50 text-center text-sm font-semibold">
                Fail to Reject H₀
              </th>
              <th className="border-2 border-gray-300 p-2 bg-red-50 text-center text-sm font-semibold">
                Reject H₀
              </th>
            </tr>
          </thead>
          <tbody>
            {/* H0 is True row */}
            <tr>
              <td className="border-2 border-gray-300 p-2 bg-blue-50 text-center font-semibold">
                H₀ True
              </td>
              {/* True Negative - Correct */}
              <motion.td
                className="border-2 border-gray-300 p-4 text-center"
                style={{ backgroundColor: `${COLORS.CORRECT}20` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="font-bold text-2xl text-gray-800">
                  {data.trueNegative.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {getCellPercentage(data.trueNegative)}%
                </div>
                <div className="text-xs text-gray-500 mt-2 font-semibold">
                  Correct Decision
                </div>
              </motion.td>
              {/* False Positive - Type I Error */}
              <motion.td
                className="border-2 border-gray-300 p-4 text-center"
                style={{ backgroundColor: `${COLORS.TYPE1}30` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="font-bold text-2xl" style={{ color: COLORS.TYPE1 }}>
                  {data.falsePositive.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {getCellPercentage(data.falsePositive)}%
                </div>
                <div className="text-xs font-semibold mt-2" style={{ color: COLORS.TYPE1 }}>
                  Type I Error (α)
                </div>
                {scenario && (
                  <div className="text-xs text-gray-600 mt-1 italic">
                    {scenario.type1Description}
                  </div>
                )}
              </motion.td>
            </tr>
            {/* H1 is True row */}
            <tr>
              <td className="border-2 border-gray-300 p-2 bg-red-50 text-center font-semibold">
                H₁ True
              </td>
              {/* False Negative - Type II Error */}
              <motion.td
                className="border-2 border-gray-300 p-4 text-center"
                style={{ backgroundColor: `${COLORS.TYPE2}30` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="font-bold text-2xl" style={{ color: COLORS.TYPE2 }}>
                  {data.falseNegative.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {getCellPercentage(data.falseNegative)}%
                </div>
                <div className="text-xs font-semibold mt-2" style={{ color: COLORS.TYPE2 }}>
                  Type II Error (β)
                </div>
                {scenario && (
                  <div className="text-xs text-gray-600 mt-1 italic">
                    {scenario.type2Description}
                  </div>
                )}
              </motion.td>
              {/* True Positive - Power */}
              <motion.td
                className="border-2 border-gray-300 p-4 text-center"
                style={{ backgroundColor: `${COLORS.POWER}30` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="font-bold text-2xl" style={{ color: COLORS.POWER }}>
                  {data.truePositive.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {getCellPercentage(data.truePositive)}%
                </div>
                <div className="text-xs font-semibold mt-2" style={{ color: COLORS.POWER }}>
                  Power (1-β)
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Correct Detection
                </div>
              </motion.td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary stats */}
      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
        <div className="p-2 bg-red-50 rounded-md border border-red-200">
          <div className="text-xs text-gray-600 mb-1">Type I Rate</div>
          <div className="text-lg font-bold" style={{ color: COLORS.TYPE1 }}>
            {(state.alpha * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-2 bg-blue-50 rounded-md border border-blue-200">
          <div className="text-xs text-gray-600 mb-1">Type II Rate</div>
          <div className="text-lg font-bold" style={{ color: COLORS.TYPE2 }}>
            {((data.falseNegative / (data.falseNegative + data.truePositive)) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-2 bg-green-50 rounded-md border border-green-200">
          <div className="text-xs text-gray-600 mb-1">Power</div>
          <div className="text-lg font-bold" style={{ color: COLORS.POWER }}>
            {((data.truePositive / (data.falseNegative + data.truePositive)) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Total Cases</div>
          <div className="text-lg font-bold text-gray-800">
            {total.toLocaleString()}
          </div>
        </div>
      </div>

      {/* How to Read This Table */}
      <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-300">
        <h4 className="text-sm font-bold text-blue-900 mb-1">📊 How to Read This Table:</h4>
        <ol className="text-xs text-blue-900 space-y-1 list-decimal list-inside">
          <li><strong>Rows (Truth):</strong> What reality actually is - either H₀ is true (no effect) or H₁ is true (effect exists)</li>
          <li><strong>Columns (Decision):</strong> What we decide based on our test - either fail to reject H₀ or reject H₀</li>
          <li><strong>Each cell:</strong> Shows how many cases fall into that combination of truth and decision</li>
          <li><strong>Cell colors:</strong> Gray = correct decisions, Red = Type I error, Blue = Type II error, Green = power</li>
        </ol>
      </div>

      {/* What Each Cell Means */}
      <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-300">
        <h4 className="text-sm font-bold text-green-900 mb-1">👁️ What Each Cell Means:</h4>
        <div className="text-xs text-green-900 space-y-1">
          <p><strong>Top-left (Gray):</strong> Correct decisions when H₀ is true - we correctly fail to reject when there's no effect</p>
          <p><strong>Top-right (Red):</strong> Type I errors (α = {(state.alpha * 100).toFixed(1)}%) - we incorrectly reject H₀ when it's actually true (false alarm)</p>
          <p><strong>Bottom-left (Blue):</strong> Type II errors (β) - we fail to detect a real effect when H₁ is true (miss)</p>
          <p><strong>Bottom-right (Green):</strong> Power (1-β) - we correctly detect the effect when H₁ is true (true positive)</p>
        </div>
      </div>

      {/* Key Takeaways */}
      <div className="mt-2 p-2 bg-purple-50 rounded-md border border-purple-200">
        <h4 className="text-sm font-bold text-purple-900 mb-1">🎯 Key Takeaways:</h4>
        <ul className="text-xs text-purple-900 leading-relaxed space-y-1">
          <li>Out of {total.toLocaleString()} hypothetical cases, {((state.prevalence * 100).toFixed(0))}% truly have H₁ (effect exists)</li>
          <li>We correctly detect {data.truePositive.toLocaleString()} of these real effects (power = {((data.truePositive / (data.falseNegative + data.truePositive)) * 100).toFixed(1)}%)</li>
          <li>We miss {data.falseNegative.toLocaleString()} real effects (Type II error)</li>
          <li>We incorrectly reject H₀ in {data.falsePositive.toLocaleString()} cases where it's actually true (Type I error)</li>
          <li><strong>Trade-off:</strong> Lower α means fewer false alarms but potentially more missed detections</li>
        </ul>
      </div>
    </div>
  );
};
