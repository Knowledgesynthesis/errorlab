import React, { useState } from 'react';
import type { QuizQuestion } from '../types';
import { ScenarioSwitcher } from '../components/ScenarioSwitcher';
import { Quiz } from '../components/Quiz';
import { DistributionPlot } from '../components/DistributionPlot';
import { TwoByTwoCard } from '../components/TwoByTwoCard';
import { calculateDerivedValues, calculate2x2Data } from '../utils/statistics';
import { scenarios } from '../utils/scenarios';

const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'In medical screening, what does a Type I error represent?',
    type: 'multiple-choice',
    options: [
      'Telling a healthy person they have the disease',
      'Telling a sick person they are healthy',
      'Correctly diagnosing a sick person',
      'Correctly diagnosing a healthy person',
    ],
    correctAnswer: 'Telling a healthy person they have the disease',
    explanation: 'A Type I error occurs when we reject H₀ (person is healthy) when it is actually true. This is a false positive.',
  },
  {
    id: 'q2',
    question: 'In an A/B test, if we set α = 0.01 instead of α = 0.05, what happens?',
    type: 'multiple-choice',
    options: [
      'We decrease Type I errors but increase Type II errors',
      'We decrease both Type I and Type II errors',
      'We increase both Type I and Type II errors',
      'We increase Type I errors but decrease Type II errors',
    ],
    correctAnswer: 'We decrease Type I errors but increase Type II errors',
    explanation: 'Reducing α makes us more conservative about rejecting H₀, which reduces false positives (Type I) but makes it harder to detect real effects, increasing false negatives (Type II).',
    hint: 'Think about the tradeoff between the two types of errors',
  },
  {
    id: 'q3',
    question: 'If a quality control test has 80% power, what does this mean?',
    type: 'multiple-choice',
    options: [
      'There is an 80% chance of detecting a defect when it exists',
      'There is an 80% chance the null hypothesis is true',
      'There is an 80% chance of no Type I errors',
      'There is a 20% chance of Type I error',
    ],
    correctAnswer: 'There is an 80% chance of detecting a defect when it exists',
    explanation: 'Power = 1 - β is the probability of correctly rejecting H₀ when H₁ is true. 80% power means we will detect the defect 80% of the time when it truly exists.',
  },
  {
    id: 'q4',
    question: 'Which change would INCREASE statistical power?',
    type: 'multiple-choice',
    options: [
      'Increasing sample size',
      'Decreasing alpha (α)',
      'Decreasing effect size',
      'Increasing variance',
    ],
    correctAnswer: 'Increasing sample size',
    explanation: 'Increasing sample size increases power by making our estimates more precise. Decreasing α, effect size, or increasing variance all decrease power.',
  },
];

export const Scenarios: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);

  const derived = calculateDerivedValues(selectedScenario.state);
  const tableData = calculate2x2Data(selectedScenario.state, derived);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Real-World Scenarios
        </h1>
        <p className="text-gray-600">
          See hypothesis testing concepts in medical testing, A/B tests, and quality control
        </p>
      </div>

      {/* Scenario switcher */}
      <ScenarioSwitcher
        currentScenario={selectedScenario}
        onScenarioChange={setSelectedScenario}
      />

      {/* Visualizations for selected scenario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DistributionPlot
          state={selectedScenario.state}
          derived={derived}
          showH1={true}
          scenarioId={selectedScenario.id}
        />

        <TwoByTwoCard
          data={tableData}
          state={selectedScenario.state}
          scenario={selectedScenario.metaphor}
        />
      </div>

      {/* Context-specific insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
        <h3 className="text-lg font-bold text-indigo-900 mb-3">
          Understanding {selectedScenario.name}
        </h3>
        <p className="text-gray-700 mb-4">{selectedScenario.context}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-white rounded border border-red-200">
            <h4 className="font-bold text-red-800 mb-2">Cost of Type I Error</h4>
            <p className="text-gray-700">{selectedScenario.metaphor.type1Description}</p>
            <p className="text-xs text-gray-600 mt-2">
              Current rate: <strong>{(selectedScenario.state.alpha * 100).toFixed(1)}%</strong>
            </p>
          </div>
          <div className="p-4 bg-white rounded border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2">Cost of Type II Error</h4>
            <p className="text-gray-700">{selectedScenario.metaphor.type2Description}</p>
            <p className="text-xs text-gray-600 mt-2">
              Current rate: <strong>{(derived.beta * 100).toFixed(1)}%</strong>
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-xs text-yellow-900">
            <strong>Key insight:</strong> Different scenarios may warrant different α levels.
            In medical screening for serious diseases, we might accept higher α (more false positives)
            to reduce β (fewer missed cases). In quality control, we might prefer lower α to avoid
            unnecessary production stoppages.
          </p>
        </div>
      </div>

      {/* Quiz */}
      <Quiz questions={quizQuestions} />
    </div>
  );
};
