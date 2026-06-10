import { useState } from 'react';
import { formatAmount } from '../constants';

export default function BudgetManager({ budgets, setBudget, clearBudget, expensesByCategory, allCategories = [] }) {
  const [editing, setEditing] = useState(null);
  const [draft, setDraft]     = useState('');

  const spentMap = Object.fromEntries(
    expensesByCategory.map(e => {
      const cat = allCategories.find(c => c.label === e.name);
      return [cat?.id, e.value];
    }).filter(([id]) => id !== undefined)
  );

  const startEdit = (catId, current) => {
    setEditing(catId);
    setDraft(current ? String(current) : '');
  };

  const confirmEdit = (catId) => {
    const val = parseFloat(draft);
    if (val > 0) setBudget(catId, val);
    else clearBudget(catId);
    setEditing(null);
  };

  return (
    <div className="chart-card">
      <h2 className="section-title" style={{ marginBottom: '1.2rem' }}>Budget par catégorie</h2>
      <div className="budget-list">
        {allCategories.map(cat => {
          const budget = budgets[cat.id] || 0;
          const spent  = spentMap[cat.id] || 0;
          const pct    = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
          const over   = budget > 0 && spent > budget;

          return (
            <div key={cat.id} className="budget-item">
              <div className="budget-item-top">
                <span className="budget-dot" style={{ background: cat.color }} />
                <span className="budget-cat-name">{cat.label}</span>

                {editing === cat.id ? (
                  <div className="budget-edit-row">
                    <span className="amount-prefix" style={{ position: 'static', transform: 'none', marginRight: 2 }}>€</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="budget-input"
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && confirmEdit(cat.id)}
                      autoFocus
                    />
                    <button className="budget-confirm-btn" onClick={() => confirmEdit(cat.id)}>✓</button>
                    <button className="budget-cancel-btn" onClick={() => setEditing(null)}>✕</button>
                  </div>
                ) : (
                  <button
                    className="budget-set-btn"
                    onClick={() => startEdit(cat.id, budget)}
                  >
                    {budget > 0 ? formatAmount(budget) : '+ Définir'}
                  </button>
                )}
              </div>

              {budget > 0 && (
                <div className="budget-progress-wrap">
                  <div className="budget-progress-bar">
                    <div
                      className={`budget-progress-fill ${over ? 'over' : ''}`}
                      style={{ width: `${pct}%`, background: over ? 'var(--red)' : cat.color }}
                    />
                  </div>
                  <div className="budget-progress-labels">
                    <span style={{ color: over ? 'var(--red)' : 'var(--text-3)' }}>
                      {formatAmount(spent)} dépensés
                    </span>
                    <span style={{ color: 'var(--text-3)' }}>
                      {over ? `−${formatAmount(spent - budget)} dépassé` : `${formatAmount(budget - spent)} restants`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
