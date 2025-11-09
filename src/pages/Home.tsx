import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
  const features = [
    {
      title: 'Interactive 2×2 Table',
      description: 'Visualize the confusion matrix of hypothesis testing decisions',
      link: '/interactive',
      icon: '📊',
    },
    {
      title: 'p-value Explorer',
      description: 'Generate samples and understand what p-values really mean',
      link: '/pvalue',
      icon: '🔍',
    },
    {
      title: 'Power Analysis',
      description: 'See how sample size and effect size affect statistical power',
      link: '/power',
      icon: '📈',
    },
    {
      title: 'Real Scenarios',
      description: 'Apply concepts to medical testing, A/B tests, and quality control',
      link: '/scenarios',
      icon: '🏥',
    },
  ];

  const concepts = [
    { term: 'Type I Error (α)', desc: 'Rejecting H₀ when it\'s true (false positive)', color: 'bg-red-100 border-red-300' },
    { term: 'Type II Error (β)', desc: 'Failing to reject H₀ when H₁ is true (false negative)', color: 'bg-blue-100 border-blue-300' },
    { term: 'Power (1-β)', desc: 'Probability of correctly detecting a true effect', color: 'bg-green-100 border-green-300' },
    { term: 'p-value', desc: 'Probability of observing data this extreme if H₀ is true', color: 'bg-purple-100 border-purple-300' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-2"
      >
        <h1 className="text-5xl font-bold text-gray-900 mb-1">
          ErrorLab
        </h1>
        <p className="text-2xl text-gray-600 mb-2">
          Interactive Stats Playground
        </p>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Learn hypothesis testing through hands-on exploration. Understand Type I and Type II errors,
          p-values, and statistical power with interactive visualizations and real-world scenarios.
        </p>
      </motion.div>

      {/* Key concepts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-2"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">
          Core Concepts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {concepts.map((concept, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg border-2 ${concept.color}`}
            >
              <h3 className="font-bold text-gray-800 mb-1">{concept.term}</h3>
              <p className="text-sm text-gray-700">{concept.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-2"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">
          Explore & Learn
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {features.map((feature, idx) => (
            <Link
              key={idx}
              to={feature.link}
              className="block p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500"
            >
              <div className="text-4xl mb-1">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Quick start */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-2 border border-blue-200"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          How It Works
        </h2>
        <ol className="space-y-1 text-gray-700">
          <li className="flex items-start">
            <span className="font-bold text-blue-600 mr-3">1.</span>
            <span>
              <strong>Choose a scenario</strong> or start with default parameters (medical test, A/B test, quality control)
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-blue-600 mr-3">2.</span>
            <span>
              <strong>Adjust the sliders</strong> to change α, sample size, effect size, and variance
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-blue-600 mr-3">3.</span>
            <span>
              <strong>Watch the visualizations update</strong> in real-time to see the effects on Type I/II errors and power
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-blue-600 mr-3">4.</span>
            <span>
              <strong>Generate samples</strong> to see p-values and test decisions in action
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-blue-600 mr-3">5.</span>
            <span>
              <strong>Test your understanding</strong> with quizzes and explore common misconceptions
            </span>
          </li>
        </ol>
        <div className="mt-2">
          <Link
            to="/interactive"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            Start Exploring →
          </Link>
        </div>
      </motion.div>

    </div>
  );
};
