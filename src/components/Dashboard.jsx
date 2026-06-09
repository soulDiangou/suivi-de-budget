import { formatAmount } from '../constants';

function StatCard({ type, label, amount, icon, delay }) {
  const isNegative = type === 'balance' && amount < 0;

  return (
    <div
      className={`stat-card stat-card--${isNegative ? 'balance-neg' : type}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__label">{label}</div>
      <div className={`stat-card__amount stat-card__amount--${isNegative ? 'neg' : type}`}>
        {type === 'expense' && amount > 0 ? '−' : ''}{formatAmount(Math.abs(amount))}
      </div>
    </div>
  );
}

export default function Dashboard({ income, expense, balance }) {
  return (
    <div className="dashboard">
      <StatCard
        type="income"
        label="Revenus totaux"
        amount={income}
        delay={0}
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        }
      />
      <StatCard
        type="expense"
        label="Dépenses totales"
        amount={expense}
        delay={80}
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        }
      />
      <StatCard
        type="balance"
        label="Solde restant"
        amount={balance}
        delay={160}
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
        }
      />
    </div>
  );
}
