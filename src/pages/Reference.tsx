import React from 'react';
import { GlossaryCard } from '../components/GlossaryCard';

export const Reference: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Reference & Help
        </h1>
        <p className="text-gray-600">
          Definitions, formulas, and common misconceptions
        </p>
      </div>

      <GlossaryCard />

      {/* Key formulas */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-3">Key Formulas</h3>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-2">Test Statistic (one-sample z-test)</h4>
            <div className="font-mono text-sm bg-white p-3 rounded border border-gray-300 mb-2">
              z = (x̄ - μ₀) / (σ / √n)
            </div>
            <p className="text-xs text-gray-600">
              where x̄ is sample mean, μ₀ is null hypothesis mean, σ is population standard deviation, n is sample size
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-2">Test Statistic (one-sample t-test)</h4>
            <div className="font-mono text-sm bg-white p-3 rounded border border-gray-300 mb-2">
              t = (x̄ - μ₀) / (s / √n)
            </div>
            <p className="text-xs text-gray-600">
              where s is sample standard deviation (when σ is unknown), with df = n - 1
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-2">Power and Beta</h4>
            <div className="font-mono text-sm bg-white p-3 rounded border border-gray-300 mb-2">
              Power = 1 - β
            </div>
            <p className="text-xs text-gray-600 mb-2">
              β (Type II error rate) depends on α, n, effect size (δ), and variance (σ)
            </p>
            <p className="text-xs text-gray-600">
              Larger n, larger δ, larger α, or smaller σ → higher power (lower β)
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-2">Standard Error</h4>
            <div className="font-mono text-sm bg-white p-3 rounded border border-gray-300 mb-2">
              SE = σ / √n
            </div>
            <p className="text-xs text-gray-600">
              The standard deviation of the sampling distribution of the mean
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-2">Critical Values</h4>
            <p className="text-xs text-gray-600 mb-2">
              For two-sided test with α = 0.05:
            </p>
            <div className="font-mono text-sm bg-white p-3 rounded border border-gray-300">
              z-critical ≈ ±1.96<br/>
              t-critical ≈ ±2.0 (varies with df)
            </div>
          </div>
        </div>
      </div>

      {/* Decision flowchart */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-3">When to Use What</h3>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-md border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-900 mb-2">Use z-test when:</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Population standard deviation (σ) is known</li>
              <li>Sample size is large (n &gt; 30)</li>
              <li>Data is approximately normally distributed</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded-md border-l-4 border-green-500">
            <h4 className="font-bold text-green-900 mb-2">Use t-test when:</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Population standard deviation (σ) is unknown</li>
              <li>Sample size is small (n &lt; 30)</li>
              <li>Data is approximately normally distributed</li>
            </ul>
          </div>

          <div className="p-4 bg-purple-50 rounded-md border-l-4 border-purple-500">
            <h4 className="font-bold text-purple-900 mb-2">Choose sidedness based on:</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li><strong>Two-sided (μ ≠ μ₀):</strong> Testing if there is any difference (most common)</li>
              <li><strong>One-sided right (μ &gt; μ₀):</strong> Testing if parameter is greater</li>
              <li><strong>One-sided left (μ &lt; μ₀):</strong> Testing if parameter is smaller</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Additional resources */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-3">
          Additional Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              <strong>Always state your hypotheses clearly</strong> before collecting data
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              <strong>Choose α based on context:</strong> Medical studies often use 0.01, social sciences typically use 0.05
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              <strong>Report effect sizes,</strong> not just p-values – practical significance matters
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              <strong>Plan for adequate power</strong> (typically 80% or higher) when designing studies
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              <strong>Remember:</strong> Statistical significance ≠ practical importance
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
