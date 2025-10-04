import './App.css';
import Dashboard from './components/Dashboard';
import { SettingsProvider } from './contexts/SettingsContext';
import LanguageSelector from './components/LanguageSelector';
import ThemeToggle from './components/ThemeToggle';
import './components/ui.css';

function App() {
  return (
    <SettingsProvider>
      <div className="App">
        <header className="topbar bg-[#30577e] text-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="topbar-left flex items-center gap-3">
              <h2 className="m-0 select-none text-lg font-semibold">FinTracker</h2>
            </div>
            <div className="controls flex items-center gap-3">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <Dashboard />
      </div>
    </SettingsProvider>
  );
}

export default App;
