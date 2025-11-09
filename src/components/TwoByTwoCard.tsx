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
      <h3 className="text-xl font-bold text-gray-800 mb-3">2×2 Decision Table</h3>

      {scenario && (
        <div className="mb-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
          <p><strong>H₀:</strong> {scenario.h0}</p>
          <p><strong>H₁:</strong> {scenario.h1}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-2 border-gray-300 p-3 bg-gray-100"></th>
              <th className="border-2 border-gray-300 p-3 bg-gray-100 text-center font-bold" colSpan={2}>
                Decision
              </th>
            </tr>
            <tr>
              <th className="border-2 border-gray-300 p-3 bg-gray-100 text-center font-bold">
                Truth
              </th>
              <th className="border-2 border-gray-300 p-3 bg-blue-50 text-center text-sm font-semibold">
                Fail to Reject H₀
              </th>
              <th className="border-2 border-gray-300 p-3 bg-red-50 text-center text-sm font-semibold">
                Reject H₀
              </th>
            </tr>
          </thead>
          <tbody>
            {/* H0 is True row */}
            <tr>
              <td className="border-2 border-gray-300 p-3 bg-blue-50 text-center font-semibold">
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
              <td className="border-2 border-gray-300 p-3 bg-red-50 text-center font-semibold">
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
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-red-50 rounded-md border border-red-200">
          <div className="text-xs text-gray-600 mb-1">Type I Rate</div>
          <div className="text-lg font-bold" style={{ color: COLORS.TYPE1 }}>
            {(state.alpha * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="text-xs text-gray-600 mb-1">Type II Rate</div>
          <div className="text-lg font-bold" style={{ color: COLORS.TYPE2 }}>
            {((data.falseNegative / (data.falseNegative + data.truePositive)) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-3 bg-green-50 rounded-md border border-green-200">
          <div className="text-xs text-gray-600 mb-1">Power</div>
          <div className="text-lg font-bold" style={{ color: COLORS.POWER }}>
            {((data.truePositive / (data.falseNegative + data.truePositive)) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Total Cases</div>
          <div className="text-lg font-bold text-gray-800">
            {total.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-3 p-3 bg-purple-50 rounded-md border border-purple-200">
        <p className="text-xs text-purple-900 leading-relaxed">
          <strong>Understanding the table:</strong> Out of {total.toLocaleString()} hypothetical cases,{' '}
          {((state.prevalence * 100).toFixed(0))}% truly have H₁ (effect exists).
          With current settings, we correctly detect {data.truePositive.toLocaleString()} of these (power),
          but miss {data.falseNegative.toLocaleString()} (Type II error).
        </p>
      </div>
    </div>
  );
};
