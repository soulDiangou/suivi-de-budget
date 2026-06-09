import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatAmount } from '../constants';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="chart-tooltip">
      <span style={{ color: d.payload.color, fontWeight: 600 }}>{d.name}</span>
      <span className="chart-tooltip-amount">{formatAmount(d.value)}</span>
    </div>
  );
};

export default function CategoryChart({ data, total }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-empty">
          <div className="chart-empty-icon">◎</div>
          <p>Aucune dépense enregistrée.</p>
          <p style={{ fontSize: '0.72rem', opacity: 0.6 }}>Le graphique apparaîtra ici.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={88}
            paddingAngle={3}
            dataKey="value"
            animationBegin={0}
            animationDuration={700}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="chart-legend">
        {data.map((entry) => {
          const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
          return (
            <div key={entry.name} className="legend-item">
              <span className="legend-dot" style={{ background: entry.color }} />
              <span className="legend-label">{entry.name}</span>
              <span className="legend-pct">{pct}%</span>
              <span className="legend-amount">{formatAmount(entry.value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
