/**
 * Content integrity: every citation resolves, every question is well formed,
 * and numeric answers agree with the statistics engine.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { falsePositiveRisk, familyWiseErrorRate, requiredN } from '../stats';
import { CASES } from './cases';
import { GLOSSARY } from './glossary';
import { LESSON_BY_ID, LESSONS } from './lessons';
import { MISCONCEPTIONS } from './misconceptions';
import { ALL_QUESTIONS, LESSON_QUESTIONS, MASTERY_QUESTIONS } from './questions';
import { REF_BY_KEY, REFERENCES } from './references';

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? sourceFiles(p) : /\.tsx?$/.test(f) ? [p] : [];
  });
}

describe('references', () => {
  it('keys are unique and URLs well formed', () => {
    const keys = REFERENCES.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const r of REFERENCES) expect(r.url).toMatch(/^https:\/\//);
  });

  it('every <Cite k=…> and refs: […] in the source points to a known reference', () => {
    const used = new Set<string>();
    for (const f of sourceFiles('src').filter((x) => !/\.test\.tsx?$/.test(x))) {
      const text = readFileSync(f, 'utf8');
      for (const m of text.matchAll(/<Cite k=(?:"([^"]+)"|\{\[([^\]]+)\]\})/g)) {
        const list = m[1] ? [m[1]] : m[2].split(',').map((s) => s.trim().replace(/^'|'$/g, ''));
        list.forEach((k) => used.add(k));
      }
      for (const m of text.matchAll(/refs: \[([^\]]*)\]/g)) {
        m[1].split(',').map((s) => s.trim().replace(/^'|'$/g, '')).filter(Boolean).forEach((k) => used.add(k));
      }
    }
    const unknown = [...used].filter((k) => !k.startsWith('...') && !REF_BY_KEY[k]);
    expect(unknown).toEqual([]);
    expect(used.size).toBeGreaterThan(30);
  });
});

describe('questions', () => {
  it('ids are unique across lessons, mastery test and cases', () => {
    const ids = [...ALL_QUESTIONS, ...CASES.flatMap((c) => c.questions)].map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every lesson has at least three checks', () => {
    for (const l of LESSONS) expect(LESSON_QUESTIONS[l.id]?.length ?? 0).toBeGreaterThanOrEqual(3);
    expect(MASTERY_QUESTIONS.length).toBeGreaterThanOrEqual(12);
  });

  it('multiple-choice questions have exactly one correct option, unique texts and feedback for every option', () => {
    for (const q of [...ALL_QUESTIONS, ...CASES.flatMap((c) => c.questions)]) {
      if (q.kind !== 'choice') continue;
      expect(q.options.filter((o) => o.correct).length, q.id).toBe(1);
      expect(new Set(q.options.map((o) => o.text)).size, q.id).toBe(q.options.length);
      for (const o of q.options) expect(o.why.length, `${q.id}: ${o.text}`).toBeGreaterThan(10);
    }
  });

  it('numeric answers agree with the engine', () => {
    const byId = Object.fromEntries(ALL_QUESTIONS.map((q) => [q.id, q]));
    const ans = (id: string) => {
      const q = byId[id];
      if (q.kind !== 'numeric') throw new Error(id);
      return q.answer;
    };
    expect(ans('noise-3')).toBeCloseTo(12 * Math.sqrt(2 / 36), 2);
    expect(ans('fpr-1')).toBeCloseTo(falsePositiveRisk(0.05, 0.5, 0.2).fpr * 100, 1);
    expect(ans('mult-2')).toBeCloseTo(familyWiseErrorRate(10, 0.05) * 100, 1);
    expect(ans('des-3')).toBe(requiredN({ design: 'two-sample', test: 't', alternative: 'two-sided', alpha: 0.05, n: 2, delta: 0.4, sigma: 1 }, 0.9));
    expect(ans('m-6')).toBeCloseTo(1 / 0.0027, -1);
  });
});

describe('cross-links', () => {
  it('glossary lessons exist', () => {
    for (const g of GLOSSARY) if (g.lesson) expect(LESSON_BY_ID[g.lesson], g.term).toBeDefined();
  });

  it('misconception links point to real routes', () => {
    const routes = [/^\/learn\/([a-z]+)$/, /^\/simulate\?tab=(many|dance|exaggeration|peeking|multiple|one)$/];
    for (const m of MISCONCEPTIONS) {
      if (!m.tryIt) continue;
      const to = m.tryIt.to;
      const lesson = to.match(routes[0]);
      expect(lesson ? !!LESSON_BY_ID[lesson[1]] : routes[1].test(to), to).toBe(true);
    }
  });

  it('case designs are internally consistent', () => {
    for (const c of CASES) {
      expect(c.design.sigma).toBeGreaterThan(0);
      expect(c.design.n).toBeGreaterThanOrEqual(2);
      expect(c.prior).toBeGreaterThan(0);
      expect(c.prior).toBeLessThan(1);
    }
  });
});
