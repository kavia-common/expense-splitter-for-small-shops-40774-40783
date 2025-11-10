import React, { useState, useEffect } from 'react';
import './App.css';
import Members from './components/Members';
import Expenses from './components/Expenses';
import Balances from './components/Balances';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [tab, setTab] = useState('members'); // 'members' | 'expenses' | 'balances'

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App">
      {/* Top Nav */}
      <div className="navbar">
        <div className="navbar-inner container">
          <div className="brand">Expense Splitter</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <nav aria-label="Primary" className="tabs">
              <button
                onClick={() => setTab('members')}
                className={`tab ${tab === 'members' ? 'active' : ''}`}
              >
                Members
              </button>
              <button
                onClick={() => setTab('expenses')}
                className={`tab ${tab === 'expenses' ? 'active' : ''}`}
              >
                Expenses
              </button>
              <button
                onClick={() => setTab('balances')}
                className={`tab ${tab === 'balances' ? 'active' : ''}`}
              >
                Balances
              </button>
            </nav>
            <button
              className="btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title="Toggle theme"
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>
      </div>

      <header className="App-header" style={{ paddingTop: 24 }}>
        <h1 style={{ marginBottom: 8 }}>Expense Splitter</h1>
        <p style={{ marginTop: 0, color: 'var(--text-secondary)' }}>
          Manage members, record expenses, and view balances.
        </p>

        <main className="container" style={{ width: '100%', maxWidth: 1000 }}>
          {tab === 'members' && <Members />}
          {tab === 'expenses' && <Expenses />}
          {tab === 'balances' && <Balances />}
        </main>

        <footer style={{ marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
          Current theme: <strong>{theme}</strong>
        </footer>
      </header>
    </div>
  );
}

export default App;
