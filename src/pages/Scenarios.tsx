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
    question: 'In the antihypertensive drug trial, what does a Type I error represent?',
    type: 'multiple-choice',
    options: [
      'Approving an ineffective drug that doesn\'t actually lower blood pressure',
      'Rejecting an effective drug that actually lowers blood pressure',
      'Correctly approving a drug that lowers blood pressure',
      'Correctly rejecting a drug that doesn\'t work',
    ],
    correctAnswer: 'Approving an ineffective drug that doesn\'t actually lower blood pressure',
    explanation: 'A Type I error occurs when we reject H₀ (drug has no effect) when it is actually true. This means approving a drug that doesn\'t actually work, giving patients false hope and potential side effects without benefit.',
  },
  {
    id: 'q2',
    question: 'For the osteoporosis treatment study, if we set α = 0.01 instead of α = 0.05, what happens?',
    type: 'multiple-choice',
    options: [
      'We decrease Type I errors (approving ineffective treatments) but increase Type II errors (missing effective treatments)',
      'We decrease both Type I and Type II errors',
      'We increase both Type I and Type II errors',
      'We increase Type I errors but decrease Type II errors',
    ],
    correctAnswer: 'We decrease Type I errors (approving ineffective treatments) but increase Type II errors (missing effective treatments)',
    explanation: 'Reducing α makes us more conservative about rejecting H₀, which reduces false approvals of ineffective treatments (Type I) but makes it harder to detect truly effective treatments, increasing missed opportunities (Type II).',
    hint: 'Think about the tradeoff between approving bad treatments vs. missing good ones',
  },
  {
    id: 'q3',
    question: 'If the drug formulation bioequivalence study has 80% power, what does this mean?',
    type: 'multiple-choice',
    options: [
      'There is an 80% chance of detecting a real difference in blood levels when it exists',
      'There is an 80% chance the null hypothesis is true',
      'There is an 80% chance of no Type I errors',
      'There is a 20% chance of Type I error',
    ],
    correctAnswer: 'There is an 80% chance of detecting a real difference in blood levels when it exists',
    explanation: 'Power = 1 - β is the probability of correctly rejecting H₀ when H₁ is true. 80% power means we will detect a true difference in blood levels 80% of the time when it actually exists, preventing potentially unsafe medications from reaching patients.',
  },
  {
    id: 'q4',
    question: 'For the antihypertensive drug trial, which change would INCREASE our ability to detect if the drug actually works?',
    type: 'multiple-choice',
    options: [
      'Increasing sample size (testing more patients)',
      'Decreasing alpha (α) to be more conservative',
      'Using patients with less variable blood pressure (smaller σ)',
      'Both A and C',
    ],
    correctAnswer: 'Both A and C',
    explanation: 'Increasing sample size increases power by providing more data. Using patients with less variable blood pressure (smaller σ) also increases power by reducing noise. Decreasing α would actually decrease power by making it harder to reject H₀.',
  },
  {
    id: 'q5',
    question: 'Why do we use a one-sided test for the blood pressure drug but a two-sided test for the formulation study?',
    type: 'multiple-choice',
    options: [
      'Blood pressure: we only care if it decreases. Formulation: any change (increase or decrease) in blood levels could be dangerous',
      'Blood pressure drugs always use one-sided tests by regulation',
      'Two-sided tests are more powerful for formulation studies',
      'One-sided tests are easier to calculate',
    ],
    correctAnswer: 'Blood pressure: we only care if it decreases. Formulation: any change (increase or decrease) in blood levels could be dangerous',
    explanation: 'For the antihypertensive drug, we use H₁: μ < μ₀ (one-sided left) because only a decrease in blood pressure is beneficial. For bioequivalence, we use H₁: μ ≠ μ₀ (two-sided) because both increases and decreases in blood levels could affect efficacy or safety.',
  },
];

export const Scenarios: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);

  const derived = calculateDerivedValues(selectedScenario.state);
  const tableData = calculate2x2Data(selectedScenario.state, derived);

  return (
    <div className="max-w-7xl mx-auto space-y-2">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Real-World Scenarios
        </h1>
        <p className="text-gray-600">
          Explore hypothesis testing through real pharmaceutical and clinical trial scenarios
        </p>
      </div>

      {/* Scenario switcher */}
      <ScenarioSwitcher
        currentScenario={selectedScenario}
        onScenarioChange={setSelectedScenario}
      />

      {/* Visualizations for selected scenario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
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
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
        <h3 className="text-lg font-bold text-indigo-900 mb-1">
          Understanding {selectedScenario.name}
        </h3>
        <p className="text-gray-700 mb-2">{selectedScenario.context}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
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

        <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
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
