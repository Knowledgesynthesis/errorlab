import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { Interactive } from './pages/Interactive';
import { PValue } from './pages/PValue';
import { Power } from './pages/Power';
import { Scenarios } from './pages/Scenarios';
import { Reference } from './pages/Reference';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/interactive', label: 'Interactive', icon: '🎛️' },
    { path: '/pvalue', label: 'p-value', icon: '🔍' },
    { path: '/power', label: 'Power', icon: '📈' },
    { path: '/scenarios', label: 'Scenarios', icon: '🎯' },
    { path: '/reference', label: 'Reference', icon: '📚' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
        <div className="flex justify-between items-center h-10">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">ErrorLab</span>
          </Link>

          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle navigation menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-2 py-1 rounded-md text-base font-medium ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-2">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-2">
        <div className="text-center text-sm text-gray-600">
          <p>
            <strong>ErrorLab</strong> © {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />

        <main className="flex-grow px-2 sm:px-3 lg:px-4 py-2">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/interactive" element={<Interactive />} />
            <Route path="/pvalue" element={<PValue />} />
            <Route path="/power" element={<Power />} />
            <Route path="/scenarios" element={<Scenarios />} />
            <Route path="/reference" element={<Reference />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
