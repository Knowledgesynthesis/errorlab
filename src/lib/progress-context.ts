import { createContext, useContext } from 'react';

export interface AnswerRecord {
  correct: boolean;
  at: number;
}

export interface ProgressState {
  /** lesson id → timestamp first completed (all checks answered) */
  completed: Record<string, number>;
  /** question id → first attempt */
  answers: Record<string, AnswerRecord>;
  /** best mastery test result */
  mastery: { score: number; total: number; at: number } | null;
}

export interface ProgressApi extends ProgressState {
  recordAnswer: (questionId: string, correct: boolean) => void;
  markCompleted: (lessonId: string) => void;
  recordMastery: (score: number, total: number) => void;
  reset: () => void;
}

export const EMPTY_PROGRESS: ProgressState = { completed: {}, answers: {}, mastery: null };

export const ProgressContext = createContext<ProgressApi | null>(null);

export function useProgress(): ProgressApi {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}
