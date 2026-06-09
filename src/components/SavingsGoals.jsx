import { useState } from 'react';
import { formatAmount } from '../constants';

export default function SavingsGoals({ goals, addGoal, updateGoal, deleteGoal, totalBalance }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: '', target: '', saved: '' });
  const [editingSaved, setEditingSaved] = useState(null);
  const [savedDraft, setSavedDraft]     = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.target || parseFloat(form.target) <= 0) return;
    addGoal({
      name:   form.name.trim(),
      target: parseFloat(form.target),
      saved:  parseFloat(form.saved) || 0,
    });
    setForm({ name: '', target: '', saved: '' });
    setShowForm(false);
  };

  const startEditSaved = (goal) => {
    setEditingSaved(goal.id);
    setSavedDraft(String(goal.saved));
  };

  const confirmSaved = (id) => {
    const val = parseFloat(savedDraft);
    updateGoal(id, { saved: isNaN(val) ? 0 : Math.max(0, val) });
    setEditingSaved(null);
  };

  return (
    <div className="chart-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Objectifs d'épargne</h2>
        <button className="goal-add-btn" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Annuler' : '+ Ajouter'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="goal-form">
          <div className="field">
            <label>Nom de l'objectif</label>
            <input type="text" placeholder="ex : Vacances, Voiture…" value={form.name} onChange={set('name')} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Objectif (€)</label>
              <input type="number" min="1" step="1" placeholder="5 000" value={form.target} onChange={set('target')} />
            </div>
            <div className="field">
              <label>Déjà épargné (€)</label>
              <input type="number" min="0" step="1" placeholder="0" value={form.saved} onChange={set('saved')} />
            </div>
          </div>
          <button type="submit" className="submit-btn submit-btn--revenu">Créer l'objectif</button>
        </form>
      )}

      {goals.length === 0 && !showForm && (
        <div className="chart-empty">
          <span className="chart-empty-icon">🎯</span>
          <p>Aucun objectif pour l'instant.</p>
        </div>
      )}

      <div className="goal-list">
        {goals.map(goal => {
          const pct     = Math.min((goal.saved / goal.target) * 100, 100);
          const done    = goal.saved >= goal.target;
          const remaining = Math.max(0, goal.target - goal.saved);

          return (
            <div key={goal.id} className={`goal-item ${done ? 'goal-item--done' : ''}`}>
              <div className="goal-item-top">
                <span className="goal-name">{done ? '✅' : '🎯'} {goal.name}</span>
                <button className="budget-cancel-btn" onClick={() => deleteGoal(goal.id)} title="Supprimer">✕</button>
              </div>

              <div className="budget-progress-wrap">
                <div className="budget-progress-bar">
                  <div
                    className="budget-progress-fill"
                    style={{ width: `${pct}%`, background: done ? 'var(--green)' : 'var(--gold)' }}
                  />
                </div>
                <div className="budget-progress-labels">
                  <span style={{ color: 'var(--text-2)' }}>
                    {formatAmount(goal.saved)} / {formatAmount(goal.target)} ({pct.toFixed(0)} %)
                  </span>
                  {!done && (
                    <span style={{ color: 'var(--text-3)' }}>
                      Reste {formatAmount(remaining)}
                    </span>
                  )}
                </div>
              </div>

              <div className="goal-update-row">
                {editingSaved === goal.id ? (
                  <>
                    <input
                      type="number"
                      min="0"
                      className="budget-input"
                      value={savedDraft}
                      onChange={e => setSavedDraft(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && confirmSaved(goal.id)}
                      autoFocus
                    />
                    <button className="budget-confirm-btn" onClick={() => confirmSaved(goal.id)}>✓</button>
                    <button className="budget-cancel-btn" onClick={() => setEditingSaved(null)}>✕</button>
                  </>
                ) : (
                  <>
                    <button className="budget-set-btn" onClick={() => startEditSaved(goal)}>
                      Mettre à jour l'épargne
                    </button>
                    <button
                      className="budget-set-btn"
                      onClick={() => updateGoal(goal.id, { saved: Math.max(0, totalBalance) })}
                      title="Utiliser le solde actuel"
                    >
                      Utiliser le solde ({formatAmount(Math.max(0, totalBalance))})
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
