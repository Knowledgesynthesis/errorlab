import type { ComponentType } from 'react';
import { LessonAlpha, LessonDecisions, LessonNoise } from './part1';
import { LessonFpr, LessonPower, LessonPValues } from './part2';
import { LessonDesign, LessonExaggeration, LessonMultiplicity } from './part3';

export const LESSON_COMPONENTS: Record<string, ComponentType> = {
  decisions: LessonDecisions,
  noise: LessonNoise,
  alpha: LessonAlpha,
  power: LessonPower,
  pvalues: LessonPValues,
  fpr: LessonFpr,
  exaggeration: LessonExaggeration,
  multiplicity: LessonMultiplicity,
  design: LessonDesign,
};
