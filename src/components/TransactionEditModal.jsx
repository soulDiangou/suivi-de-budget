import { useState, useEffect } from 'react';

export default function TransactionEditModal({ transaction, onSave, onClose, allCategories = [], allCategoryMap = {} }) {
  const [type, setType]   = useState(transaction.type);
  const [form, setForm]   = useState({
    description: transaction.description,
    amount:      transaction.amount,
    date:        transaction.date,
    category:    transaction.category || 'transport',
    note:        transaction.note || '',
    isRecurring: transaction.isRecurring || false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description.trim()) return setError('Veuillez saisir une description.');
    if (!form.amount || parseFloat(form.amount) <= 0) return setError('Montant invalide.');
    setError('');
    onSave(transaction.id, {
      ...form,
      type,
      category: type === 'revenu' ? null : form.category,
    });
    onClose();
  };

  const selectedCat = type === 'depense' ? allCategoryMap[form.category] : null;
  const fixedCats = allCategories.filter(c => !c.isCustom);
  const customCats = allCategories.filter(c => c.isCustom);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">Modifier la transaction</h3>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <div className="type-toggle" style={{ marginBottom: '1.2rem' }}>
          <button type="button" className={`type-toggle__btn ${type === 'revenu' ? 'active revenu' : ''}`} onClick={() => setType('revenu')}>
            <span className="type-toggle__icon">↑</span> Revenu
          </button>
          <button type="button" className={`type-toggle__btn ${type === 'depense' ? 'active depense' : ''}`} onClick={() => setType('depense')}>
            <span className="type-toggle__icon">↓</span> Dépense
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-fields">
          <div className="field">
            <label>Description</label>
            <input type="text" value={form.description} onChange={set('description')} />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Montant</label>
              <div className="amount-wrapper">
                <span className="amount-prefix">€</span>
                <input type="number" min="0.01" step="0.01" value={form.amount} onChange={set('amount')} />
              </div>
            </div>
            <div className="field">
              <label>Date</label>
              <input type="date" value={form.date} onChange={set('date')} />
            </div>
          </div>

          {type === 'depense' && (
            <div className="field">
              <label>Catégorie</label>
              <div className="select-wrapper">
                {selectedCat && <span className="select-dot" style={{ background: selectedCat.color }} />}
                <select value={form.category} onChange={set('category')} style={{ paddingLeft: selectedCat ? '2.2rem' : '0.9rem' }}>
                  <optgroup label="Catégories">
                    {fixedCats.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                  </optgroup>
                  {customCats.length > 0 && (
                    <optgroup label="Mes catégories">
                      {customCats.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>
          )}

          <div className="field">
            <label>Note (optionnelle)</label>
            <input type="text" placeholder="Ajouter une note…" value={form.note} onChange={set('note')} />
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

          <div className="modal-actions">
            <button type="button" className="modal-cancel-btn" onClick={onClose}>Annuler</button>
            <button type="submit" className={`submit-btn submit-btn--${type}`} style={{ margin: 0, flex: 1 }}>
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
