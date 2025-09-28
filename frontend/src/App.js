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
        <div className="topbar" style={{padding: '16px 16px', backgroundColor: '#30577eff', borderBottom: '1px solid #e5e7eb', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="topbar-left">
            <h2 style={{ margin: 0, userSelect: 'none' }}>FinTracker</h2>
          </div>
          <div className="controls">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>

        <Dashboard />
      </div>
    </SettingsProvider>
  );
}

export default App;
