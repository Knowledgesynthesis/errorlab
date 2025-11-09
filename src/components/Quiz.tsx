import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizQuestion } from '../types';

interface QuizProps {
  questions: QuizQuestion[];
}

export const Quiz: React.FC<QuizProps> = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string | number) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer.toString() === currentQuestion.correctAnswer.toString();
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setCompleted(true);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-2xl font-bold text-gray-800 mb-1">Quiz Complete!</h3>
        <div className="text-center py-8">
          <div className="text-6xl font-bold mb-2" style={{ color: score / questions.length >= 0.7 ? '#10b981' : '#f59e0b' }}>
            {score} / {questions.length}
          </div>
          <p className="text-lg text-gray-700 mb-6">
            You scored {((score / questions.length) * 100).toFixed(0)}%
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isCorrect = selectedAnswer?.toString() === currentQuestion.correctAnswer.toString();

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-xl font-bold text-gray-800">Quick Check</h3>
        <span className="text-sm text-gray-600">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
      </div>

      <div className="mb-2">
        <p className="text-base text-gray-800 font-medium mb-1">{currentQuestion.question}</p>

        {currentQuestion.hint && !showFeedback && (
          <div className="mb-1 p-2 bg-yellow-50 rounded-md border border-yellow-200">
            <p className="text-xs text-yellow-800">
              <strong>Hint:</strong> {currentQuestion.hint}
            </p>
          </div>
        )}

        <div className="space-y-2">
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options ? (
            currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => !showFeedback && handleAnswerSelect(option)}
                disabled={showFeedback}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === option
                    ? showFeedback
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="text-sm font-medium">{option}</span>
                {showFeedback && option === currentQuestion.correctAnswer && (
                  <span className="ml-2 text-green-600">✓ Correct</span>
                )}
                {showFeedback && selectedAnswer === option && !isCorrect && (
                  <span className="ml-2 text-red-600">✗ Incorrect</span>
                )}
              </button>
            ))
          ) : (
            <input
              type="number"
              step="0.01"
              onChange={(e) => !showFeedback && setSelectedAnswer(parseFloat(e.target.value))}
              disabled={showFeedback}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your answer"
            />
          )}
        </div>

        {currentQuestion.type === 'numeric' && !showFeedback && (
          <button
            onClick={() => selectedAnswer !== null && handleAnswerSelect(selectedAnswer)}
            disabled={selectedAnswer === null}
            className="mt-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        )}
      </div>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-2 p-4 rounded-lg border ${
              isCorrect
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <p className={`font-bold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
              {isCorrect ? '✓ Correct!' : '✗ Not quite'}
            </p>
            <p className="text-sm text-gray-700">{currentQuestion.explanation}</p>
            {!isCorrect && (
              <p className="text-sm text-gray-700 mt-2">
                <strong>Correct answer:</strong> {currentQuestion.correctAnswer}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showFeedback && (
        <button
          onClick={handleNext}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
        </button>
      )}

      {/* Progress bar */}
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
