/**
 * Smoke test: every page and every lesson renders on the server without
 * throwing (this also verifies every <Cite> key used in JSX exists).
 */
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { LESSONS } from '../content/lessons';
import { ProgressProvider } from '../lib/ProgressProvider';
import Cases from './Cases';
import { Home } from './Home';
import Lab from './Lab';
import Learn from './Learn';
import LessonPage from './LessonPage';
import Mastery from './Mastery';
import Plan from './Plan';
import Reference from './Reference';
import Simulate from './Simulate';

function render(path: string, element: React.ReactNode, pattern = '*') {
  return renderToString(
    <ProgressProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={pattern} element={element} />
        </Routes>
      </MemoryRouter>
    </ProgressProvider>,
  );
}

describe('pages render', () => {
  const pages: [string, React.ReactNode][] = [
    ['/', <Home />],
    ['/learn', <Learn />],
    ['/mastery', <Mastery />],
    ['/lab', <Lab />],
    ['/lab?case=ab-test&n=500', <Lab />],
    ['/lab?alpha=oops&n=-3&alt=nope', <Lab />],
    ['/simulate?tab=peeking', <Simulate />],
    ['/simulate?tab=multiple', <Simulate />],
    ['/plan', <Plan />],
    ['/cases', <Cases />],
    ['/reference', <Reference />],
  ];
  it.each(pages)('%s', (path, el) => {
    const html = render(path, el);
    expect(html).toContain('<h1');
  });

  it.each(LESSONS.map((l) => l.id))('lesson %s', (id) => {
    const html = render(`/learn/${id}`, <LessonPage />, '/learn/:lessonId');
    expect(html).toContain('Check your understanding');
  });

  it('lab with a malformed URL falls back to safe values', () => {
    const html = render('/lab?alpha=oops&n=-3&alt=nope', <Lab />);
    expect(html).not.toContain('NaN');
  });
});
