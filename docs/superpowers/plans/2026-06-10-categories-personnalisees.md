# Catégories personnalisées — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à l'utilisateur de créer et supprimer des catégories de dépenses personnalisées depuis le formulaire de transaction.

**Architecture:** Nouveau hook `useCustomCategories` (localStorage) + `allCategories = [...CATEGORIES, ...customCategories]` calculé dans `App.jsx` et transmis aux composants. Le hook `useTransactions` accepte `customCategories` pour inclure les catégories perso dans les graphiques.

**Tech Stack:** React 18, Vite, localStorage. Pas de framework de test — vérification via `npm run build` + navigateur.

**Worktree:** `/Users/pao/Desktop/App-Financial-Tracker/.claude/worktrees/fonctionnalites-haute-priorite/`

---

## Fichiers touchés

| Fichier | Action |
|---------|--------|
| `src/hooks/useCustomCategories.js` | Créer |
| `src/hooks/useTransactions.js` | Modifier — accepter `customCategories` param |
| `src/App.jsx` | Modifier — orchestrer allCategories, passer aux composants |
| `src/components/TransactionForm.jsx` | Modifier — bouton "+" + panneau inline |
| `src/components/TransactionEditModal.jsx` | Modifier — utiliser allCategories prop |
| `src/components/BudgetManager.jsx` | Modifier — utiliser allCategories prop |
| `src/components/TransactionList.jsx` | Modifier — utiliser allCategories + allCategoryMap props |
| `src/App.css` | Modifier — ajouter classes CSS |

---

## Task 1 : Hook `useCustomCategories`

**Files:**
- Create: `src/hooks/useCustomCategories.js`

- [ ] **Créer le fichier `src/hooks/useCustomCategories.js`** avec le contenu suivant :

```js
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ledger_custom_categories_v1';

const CUSTOM_PALETTE = [
  '#9370DB', '#FF8C00', '#20B2AA', '#FF6B6B', '#6495ED',
  '#F0A500', '#32CD32', '#FF69B4', '#87CEEB', '#DDA0DD',
];

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function useCustomCategories() {
  const [customCategories, setCustomCategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customCategories));
  }, [customCategories]);

  const addCustomCategory = (label) => {
    const color = CUSTOM_PALETTE[customCategories.length % CUSTOM_PALETTE.length];
    const newCat = {
      id: crypto.randomUUID(),
      label,
      color,
      bg: hexToRgba(color, 0.12),
      border: hexToRgba(color, 0.3),
      isCustom: true,
    };
    setCustomCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const deleteCustomCategory = (id) => {
    setCustomCategories(prev => prev.filter(c => c.id !== id));
  };

  return { customCategories, addCustomCategory, deleteCustomCategory };
}
```

- [ ] **Vérifier le build**

```bash
npm run build 2>&1 | tail -5
```
Attendu : `✓ built in`

- [ ] **Committer**

```bash
git add src/hooks/useCustomCategories.js
git commit -m "feat: hook useCustomCategories avec palette automatique"
```

---

## Task 2 : Mettre à jour `useTransactions`

**Files:**
- Modify: `src/hooks/useTransactions.js`

- [ ] **Modifier la signature de `computeExpensesByCategory`** pour accepter un deuxième paramètre :

Remplacer :
```js
function computeExpensesByCategory(list) {
  const map = list
    .filter(t => t.type === 'depense')
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});
  return CATEGORIES
    .filter(cat => map[cat.id])
    .map(cat => ({ name: cat.label, value: map[cat.id], color: cat.color }));
}
```

Par :
```js
function computeExpensesByCategory(list, customCategories = []) {
  const allCats = [...CATEGORIES, ...customCategories];
  const map = list
    .filter(t => t.type === 'depense')
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});
  return allCats
    .filter(cat => map[cat.id])
    .map(cat => ({ name: cat.label, value: map[cat.id], color: cat.color }));
}
```

- [ ] **Modifier la signature du hook** pour accepter `customCategories` :

Remplacer :
```js
export function useTransactions() {
```

Par :
```js
export function useTransactions(customCategories = []) {
```

- [ ] **Mettre à jour l'appel interne** à `computeExpensesByCategory` :

Remplacer :
```js
const expensesByCategory = useMemo(() => computeExpensesByCategory(visibleTransactions), [visibleTransactions]);
```

Par :
```js
const expensesByCategory = useMemo(
  () => computeExpensesByCategory(visibleTransactions, customCategories),
  [visibleTransactions, customCategories]
);
```

- [ ] **Vérifier le build**

```bash
npm run build 2>&1 | tail -5
```
Attendu : `✓ built in`

- [ ] **Committer**

```bash
git add src/hooks/useTransactions.js
git commit -m "feat: useTransactions accepte customCategories pour les graphiques"
```

---

## Task 3 : CSS — nouvelles classes

**Files:**
- Modify: `src/App.css`

- [ ] **Ajouter les classes CSS** à la fin de `src/App.css` :

```css
/* ============================================
   CATÉGORIES PERSONNALISÉES
   ============================================ */

.add-category-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-gold);
  background: var(--gold-dim);
  color: var(--gold);
  font-size: 1.2rem;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition);
  cursor: pointer;
}
.add-category-btn:hover {
  background: var(--gold-glow);
  border-color: var(--gold);
}

.custom-cat-panel {
  margin-top: 0.5rem;
  background: rgba(201, 168, 76, 0.05);
  border: 1px solid rgba(201, 168, 76, 0.2);
  border-radius: var(--radius-sm);
  padding: 0.75rem 0.9rem;
}

.custom-cat-section-label {
  font-size: 0.68rem;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.45rem;
}

.custom-cat-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.custom-cat-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border-radius: 5px;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
}

.custom-cat-badge button {
  font-size: 0.85rem;
  line-height: 1;
  color: inherit;
  opacity: 0.7;
  cursor: pointer;
  padding: 0;
  background: none;
  border: none;
}

.custom-cat-badge button:hover { opacity: 1; }

.custom-cat-divider {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin: 0.6rem 0;
}

.custom-cat-input-row {
  display: flex;
  gap: 0.45rem;
  align-items: center;
}

.custom-cat-input {
  flex: 1;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  color: var(--text-1);
  font-size: 0.82rem;
  padding: 0.35rem 0.6rem;
  outline: none;
  transition: border-color var(--transition);
}
.custom-cat-input:focus { border-color: var(--border-md); }

.custom-cat-create-btn {
  background: var(--gold);
  color: var(--bg);
  border: none;
  border-radius: var(--radius-xs);
  padding: 0.35rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity var(--transition);
}
.custom-cat-create-btn:hover { opacity: 0.88; }

.custom-cat-close-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-2);
  border-radius: var(--radius-xs);
  padding: 0.35rem 0.5rem;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all var(--transition);
}
.custom-cat-close-btn:hover {
  border-color: var(--border-md);
  color: var(--text-1);
}
```

- [ ] **Committer**

```bash
git add src/App.css
git commit -m "feat: CSS pour le panneau de catégories personnalisées"
```

---

## Task 4 : Mettre à jour `TransactionForm`

**Files:**
- Modify: `src/components/TransactionForm.jsx`

- [ ] **Remplacer le contenu entier** de `src/components/TransactionForm.jsx` :

```jsx
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
```

- [ ] **Vérifier le build**

```bash
npm run build 2>&1 | tail -5
```
Attendu : `✓ built in` (l'app compilera même si App.jsx ne passe pas encore les nouvelles props — elles ont des valeurs par défaut)

- [ ] **Committer**

```bash
git add src/components/TransactionForm.jsx
git commit -m "feat: TransactionForm avec bouton + et panneau catégories perso"
```

---

## Task 5 : Mettre à jour `TransactionEditModal`

**Files:**
- Modify: `src/components/TransactionEditModal.jsx`

- [ ] **Remplacer le contenu entier** de `src/components/TransactionEditModal.jsx` :

```jsx
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
                <select
                  value={form.category}
                  onChange={set('category')}
                  style={{ paddingLeft: selectedCat ? '2.2rem' : '0.9rem' }}
                >
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
```

- [ ] **Vérifier le build**

```bash
npm run build 2>&1 | tail -5
```
Attendu : `✓ built in`

- [ ] **Committer**

```bash
git add src/components/TransactionEditModal.jsx
git commit -m "feat: TransactionEditModal utilise allCategories/allCategoryMap en props"
```

---

## Task 6 : Mettre à jour `BudgetManager`

**Files:**
- Modify: `src/components/BudgetManager.jsx`

- [ ] **Remplacer le contenu entier** de `src/components/BudgetManager.jsx` :

```jsx
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
```

- [ ] **Vérifier le build**

```bash
npm run build 2>&1 | tail -5
```
Attendu : `✓ built in`

- [ ] **Committer**

```bash
git add src/components/BudgetManager.jsx
git commit -m "feat: BudgetManager utilise allCategories en prop"
```

---

## Task 7 : Mettre à jour `TransactionList`

**Files:**
- Modify: `src/components/TransactionList.jsx`

- [ ] **Lire le fichier actuel** pour repérer les lignes exactes à modifier. Les changements sont :
  1. Ajouter `allCategories = []` et `allCategoryMap = {}` aux props
  2. Retirer `CATEGORY_MAP` de l'import constants (garder `formatAmount`, `formatDate`)
  3. Importer `CATEGORIES` n'est pas nécessaire — mais il faut aussi retirer son import s'il y en avait un
  4. Remplacer `CATEGORY_MAP` par `allCategoryMap` dans le rendu des transactions
  5. Remplacer le `<select>` de filtre catégorie par une version avec `<optgroup>`
  6. Passer `allCategories` et `allCategoryMap` à `TransactionEditModal`

- [ ] **Modifier la ligne d'import** des constants (retirer CATEGORIES et CATEGORY_MAP, garder uniquement les utilitaires) :

Remplacer la ligne d'import qui ressemble à :
```js
import { CATEGORIES, CATEGORY_MAP, formatAmount, formatDate } from '../constants';
```

Par :
```js
import { formatAmount, formatDate } from '../constants';
```

Note : selon l'état exact du fichier, l'import peut ne pas avoir `CATEGORIES` ou pas avoir `CATEGORY_MAP` — retirer tout ce qui ne fait pas partie de `{ formatAmount, formatDate }`.

- [ ] **Modifier la signature du composant** pour accepter les nouvelles props :

Remplacer :
```js
export default function TransactionList({ transactions, allTransactions, onDelete, onEdit, onImport, onBackup, onRestore }) {
```

Par :
```js
export default function TransactionList({ transactions, allTransactions, onDelete, onEdit, onImport, onBackup, onRestore, allCategories = [], allCategoryMap = {} }) {
```

- [ ] **Passer les props à `TransactionEditModal`** :

Remplacer :
```jsx
<TransactionEditModal
  transaction={editingTx}
  onSave={onEdit}
  onClose={() => setEditingTx(null)}
/>
```

Par :
```jsx
<TransactionEditModal
  transaction={editingTx}
  onSave={onEdit}
  onClose={() => setEditingTx(null)}
  allCategories={allCategories}
  allCategoryMap={allCategoryMap}
/>
```

- [ ] **Remplacer le `<select>` du filtre catégorie** (la section avec `className="category-filter-select"`) par une version avec optgroup :

Remplacer :
```jsx
<select
  className="category-filter-select"
  value={filterCategory ?? ''}
  onChange={e => setFilterCategory(e.target.value || null)}
>
  <option value="">Toutes catégories</option>
  <option value="revenu">Revenu</option>
  {CATEGORIES.map(cat => (
    <option key={cat.id} value={cat.id}>{cat.label}</option>
  ))}
</select>
```

Par :
```jsx
<select
  className="category-filter-select"
  value={filterCategory ?? ''}
  onChange={e => setFilterCategory(e.target.value || null)}
>
  <option value="">Toutes catégories</option>
  <option value="revenu">Revenu</option>
  <optgroup label="Catégories">
    {allCategories.filter(c => !c.isCustom).map(cat => (
      <option key={cat.id} value={cat.id}>{cat.label}</option>
    ))}
  </optgroup>
  {allCategories.some(c => c.isCustom) && (
    <optgroup label="Mes catégories">
      {allCategories.filter(c => c.isCustom).map(cat => (
        <option key={cat.id} value={cat.id}>{cat.label}</option>
      ))}
    </optgroup>
  )}
</select>
```

- [ ] **Remplacer `CATEGORY_MAP` par `allCategoryMap`** dans le rendu des transactions :

Remplacer :
```js
const cat = !isIncome && t.category ? CATEGORY_MAP[t.category] : null;
```

Par :
```js
const cat = !isIncome && t.category ? allCategoryMap[t.category] : null;
```

- [ ] **Vérifier le build**

```bash
npm run build 2>&1 | tail -5
```
Attendu : `✓ built in`

- [ ] **Committer**

```bash
git add src/components/TransactionList.jsx
git commit -m "feat: TransactionList utilise allCategories/allCategoryMap en props"
```

---

## Task 8 : Câblage final dans `App.jsx`

**Files:**
- Modify: `src/App.jsx`

C'est la tâche d'orchestration — elle connecte tout. À ce stade, tous les composants acceptent déjà les nouvelles props avec des valeurs par défaut, donc l'app fonctionne déjà. On active maintenant les vraies données.

- [ ] **Ajouter l'import** du nouveau hook et de `CATEGORIES` (si pas déjà présent) :

En haut du fichier, après les imports existants :
```js
import { useCustomCategories } from './hooks/useCustomCategories';
```
`CATEGORIES` est déjà importé depuis `'./constants'` — vérifier qu'il y est, sinon l'ajouter.

- [ ] **Ajouter l'appel au hook** dans le corps de `App()`, après `useBudgets()` et `useGoals()` :

```js
const { customCategories, addCustomCategory, deleteCustomCategory } = useCustomCategories();
```

- [ ] **Passer `customCategories` à `useTransactions`** :

Remplacer :
```js
} = useTransactions();
```

Par :
```js
} = useTransactions(customCategories);
```

- [ ] **Ajouter le calcul de `allCategories` et `allCategoryMap`** juste après (après `useTransactions`, avant `totalBalance`) :

```js
const allCategories = useMemo(() => [...CATEGORIES, ...customCategories], [customCategories]);
const allCategoryMap = useMemo(
  () => Object.fromEntries(allCategories.map(c => [c.id, c])),
  [allCategories]
);
```

- [ ] **Mettre à jour `overBudgetCount`** pour utiliser `allCategories` au lieu de `CATEGORIES` :

Remplacer :
```js
const overBudgetCount = useMemo(() => {
  const spentMap = Object.fromEntries(
    expensesByCategory
      .map(e => [CATEGORIES.find(c => c.label === e.name)?.id, e.value])
      .filter(([id]) => id !== undefined)
  );
  return CATEGORIES.filter(cat => {
    const budget = budgets[cat.id] || 0;
    const spent = spentMap[cat.id] ?? 0;
    return budget > 0 && spent > budget;
  }).length;
}, [expensesByCategory, budgets]);
```

Par :
```js
const overBudgetCount = useMemo(() => {
  const spentMap = Object.fromEntries(
    expensesByCategory
      .map(e => [allCategories.find(c => c.label === e.name)?.id, e.value])
      .filter(([id]) => id !== undefined)
  );
  return allCategories.filter(cat => {
    const budget = budgets[cat.id] || 0;
    const spent = spentMap[cat.id] ?? 0;
    return budget > 0 && spent > budget;
  }).length;
}, [expensesByCategory, budgets, allCategories]);
```

- [ ] **Passer les nouvelles props à `TransactionForm`** :

Remplacer :
```jsx
<TransactionForm onAdd={addTransaction} />
```

Par :
```jsx
<TransactionForm
  onAdd={addTransaction}
  allCategories={allCategories}
  customCategories={customCategories}
  addCustomCategory={addCustomCategory}
  deleteCustomCategory={deleteCustomCategory}
/>
```

- [ ] **Passer `allCategories` à `BudgetManager`** :

Remplacer :
```jsx
<BudgetManager
  budgets={budgets}
  setBudget={setBudget}
  clearBudget={clearBudget}
  expensesByCategory={expensesByCategory}
/>
```

Par :
```jsx
<BudgetManager
  budgets={budgets}
  setBudget={setBudget}
  clearBudget={clearBudget}
  expensesByCategory={expensesByCategory}
  allCategories={allCategories}
/>
```

- [ ] **Passer `allCategories` et `allCategoryMap` à `TransactionList`** :

Remplacer :
```jsx
<TransactionList
  transactions={transactions}
  allTransactions={allTransactions}
  onDelete={deleteTransaction}
  onEdit={editTransaction}
  onImport={importTransactions}
  onBackup={handleBackup}
  onRestore={handleRestore}
/>
```

Par :
```jsx
<TransactionList
  transactions={transactions}
  allTransactions={allTransactions}
  onDelete={deleteTransaction}
  onEdit={editTransaction}
  onImport={importTransactions}
  onBackup={handleBackup}
  onRestore={handleRestore}
  allCategories={allCategories}
  allCategoryMap={allCategoryMap}
/>
```

- [ ] **Vérifier le build final**

```bash
npm run build 2>&1 | tail -8
```
Attendu : `✓ built in` sans erreurs ni warnings TypeScript.

- [ ] **Committer**

```bash
git add src/App.jsx
git commit -m "feat: câblage catégories personnalisées dans App.jsx"
```

---

## Vérification end-to-end (navigateur)

Démarrer le serveur de dev : `npm run dev` → ouvrir `http://localhost:5173`

- [ ] Formulaire dépense → cliquer "+" → panneau s'ouvre
- [ ] Saisir "Abonnements" → Entrée ou cliquer "Créer" → catégorie sélectionnée dans le select, panneau fermé
- [ ] La catégorie "Abonnements" est dans un groupe "Mes catégories" dans la liste déroulante
- [ ] Ajouter une dépense "Netflix 15€" catégorie "Abonnements"
- [ ] Graphique de répartition → "Abonnements" apparaît avec sa couleur violette
- [ ] Section Budgets → "Abonnements" apparaît avec "Définir budget"
- [ ] Filtre historique → "Abonnements" dans le select avec groupe "Mes catégories"
- [ ] Ouvrir la modal d'édition d'une transaction → "Abonnements" visible dans le select
- [ ] Rouvrir "+" → badge "Abonnements" visible avec × → cliquer × → catégorie supprimée
- [ ] La transaction "Netflix" reste dans l'historique après suppression de la catégorie
- [ ] Recharger la page → les catégories perso persistent (localStorage)
