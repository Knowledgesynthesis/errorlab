import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { glossary, commonMisconceptions } from '../utils/scenarios';

export const GlossaryCard: React.FC = () => {
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [showMisconceptions, setShowMisconceptions] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-xl font-bold text-gray-800 mb-1">Reference & Glossary</h3>

      <div className="mb-2">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setShowMisconceptions(false)}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              !showMisconceptions
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Glossary
          </button>
          <button
            onClick={() => setShowMisconceptions(true)}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              showMisconceptions
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Common Misconceptions
          </button>
        </div>

        {!showMisconceptions ? (
          <div className="space-y-2">
            {glossary.map((item) => (
              <div key={item.term} className="border border-gray-200 rounded-md overflow-hidden">
                <button
                  onClick={() => setExpandedTerm(expandedTerm === item.term ? null : item.term)}
                  className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
                >
                  <span className="font-semibold text-gray-800">
                    {item.term}
                    {item.symbol && (
                      <span className="ml-2 text-sm text-gray-600">({item.symbol})</span>
                    )}
                  </span>
                  <span className="text-gray-500">{expandedTerm === item.term ? '−' : '+'}</span>
                </button>
                <AnimatePresence>
                  {expandedTerm === item.term && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-2 bg-white border-t border-gray-200">
                        <p className="text-sm text-gray-700 mb-2">{item.definition}</p>
                        {item.example && (
                          <p className="text-xs text-gray-600 italic">
                            <strong>Example:</strong> {item.example}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {commonMisconceptions.map((item, idx) => (
              <div key={idx} className="p-4 bg-red-50 border border-red-200 rounded-md">
                <h4 className="font-bold text-red-800 mb-2">
                  ✗ Misconception: {item.misconception}
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  <strong className="text-green-700">✓ Reality:</strong> {item.reality}
                </p>
                <p className="text-xs text-gray-600 italic">{item.example}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
