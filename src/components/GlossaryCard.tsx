import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { glossary, commonMisconceptions, keyFormulas } from '../utils/scenarios';

type TabType = 'glossary' | 'misconceptions' | 'formulas';

export const GlossaryCard: React.FC = () => {
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('glossary');

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-xl font-bold text-gray-800 mb-1">Reference & Glossary</h3>

      <div className="mb-2">
        <div className="flex gap-2 mb-2 flex-wrap">
          <button
            onClick={() => setActiveTab('glossary')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'glossary'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Glossary
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'formulas'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Key Formulas
          </button>
          <button
            onClick={() => setActiveTab('misconceptions')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'misconceptions'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Common Misconceptions
          </button>
        </div>

        {activeTab === 'glossary' && (
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
        )}

        {activeTab === 'formulas' && (
          <div className="space-y-2">
            {keyFormulas.map((formula, idx) => (
              <div key={idx} className="border border-gray-200 rounded-md overflow-hidden">
                <button
                  onClick={() => setExpandedTerm(expandedTerm === formula.name ? null : formula.name)}
                  className="w-full p-3 text-left bg-green-50 hover:bg-green-100 transition-colors flex justify-between items-center"
                >
                  <div>
                    <span className="font-semibold text-gray-800 block">{formula.name}</span>
                    <span className="text-sm text-gray-600 font-mono mt-1 block">{formula.formula}</span>
                  </div>
                  <span className="text-gray-500">{expandedTerm === formula.name ? '−' : '+'}</span>
                </button>
                <AnimatePresence>
                  {expandedTerm === formula.name && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-2 bg-white border-t border-gray-200">
                        <div className="mb-2">
                          <p className="text-xs font-bold text-gray-700 mb-1">Variables:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {formula.variables.map((v, vidx) => (
                              <li key={vidx} className="ml-4">
                                <span className="font-mono font-semibold">{v.symbol}</span> = {v.meaning}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{formula.description}</p>
                        {formula.example && (
                          <p className="text-xs text-gray-600 italic">
                            <strong>Example:</strong> {formula.example}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'misconceptions' && (
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
