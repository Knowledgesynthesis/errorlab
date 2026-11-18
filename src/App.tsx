import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router';
import { ProgressProvider } from './lib/ProgressProvider';
import { Home } from './pages/Home';

const Learn = lazy(() => import('./pages/Learn'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const Lab = lazy(() => import('./pages/Lab'));
const Simulate = lazy(() => import('./pages/Simulate'));
const Plan = lazy(() => import('./pages/Plan'));
const Cases = lazy(() => import('./pages/Cases'));
const Reference = lazy(() => import('./pages/Reference'));
const Mastery = lazy(() => import('./pages/Mastery'));
const NotFound = lazy(() => import('./pages/NotFound'));

const NAV = [
  { to: '/learn', label: 'Learn' },
  { to: '/lab', label: 'Decision Lab' },
  { to: '/simulate', label: 'Simulations' },
  { to: '/plan', label: 'Sample size' },
  { to: '/cases', label: 'Cases' },
  { to: '/reference', label: 'Reference' },
];

/** Scroll to top on navigation, or to #hash once the (lazy-loaded) target exists. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    let timer = 0;
    const attempt = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView();
      else if (tries++ < 40) timer = window.setTimeout(attempt, 50);
    };
    attempt();
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);
  return null;
}

function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  const link = ({ isActive }: { isActive: boolean }) => `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200/70'}`;
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:shadow">
        Skip to content
      </a>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        <NavLink to="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <img src="/favicon.svg" alt="" className="h-7 w-7" />
          <span className="text-lg tracking-tight">ErrorLab</span>
        </NavLink>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={link}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-slate-200 bg-white px-4 py-2 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={link}>
                {n.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <strong className="text-slate-800">ErrorLab</strong> · Made by Bashar Hasan, MD
        </p>
        <p className="text-xs text-slate-500">Exact calculations, checked against SciPy. Sources on the Reference page.</p>
      </div>
    </footer>
  );
}

function Loading() {
  return <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-slate-500">Loading…</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ProgressProvider>
        <ScrollManager />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main id="main" className="flex-1">
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/learn/:lessonId" element={<LessonPage />} />
                <Route path="/mastery" element={<Mastery />} />
                <Route path="/lab" element={<Lab />} />
                <Route path="/simulate" element={<Simulate />} />
                <Route path="/plan" element={<Plan />} />
                <Route path="/cases" element={<Cases />} />
                <Route path="/reference" element={<Reference />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </ProgressProvider>
    </BrowserRouter>
  );
}
