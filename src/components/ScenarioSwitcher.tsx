import React from 'react';
import type { Scenario } from '../types';
import { scenarios } from '../utils/scenarios';

interface ScenarioSwitcherProps {
  currentScenario: Scenario | null;
  onScenarioChange: (scenario: Scenario) => void;
}

export const ScenarioSwitcher: React.FC<ScenarioSwitcherProps> = ({
  currentScenario,
  onScenarioChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-xl font-bold text-gray-800 mb-1">Scenarios</h3>
      <p className="text-sm text-gray-600 mb-1">
        Load a preset scenario to see hypothesis testing in real-world contexts
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onScenarioChange(scenario)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              currentScenario?.id === scenario.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-400 bg-white'
            }`}
            aria-pressed={currentScenario?.id === scenario.id}
          >
            <h4 className="font-bold text-gray-800 mb-2">{scenario.name}</h4>
            <p className="text-xs text-gray-600 mb-1">{scenario.description}</p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>
                <strong>H₀:</strong> {scenario.metaphor.h0}
              </div>
              <div>
                <strong>H₁:</strong> {scenario.metaphor.h1}
              </div>
            </div>
          </button>
        ))}
      </div>

      {currentScenario && (
        <div className="mt-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-md border border-blue-200">
          <h4 className="font-bold text-gray-800 mb-2">Current Scenario: {currentScenario.name}</h4>
          <p className="text-sm text-gray-700 mb-1">{currentScenario.context}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-red-50 rounded border border-red-200">
              <strong className="text-red-800">Type I Error:</strong>
              <p className="text-gray-700 mt-1">{currentScenario.metaphor.type1Description}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded border border-blue-200">
              <strong className="text-blue-800">Type II Error:</strong>
              <p className="text-gray-700 mt-1">{currentScenario.metaphor.type2Description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
