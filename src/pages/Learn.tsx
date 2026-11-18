import { Link } from 'react-router';
import { LESSONS } from '../content/lessons';
import { LESSON_QUESTIONS, MASTERY_QUESTIONS } from '../content/questions';
import { useProgress } from '../lib/progress-context';
import { Cite } from '../components/ui/Cite';
import { Button } from '../components/ui/controls';

export default function Learn() {
  const { completed, answers, mastery, reset } = useProgress();
  const done = LESSONS.filter((l) => completed[l.id]).length;
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">The learning path</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Nine short lessons, each built around a live simulation. You predict before you see, then check yourself with questions — both shown to improve learning <Cite k={['crouch2004', 'roediger2006', 'dunlosky2013']} />. Progress is saved in this browser.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="h-2 w-48 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuemin={0} aria-valuemax={LESSONS.length} aria-valuenow={done} aria-label="Lessons completed">
          <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${(done / LESSONS.length) * 100}%` }} />
        </div>
        <span className="text-sm text-slate-600">
          {done} of {LESSONS.length} lessons complete
        </span>
        {(done > 0 || Object.keys(answers).length > 0) && (
          <Button variant="ghost" className="text-xs" onClick={() => window.confirm('Reset all saved progress?') && reset()}>
            Reset progress
          </Button>
        )}
      </div>
      <ol className="mt-6 space-y-3">
        {LESSONS.map((l, i) => {
          const qs = LESSON_QUESTIONS[l.id] ?? [];
          const right = qs.filter((q) => answers[q.id]?.correct).length;
          const tried = qs.filter((q) => answers[q.id]).length;
          return (
            <li key={l.id}>
              <Link to={`/learn/${l.id}`} className="group flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 transition hover:shadow-md hover:ring-slate-300">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold ${completed[l.id] ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`} aria-hidden>
                  {completed[l.id] ? '✓' : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-semibold text-slate-900 group-hover:underline">{l.title}</span>
                    <span className="text-xs text-slate-500">
                      ~{l.minutes} min{tried > 0 && ` · first-try score ${right}/${qs.length}`}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-sm text-slate-600">{l.summary}</span>
                </span>
              </Link>
            </li>
          );
        })}
        <li>
          <Link to="/mastery" className="group flex gap-4 rounded-2xl bg-slate-900 p-4 text-white transition hover:bg-slate-800">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold" aria-hidden>
              ★
            </span>
            <span className="flex-1">
              <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="font-semibold group-hover:underline">Mastery test</span>
                <span className="text-xs text-slate-300">{mastery ? `best: ${mastery.score}/${mastery.total}` : `${MASTERY_QUESTIONS.length} mixed questions`}</span>
              </span>
              <span className="mt-0.5 block text-sm text-slate-300">Applied problems across all nine lessons, in mixed order.</span>
            </span>
          </Link>
        </li>
      </ol>
    </div>
  );
}
