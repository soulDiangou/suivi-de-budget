import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';

function buildYearData(transactions) {
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('fr-FR', { month: 'short' });
    months.push({ key, label, income: 0, expense: 0 });
  }

  transactions.forEach(t => {
    const m = months.find(x => x.key === t.date.slice(0, 7));
    if (!m) return;
    if (t.type === 'revenu') m.income += t.amount;
    else m.expense += t.amount;
  });

  return months;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span style={{ color: 'var(--text-2)', fontSize: '0.75rem', textTransform: 'capitalize' }}>{label}</span>
      {payload.map(p => (
        <span key={p.dataKey} className="chart-tooltip-amount" style={{ color: p.color }}>
          {p.name} : {p.value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </span>
      ))}
    </div>
  );
};

export default function YearlyChart({ allTransactions }) {
  const data = useMemo(() => buildYearData(allTransactions), [allTransactions]);
  const hasData = data.some(d => d.income > 0 || d.expense > 0);

  return (
    <div className="chart-card">
      <h2 className="section-title" style={{ marginBottom: '1.2rem' }}>Vue annuelle</h2>
      {!hasData ? (
        <div className="chart-empty">
          <span className="chart-empty-icon">📅</span>
          <p>Pas encore de données annuelles.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barGap={4} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--text-3)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              style={{ textTransform: 'capitalize' }}
            />
            <YAxis
              tick={{ fill: 'var(--text-3)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend
              formatter={(v) => <span style={{ color: 'var(--text-2)', fontSize: '0.75rem' }}>{v}</span>}
            />
            <Bar dataKey="income"  name="Revenus"  fill="var(--green)" radius={[4,4,0,0]} maxBarSize={32} />
            <Bar dataKey="expense" name="Dépenses" fill="var(--red)"   radius={[4,4,0,0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
