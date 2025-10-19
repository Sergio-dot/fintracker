import './App.css';
import Dashboard from './components/Dashboard';
import ExpensesPage from './components/ExpensesPage';
import IncomesPage from './components/IncomesPage';
import { SettingsProvider } from './contexts/SettingsContext';
import LanguageSelector from './components/LanguageSelector';
import ThemeToggle from './components/ThemeToggle';
import './components/ui.css';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

function App() {
  return (
    <SettingsProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/incomes" element={<IncomesPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SettingsProvider>
  );
}

function Header() {
  const location = useLocation();
  const current = location.pathname;

  return (
    <header className="topbar bg-[#30577e] text-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="topbar-left flex items-center gap-3">
          <h2 className="m-0 select-none text-lg font-semibold">FinTracker</h2>
          <nav style={{ marginLeft: 16 }}>
            <Link to="/" className={current === '/' ? 'font-bold underline' : ''}>Dashboard</Link>
            <Link to="/expenses" className={current === '/expenses' ? 'font-bold underline ml-3' : 'ml-3'}>Expenses</Link>
            <Link to="/incomes" className={current === '/incomes' ? 'font-bold underline ml-3' : 'ml-3'}>Incomes</Link>
          </nav>
        </div>
        <div className="controls flex items-center gap-3">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default App;
