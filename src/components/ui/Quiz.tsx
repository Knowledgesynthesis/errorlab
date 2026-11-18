import { useMemo, useState } from 'react';
import type { ChoiceQuestion, NumericQuestion, Question } from '../../content/types';
import { stableShuffle } from '../../lib/hash';
import { useProgress } from '../../lib/progress-context';
import { Cite } from './Cite';
import { Button } from './controls';

interface CardProps {
  q: Question;
  index?: number;
  onAnswered?: (correct: boolean) => void;
  /** record the first attempt in saved progress */
  track?: boolean;
}

export function QuestionCard({ q, index, onAnswered, track = true }: CardProps) {
  const { recordAnswer } = useProgress();
  const [result, setResult] = useState<{ correct: boolean; picked: string } | null>(null);

  const submit = (correct: boolean, picked: string) => {
    setResult({ correct, picked });
    if (track) recordAnswer(q.id, correct);
    onAnswered?.(correct);
  };

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <p className="mb-3 font-medium leading-snug text-slate-900">
        {index !== undefined && <span className="mr-1.5 text-slate-500">{index + 1}.</span>}
        {q.prompt}
      </p>
      {q.kind === 'choice' ? <ChoiceBody q={q} result={result} onSubmit={submit} /> : <NumericBody q={q} result={result} onSubmit={submit} />}
      {result && (
        <div className={`mt-3 rounded-lg px-3 py-2 text-sm leading-relaxed ${result.correct ? 'bg-emerald-50 text-emerald-950' : 'bg-orange-50 text-orange-950'}`} role="status">
          <p className="font-semibold">{result.correct ? 'Correct.' : 'Not quite.'}</p>
          <p className="mt-1">
            {q.explanation} {q.refs && q.refs.length > 0 && <Cite k={q.refs} />}
          </p>
          <div className="mt-2">
            <Button variant="ghost" className="-ml-2 px-2 py-1 text-xs" onClick={() => setResult(null)}>
              Try again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChoiceBody({ q, result, onSubmit }: { q: ChoiceQuestion; result: { correct: boolean; picked: string } | null; onSubmit: (c: boolean, picked: string) => void }) {
  const options = useMemo(() => stableShuffle(q.options, q.id), [q]);
  return (
    <ul className="space-y-2">
      {options.map((o) => {
        const picked = result?.picked === o.text;
        const show = result !== null && (picked || o.correct);
        const tone = !result ? 'ring-slate-200 hover:ring-slate-400 hover:bg-slate-50' : o.correct ? 'ring-emerald-500 bg-emerald-50' : picked ? 'ring-orange-500 bg-orange-50' : 'ring-slate-200 opacity-70';
        return (
          <li key={o.text}>
            <button type="button" disabled={result !== null} onClick={() => onSubmit(!!o.correct, o.text)} className={`w-full rounded-lg px-3 py-2 text-left text-sm ring-1 transition ${tone} disabled:cursor-default`}>
              <span className="flex items-start gap-2">
                <span aria-hidden className="mt-0.5 w-4 shrink-0 text-center font-semibold">
                  {result ? (o.correct ? '✓' : picked ? '✗' : '') : '○'}
                </span>
                <span>
                  <span className="text-slate-900">{o.text}</span>
                  {show && <span className="mt-1 block text-xs leading-relaxed text-slate-700">{o.why}</span>}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function NumericBody({ q, result, onSubmit }: { q: NumericQuestion; result: { correct: boolean; picked: string } | null; onSubmit: (c: boolean, picked: string) => void }) {
  const [value, setValue] = useState('');
  const parsed = Number(value.replace(',', '.').replace('%', ''));
  const valid = value.trim() !== '' && Number.isFinite(parsed);
  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit(Math.abs(parsed - q.answer) <= q.tolerance, value);
      }}
    >
      <input
        type="text"
        inputMode="decimal"
        aria-label="Your answer"
        disabled={result !== null}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-32 rounded-lg border border-slate-300 px-3 py-1.5 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50"
        placeholder={q.inputHint ?? 'Your answer'}
      />
      {q.unit && <span className="text-sm text-slate-600">{q.unit}</span>}
      {!result && (
        <Button type="submit" variant="primary" disabled={!valid}>
          Check
        </Button>
      )}
      {result && (
        <span className="text-sm text-slate-700">
          Answer: <strong className="font-mono">{q.answer}</strong>
          {q.unit ? ` ${q.unit}` : ''} (accepted ±{q.tolerance})
        </span>
      )}
    </form>
  );
}

/** A lesson's end-of-section checks; reports completion once all are answered. */
export function QuestionSet({ questions, onAllAnswered }: { questions: Question[]; onAllAnswered?: () => void }) {
  const [answered, setAnswered] = useState<Set<string>>(new Set());
  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <QuestionCard
          key={q.id}
          q={q}
          index={i}
          onAnswered={() => {
            if (answered.has(q.id)) return;
            const next = new Set(answered).add(q.id);
            setAnswered(next);
            if (next.size === questions.length) onAllAnswered?.();
          }}
        />
      ))}
    </div>
  );
}
