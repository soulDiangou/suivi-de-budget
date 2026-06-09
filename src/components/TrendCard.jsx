import { formatAmount } from '../constants';

function monthLabel(ym) {
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('fr-FR', { month: 'long' });
}

function TrendBadge({ change }) {
  if (change === null) return <span className="trend-badge trend-badge--neutral">—</span>;
  const up = change > 0;
  const cls = up ? 'up' : 'down';
  const sign = up ? '+' : '';
  return (
    <span className={`trend-badge trend-badge--${cls}`}>
      {up ? '▲' : '▼'} {sign}{change.toFixed(1)} %
    </span>
  );
}

export default function TrendCard({ trends }) {
  const { currentMonth, prevMonth, curr, prev, expenseChange, incomeChange } = trends;

  return (
    <div className="trend-card">
      <div className="trend-header">
        <span className="trend-title">Tendances</span>
        <span className="trend-compare">
          <span className="trend-month trend-month--curr">{monthLabel(currentMonth)}</span>
          <span className="trend-vs">vs</span>
          <span className="trend-month trend-month--prev">{monthLabel(prevMonth)}</span>
        </span>
      </div>

      <div className="trend-rows">
        <div className="trend-row">
          <span className="trend-label">Revenus</span>
          <span className="trend-amount" style={{ color: 'var(--green)' }}>{formatAmount(curr.income)}</span>
          <TrendBadge change={incomeChange} />
        </div>
        <div className="trend-row">
          <span className="trend-label">Dépenses</span>
          <span className="trend-amount" style={{ color: 'var(--red)' }}>{formatAmount(curr.expense)}</span>
          <TrendBadge change={expenseChange} />
        </div>
        <div className="trend-row">
          <span className="trend-label">Solde</span>
          <span className="trend-amount" style={{ color: curr.income - curr.expense >= 0 ? 'var(--gold)' : 'var(--red)' }}>
            {formatAmount(curr.income - curr.expense)}
          </span>
          <span className="trend-badge trend-badge--neutral" style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>
            {prev.income - prev.expense !== 0 ? `vs ${formatAmount(prev.income - prev.expense)}` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
