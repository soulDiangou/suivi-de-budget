import { CATEGORY_MAP, formatAmount, formatDate } from '../constants';

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

export default function TransactionList({ transactions, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="list-card">
        <div className="list-empty">
          <div className="list-empty-icon">◈</div>
          <p>Aucune transaction pour le moment.</p>
          <p style={{ opacity: 0.6, fontSize: '0.75rem' }}>Ajoutez votre premier revenu ou dépense ci-dessus.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="list-card">
      {transactions.map((t) => {
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
              <div className="tx-description">{t.description}</div>
              <div className="tx-date">{formatDate(t.date)}</div>
            </div>

            {cat ? (
              <span
                className="tx-category"
                style={{
                  color: cat.color,
                  background: cat.bg,
                  border: `1px solid ${cat.border}`,
                }}
              >
                {cat.label}
              </span>
            ) : (
              <span className="tx-category tx-category--income">Revenu</span>
            )}

            <span className={`tx-amount tx-amount--${isIncome ? 'income' : 'expense'}`}>
              {isIncome ? '+' : '−'}{formatAmount(t.amount)}
            </span>

            <button
              className="delete-btn"
              onClick={() => onDelete(t.id)}
              title="Supprimer"
              aria-label="Supprimer la transaction"
            >
              <TrashIcon />
            </button>
          </div>
        );
      })}
    </div>
  );
}
