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
      <header className="App-header" style={{ paddingTop: 72 }}>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <h1 style={{ marginBottom: 8 }}>Expense Splitter</h1>
        <p style={{ marginTop: 0, color: 'var(--text-secondary)' }}>
          Manage members, record expenses, and view balances.
        </p>

        <nav aria-label="Primary" style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 24 }}>
          <button
            onClick={() => setTab('members')}
            className="theme-toggle"
            style={{ position: 'static', backgroundColor: tab === 'members' ? 'var(--button-bg)' : '#6b7280' }}
          >
            Members
          </button>
          <button
            onClick={() => setTab('expenses')}
            className="theme-toggle"
            style={{ position: 'static', backgroundColor: tab === 'expenses' ? 'var(--button-bg)' : '#6b7280' }}
          >
            Expenses
          </button>
          <button
            onClick={() => setTab('balances')}
            className="theme-toggle"
            style={{ position: 'static', backgroundColor: tab === 'balances' ? 'var(--button-bg)' : '#6b7280' }}
          >
            Balances
          </button>
        </nav>

        <main style={{ width: '100%', maxWidth: 1000 }}>
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
