import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { MASTERY_QUESTIONS } from '../content/questions';
import { stableShuffle } from '../lib/hash';
import { useProgress } from '../lib/progress-context';
import { Cite } from '../components/ui/Cite';
import { Button } from '../components/ui/controls';
import { QuestionCard } from '../components/ui/Quiz';

const PASS = 0.8;

export default function Mastery() {
  const { recordMastery, mastery } = useProgress();
  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const questions = useMemo(() => stableShuffle(MASTERY_QUESTIONS, `round-${round}`), [round]);
  const finished = index >= questions.length;
  const score = results.filter(Boolean).length;

  const restart = () => {
    setRound((r) => r + 1);
    setIndex(0);
    setResults([]);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mastery test</h1>
      <p className="mt-2 text-slate-600">
        {questions.length} applied questions spanning all lessons, in mixed order — mixing topics forces you to recognise which idea applies, which is what real problems demand <Cite k="rohrer2007" />. Your first answer to each question is scored; {Math.round(PASS * 100)}% or more counts as mastery.
      </p>
      {mastery && (
        <p className="mt-2 text-sm text-slate-500">
          Best so far: {mastery.score}/{mastery.total}
        </p>
      )}
      {!finished ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between text-sm text-slate-600">
            <span>
              Question {index + 1} of {questions.length}
            </span>
            <span>Score: {score}</span>
          </div>
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-slate-900 transition-all" style={{ width: `${(index / questions.length) * 100}%` }} />
          </div>
          <QuestionCard
            key={`${round}-${questions[index].id}`}
            q={questions[index]}
            track={false}
            onAnswered={(correct) => {
              if (results.length === index) setResults([...results, correct]);
            }}
          />
          {results.length > index && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  const next = index + 1;
                  setIndex(next);
                  if (next === questions.length) recordMastery(results.filter(Boolean).length, questions.length);
                }}
              >
                {index + 1 < questions.length ? 'Next question →' : 'See result'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl bg-white p-6 text-center ring-1 ring-slate-200">
          <div className={`font-mono text-5xl font-bold ${score / questions.length >= PASS ? 'text-emerald-700' : 'text-amber-700'}`}>
            {score} / {questions.length}
          </div>
          <p className="mt-2 text-slate-700">{score / questions.length >= PASS ? 'Mastery reached. You can read, design and critique hypothesis tests with confidence.' : 'Not yet. Revisit the lessons behind the questions you missed, then try again tomorrow — spacing your practice improves retention.'}{' '}
            {score / questions.length < PASS && <Cite k="dunlosky2013" />}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button variant="primary" onClick={restart}>
              Try again (new order)
            </Button>
            <Link to="/learn" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-800 ring-1 ring-slate-300 hover:bg-slate-50">
              Back to lessons
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
