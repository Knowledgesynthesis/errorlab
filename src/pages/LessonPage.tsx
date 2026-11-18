import { Link, useParams } from 'react-router';
import { LESSON_BY_ID, LESSONS } from '../content/lessons';
import { LESSON_QUESTIONS } from '../content/questions';
import { LESSON_COMPONENTS } from '../lessons';
import { useProgress } from '../lib/progress-context';
import { QuestionSet } from '../components/ui/Quiz';
import NotFound from './NotFound';

export default function LessonPage() {
  const { lessonId = '' } = useParams();
  const meta = LESSON_BY_ID[lessonId];
  const Body = LESSON_COMPONENTS[lessonId];
  const { completed, markCompleted } = useProgress();
  if (!meta || !Body) return <NotFound />;
  const idx = LESSONS.findIndex((l) => l.id === lessonId);
  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];
  const questions = LESSON_QUESTIONS[lessonId] ?? [];
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <nav aria-label="Lessons" className="sticky top-20 space-y-1">
          <Link to="/learn" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800">
            Learning path
          </Link>
          {LESSONS.map((l, i) => (
            <Link key={l.id} to={`/learn/${l.id}`} aria-current={l.id === lessonId ? 'page' : undefined} className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm ${l.id === lessonId ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200/60'}`}>
              <span className="w-4 shrink-0 text-right font-mono text-xs leading-5 opacity-70">{completed[l.id] ? '✓' : i + 1}</span>
              <span>{l.title}</span>
            </Link>
          ))}
          <Link to="/mastery" className="mt-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-200/60">
            <span className="w-4 text-right text-xs">★</span> Mastery test
          </Link>
        </nav>
      </aside>
      <article className="min-w-0">
        <header className="mb-6">
          <div className="text-sm font-medium text-slate-500">
            Lesson {idx + 1} of {LESSONS.length} · ~{meta.minutes} min
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{meta.title}</h1>
          <div className="mt-3 rounded-xl bg-white p-3 text-sm ring-1 ring-slate-200">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">After this lesson you can</div>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-slate-700">
              {meta.outcomes.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        </header>
        <Body />
        <section className="mt-10" aria-labelledby="check">
          <h2 id="check" className="mb-1 text-xl font-semibold text-slate-900">
            Check your understanding
          </h2>
          <p className="mb-4 text-sm text-slate-600">Answer from memory before scrolling back up: retrieval is what makes it stick.</p>
          <QuestionSet key={lessonId} questions={questions} onAllAnswered={() => markCompleted(lessonId)} />
          {completed[lessonId] && <p className="mt-3 text-sm font-medium text-emerald-700">Lesson complete.</p>}
        </section>
        <nav className="mt-10 flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-6" aria-label="Lesson navigation">
          {prev ? (
            <Link to={`/learn/${prev.id}`} className="rounded-lg px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-300 hover:bg-white">
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={`/learn/${next.id}`} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
              Next: {next.title} →
            </Link>
          ) : (
            <Link to="/mastery" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
              Take the mastery test →
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
