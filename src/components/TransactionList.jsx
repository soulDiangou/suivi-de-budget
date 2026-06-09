import { useRef, useState } from 'react';
import { CATEGORY_MAP, formatAmount, formatDate } from '../constants';
import { exportToCSV, parseCSVImport } from '../utils/csv';
import TransactionEditModal from './TransactionEditModal';

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export default function TransactionList({ transactions, allTransactions, onDelete, onEdit, onImport }) {
  const [editingTx, setEditingTx] = useState(null);
  const [importError, setImportError] = useState('');
  const fileRef = useRef(null);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSVImport(ev.target.result);
      if (!parsed || parsed.length === 0) {
        setImportError('Impossible de lire ce fichier. Vérifiez le format CSV.');
      } else {
        setImportError('');
        onImport(parsed);
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  return (
    <>
      {editingTx && (
        <TransactionEditModal
          transaction={editingTx}
          onSave={onEdit}
          onClose={() => setEditingTx(null)}
        />
      )}

      <div className="section-list-header">
        <h2 className="section-title" style={{ marginBottom: 0 }}>Historique</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="section-count">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</span>
          <button className="list-action-btn" onClick={() => exportToCSV(allTransactions)} title="Exporter en CSV">
            ↓ Export
          </button>
          <button className="list-action-btn" onClick={() => fileRef.current?.click()} title="Importer un CSV">
            ↑ Import
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleImport} style={{ display: 'none' }} />
        </div>
      </div>

      {importError && <p className="form-error" style={{ marginBottom: '0.5rem' }}>{importError}</p>}

      <div className="list-card">
        {transactions.length === 0 ? (
          <div className="list-empty">
            <div className="list-empty-icon">◈</div>
            <p>Aucune transaction pour le moment.</p>
            <p style={{ opacity: 0.6, fontSize: '0.75rem' }}>Ajoutez votre premier revenu ou dépense ci-dessus.</p>
          </div>
        ) : (
          transactions.map((t) => {
            const isIncome = t.type === 'revenu';
            const cat = !isIncome && t.category ? CATEGORY_MAP[t.category] : null;

            return (
              <div key={t.id} className="transaction-item">
                <div className={`tx-icon tx-icon--${t.type}`}>
                  {isIncome ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                  )}
                </div>

                <div className="tx-info">
                  <div className="tx-description">
                    {t.description}
                    {t.isRecurring && <span className="tx-recurring-badge">↻</span>}
                  </div>
                  <div className="tx-date">
                    {formatDate(t.date)}
                    {t.note && <span className="tx-note"> · {t.note}</span>}
                  </div>
                </div>

                {cat ? (
                  <span className="tx-category" style={{ color: cat.color, background: cat.bg, border: `1px solid ${cat.border}` }}>
                    {cat.label}
                  </span>
                ) : (
                  <span className="tx-category tx-category--income">Revenu</span>
                )}

                <span className={`tx-amount tx-amount--${isIncome ? 'income' : 'expense'}`}>
                  {isIncome ? '+' : '−'}{formatAmount(t.amount)}
                </span>

                <button className="edit-btn" onClick={() => setEditingTx(t)} title="Modifier" aria-label="Modifier">
                  <PencilIcon />
                </button>

                <button className="delete-btn" onClick={() => onDelete(t.id)} title="Supprimer" aria-label="Supprimer">
                  <TrashIcon />
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
