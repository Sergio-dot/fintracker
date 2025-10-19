import './App.css';
import Dashboard from './components/Dashboard';
import ExpensesPage from './components/ExpensesPage';
import { SettingsProvider } from './contexts/SettingsContext';
import LanguageSelector from './components/LanguageSelector';
import ThemeToggle from './components/ThemeToggle';
import './components/ui.css';
import React, { useState } from 'react';

function App() {
  const [view, setView] = useState('dashboard');

  const MainView = () => {
    if (view === 'expenses') return <ExpensesPage />;
    return <Dashboard />;
  };

  return (
    <SettingsProvider>
      <div className="App">
        <header className="topbar bg-[#30577e] text-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="topbar-left flex items-center gap-3">
              <h2 className="m-0 select-none text-lg font-semibold">FinTracker</h2>
              <nav style={{ marginLeft: 16 }}>
                <button id="tab-dashboard" onClick={() => setView('dashboard')}>Dashboard</button>
                <button id="tab-expenses" onClick={() => setView('expenses')} style={{ marginLeft: 8 }}>Expenses</button>
                <button id="tab-incomes" onClick={() => setView('incomes')} style={{ marginLeft: 8 }}>Incomes</button>
              </nav>
            </div>
            <div className="controls flex items-center gap-3">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <MainView />
      </div>
    </SettingsProvider>
  );
}

export default App;
