import { useState } from 'react';
import { CATEGORIES, CATEGORY_MAP, todayStr } from '../constants';

const EMPTY = { description: '', amount: '', category: 'transport', date: todayStr() };

export default function TransactionForm({ onAdd }) {
  const [type, setType] = useState('revenu');
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description.trim()) return setError('Veuillez saisir une description.');
    if (!form.amount || parseFloat(form.amount) <= 0) return setError('Veuillez saisir un montant valide.');
    setError('');
    onAdd({ ...form, type, category: type === 'revenu' ? null : form.category });
    setForm({ ...EMPTY, date: todayStr() });
  };

  const selectedCat = type === 'depense' ? CATEGORY_MAP[form.category] : null;

  return (
    <div className="form-card">
      <div className="type-toggle">
        <button
          type="button"
          className={`type-toggle__btn ${type === 'revenu' ? 'active revenu' : ''}`}
          onClick={() => setType('revenu')}
        >
          <span className="type-toggle__icon">↑</span> Revenu
        </button>
        <button
          type="button"
          className={`type-toggle__btn ${type === 'depense' ? 'active depense' : ''}`}
          onClick={() => setType('depense')}
        >
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
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                value={form.amount}
                onChange={set('amount')}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={set('date')}
            />
          </div>
        </div>

        {type === 'depense' && (
          <div className="field">
            <label htmlFor="category">Catégorie</label>
            <div className="select-wrapper">
              {selectedCat && (
                <span
                  className="select-dot"
                  style={{ background: selectedCat.color }}
                />
              )}
              <select
                id="category"
                value={form.category}
                onChange={set('category')}
                style={{ paddingLeft: selectedCat ? '2.2rem' : '0.9rem' }}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className={`submit-btn submit-btn--${type}`}>
          Ajouter {type === 'revenu' ? 'le revenu' : 'la dépense'}
        </button>
      </form>
    </div>
  );
}
