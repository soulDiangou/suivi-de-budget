import { useState } from 'react';
import { todayStr } from '../constants';

const EMPTY = { description: '', amount: '', category: 'transport', date: todayStr(), note: '', isRecurring: false };

export default function TransactionForm({ onAdd, allCategories = [], customCategories = [], addCustomCategory, deleteCustomCategory }) {
  const [type, setType] = useState('revenu');
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description.trim()) return setError('Veuillez saisir une description.');
    if (!form.amount || parseFloat(form.amount) <= 0) return setError('Veuillez saisir un montant valide.');
    setError('');
    onAdd({ ...form, type, category: type === 'revenu' ? null : form.category });
    setForm({ ...EMPTY, date: todayStr() });
  };

  const handleCreateCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    const newCat = addCustomCategory(trimmed);
    setForm(f => ({ ...f, category: newCat.id }));
    setShowCreate(false);
    setNewCatName('');
  };

  const selectedCat = type === 'depense' ? allCategories.find(c => c.id === form.category) : null;
  const fixedCats = allCategories.filter(c => !c.isCustom);

  return (
    <div className="form-card">
      <div className="type-toggle">
        <button type="button" className={`type-toggle__btn ${type === 'revenu' ? 'active revenu' : ''}`} onClick={() => setType('revenu')}>
          <span className="type-toggle__icon">↑</span> Revenu
        </button>
        <button type="button" className={`type-toggle__btn ${type === 'depense' ? 'active depense' : ''}`} onClick={() => setType('depense')}>
          <span className="type-toggle__icon">↓</span> Dépense
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-fields">
        <div className="field">
          <label htmlFor="description">Description</label>
          <input
            id="description"
            type="text"
            placeholder={type === 'revenu' ? 'ex : Salaire de juin' : 'ex : Billet de métro'}
            value={form.description}
            onChange={set('description')}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="amount">Montant</label>
            <div className="amount-wrapper">
              <span className="amount-prefix">€</span>
              <input id="amount" type="number" min="0.01" step="0.01" placeholder="0,00" value={form.amount} onChange={set('amount')} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="date">Date</label>
            <input id="date" type="date" value={form.date} onChange={set('date')} />
          </div>
        </div>

        {type === 'depense' && (
          <div className="field">
            <label htmlFor="category">Catégorie</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <div className="select-wrapper" style={{ flex: 1 }}>
                {selectedCat && <span className="select-dot" style={{ background: selectedCat.color }} />}
                <select
                  id="category"
                  value={form.category}
                  onChange={set('category')}
                  style={{ paddingLeft: selectedCat ? '2.2rem' : '0.9rem' }}
                >
                  <optgroup label="Catégories">
                    {fixedCats.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                  </optgroup>
                  {customCategories.length > 0 && (
                    <optgroup label="Mes catégories">
                      {customCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                    </optgroup>
                  )}
                </select>
              </div>
              <button
                type="button"
                className="add-category-btn"
                onClick={() => setShowCreate(s => !s)}
                title="Gérer les catégories personnalisées"
              >
                +
              </button>
            </div>

            {showCreate && (
              <div className="custom-cat-panel">
                {customCategories.length > 0 && (
                  <>
                    <div className="custom-cat-section-label">Mes catégories</div>
                    <div className="custom-cat-badges">
                      {customCategories.map(cat => (
                        <span
                          key={cat.id}
                          className="custom-cat-badge"
                          style={{ color: cat.color, background: cat.bg, border: `1px solid ${cat.border}` }}
                        >
                          {cat.label}
                          <button
                            type="button"
                            onClick={() => deleteCustomCategory(cat.id)}
                            aria-label={`Supprimer ${cat.label}`}
                          >×</button>
                        </span>
                      ))}
                    </div>
                    <div className="custom-cat-divider" />
                  </>
                )}
                <div className="custom-cat-section-label" style={{ color: 'var(--gold)' }}>Nouvelle catégorie</div>
                <div className="custom-cat-input-row">
                  <input
                    type="text"
                    className="custom-cat-input"
                    placeholder="ex : Abonnements"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateCategory()}
                    autoFocus
                  />
                  <button type="button" className="custom-cat-create-btn" onClick={handleCreateCategory}>Créer</button>
                  <button type="button" className="custom-cat-close-btn" onClick={() => setShowCreate(false)}>✕</button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="field">
          <label htmlFor="note">Note (optionnelle)</label>
          <input id="note" type="text" placeholder="Ajouter une note…" value={form.note} onChange={set('note')} />
        </div>

        <label className="recurring-toggle">
          <input
            type="checkbox"
            checked={form.isRecurring}
            onChange={e => setForm(f => ({ ...f, isRecurring: e.target.checked }))}
          />
          <span>Répéter chaque mois</span>
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className={`submit-btn submit-btn--${type}`}>
          Ajouter {type === 'revenu' ? 'le revenu' : 'la dépense'}
        </button>
      </form>
    </div>
  );
}
