export interface ChoiceOption {
  text: string;
  correct?: boolean;
  /** shown after answering: why this option is right or wrong */
  why: string;
}

interface QuestionBase {
  id: string;
  prompt: string;
  /** shown after any answer */
  explanation: string;
  refs?: string[];
}

export interface ChoiceQuestion extends QuestionBase {
  kind: 'choice';
  options: ChoiceOption[];
}

export interface NumericQuestion extends QuestionBase {
  kind: 'numeric';
  answer: number;
  /** absolute tolerance */
  tolerance: number;
  unit?: string;
  /** e.g. "Enter a percentage" */
  inputHint?: string;
}

export type Question = ChoiceQuestion | NumericQuestion;
