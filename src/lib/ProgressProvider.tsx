import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readJSON, writeJSON } from './storage';
import { EMPTY_PROGRESS, ProgressContext, type ProgressApi, type ProgressState } from './progress-context';

const KEY = 'errorlab.progress.v2';

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => ({ ...EMPTY_PROGRESS, ...readJSON<Partial<ProgressState>>(KEY, {}) }));

  useEffect(() => writeJSON(KEY, state), [state]);

  const recordAnswer = useCallback((questionId: string, correct: boolean) => {
    setState((s) => (s.answers[questionId] ? s : { ...s, answers: { ...s.answers, [questionId]: { correct, at: Date.now() } } }));
  }, []);

  const markCompleted = useCallback((lessonId: string) => {
    setState((s) => (s.completed[lessonId] ? s : { ...s, completed: { ...s.completed, [lessonId]: Date.now() } }));
  }, []);

  const recordMastery = useCallback((score: number, total: number) => {
    setState((s) => {
      const best = s.mastery && s.mastery.score / s.mastery.total >= score / total ? s.mastery : { score, total, at: Date.now() };
      return { ...s, mastery: best };
    });
  }, []);

  const reset = useCallback(() => setState(EMPTY_PROGRESS), []);

  const api = useMemo<ProgressApi>(() => ({ ...state, recordAnswer, markCompleted, recordMastery, reset }), [state, recordAnswer, markCompleted, recordMastery, reset]);

  return <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>;
}
