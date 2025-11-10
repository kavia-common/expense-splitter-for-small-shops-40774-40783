import React, { useEffect, useState } from 'react';
import { api } from '../api';

// PUBLIC_INTERFACE
export default function Balances() {
  /** This is a public component. Shows per-member balances and suggested settlements. */
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function humanizeError(err, fallback) {
    if (!err) return fallback;
    if (err.data && (err.data.message || err.data.detail)) {
      return err.data.message || err.data.detail;
    }
    if (err.message) return err.message;
    return fallback;
  }

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [b, s] = await Promise.all([api.listBalances(), api.listSettlements()]);
      setBalances(b || []);
      setSettlements(s || []);
    } catch (e) {
      setError(humanizeError(e, 'Unable to load balances'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <section aria-labelledby="balances-heading" style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h2 id="balances-heading">Balances</h2>

      <div style={{ marginBottom: 12 }}>
        <button className="theme-toggle" style={{ position: 'static' }} onClick={refresh}>
          Refresh
        </button>
      </div>

      {error && <div role="alert" style={{ color: '#EF4444', marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <p>Loading balances…</p>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <h3>Per-member Net</h3>
            {balances.length === 0 ? (
              <p>No balances yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                {balances.map(b => (
                  <li key={b.member_id} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, border: '1px solid var(--border-color)', borderRadius: 8 }}>
                    <span>{b.name}</span>
                    <strong style={{ color: Number(b.net) >= 0 ? '#16a34a' : '#EF4444' }}>
                      {Number(b.net) >= 0 ? '+' : '-'}${Math.abs(Number(b.net)).toFixed(2)}
                    </strong>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3>Suggested Settlements</h3>
            {settlements.length === 0 ? (
              <p>No settlements necessary.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                {settlements.map((s, idx) => (
                  <li key={idx} style={{ padding: 12, border: '1px solid var(--border-color)', borderRadius: 8 }}>
                    Member #{s.from_member_id} pays Member #{s.to_member_id} ${Number(s.amount).toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
