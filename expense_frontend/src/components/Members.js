import React, { useEffect, useState } from 'react';
import { api } from '../api';

// PUBLIC_INTERFACE
export default function Members() {
  /** This is a public component. Manages members list with add and delete operations. */
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listMembers();
      setMembers(data || []);
    } catch (e) {
      setError(humanizeError(e, 'Unable to load members'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function humanizeError(err, fallback) {
    if (!err) return fallback;
    if (err.data && (err.data.message || err.data.detail)) {
      return err.data.message || err.data.detail;
    }
    if (err.message) return err.message;
    return fallback;
  }

  async function onAddMember(e) {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Member name is required.');
      return;
    }
    if (trimmed.length > 100) {
      setError('Member name must be at most 100 characters.');
      return;
    }

    // Optimistic UI: add temp member
    const tempId = `temp-${Date.now()}`;
    const optimistic = { id: tempId, name: trimmed, created_at: new Date().toISOString() };
    setMembers(prev => [optimistic, ...prev]);
    setBusy(true);

    try {
      const created = await api.createMember({ name: trimmed });
      // Replace temp with real
      setMembers(prev => [created, ...prev.filter(m => m.id !== tempId)]);
      setName('');
    } catch (e) {
      // Rollback optimistic insert
      setMembers(prev => prev.filter(m => m.id !== tempId));
      setError(humanizeError(e, 'Failed to add member'));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(memberId) {
    setError(null);
    const existing = members.find(m => m.id === memberId);
    if (!existing) return;

    // Optimistic remove
    setMembers(prev => prev.filter(m => m.id !== memberId));
    try {
      await api.deleteMember(memberId);
    } catch (e) {
      // Rollback
      setMembers(prev => [existing, ...prev]);
      setError(humanizeError(e, 'Failed to delete member (might be referenced by expenses)'));
    }
  }

  return (
    <section aria-labelledby="members-heading" style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h2 id="members-heading">Members</h2>

      <form onSubmit={onAddMember} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          aria-label="Member name"
          placeholder="Enter member name"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={busy}
          style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
          required
          maxLength={100}
        />
        <button
          className="theme-toggle"
          style={{ position: 'static' }}
          type="submit"
          disabled={busy}
        >
          {busy ? 'Adding…' : 'Add'}
        </button>
      </form>

      {error && (
        <div role="alert" style={{ color: '#EF4444', marginBottom: 12 }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading members…</p>
      ) : members.length === 0 ? (
        <p>No members yet. Add your first member above.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
          {members.map(m => (
            <li key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: '1px solid var(--border-color)', borderRadius: 8 }}>
              <span>{m.name}</span>
              <button
                className="theme-toggle"
                style={{ position: 'static', backgroundColor: '#EF4444' }}
                aria-label={`Delete ${m.name}`}
                onClick={() => onDelete(m.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
