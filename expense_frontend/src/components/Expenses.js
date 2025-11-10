import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

// PUBLIC_INTERFACE
export default function Expenses() {
  /** This is a public component. Allows creating expenses and lists them. */
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  const [participantIds, setParticipantIds] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [m, e] = await Promise.all([api.listMembers(), api.listExpenses()]);
        setMembers(m || []);
        setExpenses(e || []);
      } catch (err) {
        setError(humanizeError(err, 'Unable to load expenses or members'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const memberMap = useMemo(() => {
    const map = new Map();
    members.forEach(m => map.set(m.id, m.name));
    return map;
  }, [members]);

  function humanizeError(err, fallback) {
    if (!err) return fallback;
    if (err.data && (err.data.message || err.data.detail)) {
      return err.data.message || err.data.detail;
    }
    if (err.message) return err.message;
    return fallback;
  }

  function toggleParticipant(id) {
    setParticipantIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function validateForm() {
    const trimmedDesc = description.trim();
    if (!trimmedDesc) return 'Description is required.';
    if (trimmedDesc.length > 255) return 'Description must be at most 255 characters.';
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return 'Amount must be a number greater than 0.';
    if (!payerId) return 'Please choose who paid.';
    if (participantIds.length === 0) return 'Select at least one participant.';
    return null;
    // Note: Allow payer to also be a participant.
  }

  async function onAddExpense(e) {
    e.preventDefault();
    setError(null);

    const validation = validateForm();
    if (validation) {
      setError(validation);
      return;
    }

    const amt = Number(amount);
    const payload = {
      description: description.trim(),
      amount: amt,
      payer_id: Number(payerId),
      participant_ids: participantIds.map(Number),
    };

    // Optimistic insert
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      description: payload.description,
      amount: payload.amount,
      payer_id: payload.payer_id,
      participants: payload.participant_ids.map(id => ({ member_id: id, share: 0 })), // server will compute shares
      created_at: new Date().toISOString(),
    };

    setExpenses(prev => [optimistic, ...prev]);
    setBusy(true);
    try {
      const created = await api.createExpense(payload);
      setExpenses(prev => [created, ...prev.filter(x => x.id !== tempId)]);
      // Reset form
      setDescription('');
      setAmount('');
      setPayerId('');
      setParticipantIds([]);
    } catch (err) {
      // rollback
      setExpenses(prev => prev.filter(x => x.id !== tempId));
      setError(humanizeError(err, 'Failed to create expense'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="expenses-heading" style={{ maxWidth: 840, margin: '0 auto', padding: 16 }}>
      <h2 id="expenses-heading">Expenses</h2>

      <form onSubmit={onAddExpense} style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <label>
            Description
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g., Snacks, Rent, Materials"
              required
              maxLength={255}
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
              aria-label="Expense description"
              disabled={busy}
            />
          </label>
          <label>
            Amount
            <input
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g., 49.99"
              required
              type="number"
              min="0.01"
              step="0.01"
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
              aria-label="Expense amount"
              disabled={busy}
            />
          </label>
          <label>
            Who paid?
            <select
              value={payerId}
              onChange={e => setPayerId(e.target.value)}
              required
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
              aria-label="Expense payer"
              disabled={busy || members.length === 0}
            >
              <option value="">Select payer</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </label>
        </div>

        <fieldset style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12 }}>
          <legend>Participants</legend>
          {members.length === 0 ? (
            <p>Add members first to select participants.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {members.map(m => (
                <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={participantIds.includes(m.id)}
                    onChange={() => toggleParticipant(m.id)}
                    disabled={busy}
                    aria-label={`Participant ${m.name}`}
                  />
                  {m.name}
                </label>
              ))}
            </div>
          )}
          <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
            Amount will be split equally among selected participants.
          </p>
        </fieldset>

        <div>
          <button
            className="theme-toggle"
            style={{ position: 'static' }}
            type="submit"
            disabled={busy}
          >
            {busy ? 'Saving…' : 'Add Expense'}
          </button>
        </div>
      </form>

      {error && (
        <div role="alert" style={{ color: '#EF4444', marginBottom: 12 }}>{error}</div>
      )}

      {loading ? (
        <p>Loading expenses…</p>
      ) : expenses.length === 0 ? (
        <p>No expenses yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>
          {expenses.map(exp => (
            <li key={exp.id} style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{exp.description}</strong>
                <span>${Number(exp.amount).toFixed(2)}</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                Paid by: {memberMap.get(exp.payer_id) || `#${exp.payer_id}`}
              </div>
              {Array.isArray(exp.participants) && exp.participants.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Participants</div>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {exp.participants.map(p => (
                      <li key={`${exp.id}-${p.member_id}`}>
                        {memberMap.get(p.member_id) || `#${p.member_id}`} {typeof p.share === 'number' ? `- $${Number(p.share).toFixed(2)}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
