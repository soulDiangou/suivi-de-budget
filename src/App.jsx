import { useTransactions } from './hooks/useTransactions';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import CategoryChart from './components/CategoryChart';
import { formatAmount } from './constants';

function monthLabel(ym) {
  const [year, month] = ym.split('-');
  return new Date(Number(year), Number(month) - 1, 1)
    .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function MonthFilter({ filterMonth, setFilterMonth, availableMonths }) {
  if (availableMonths.length === 0) return null;

  const idx = filterMonth ? availableMonths.indexOf(filterMonth) : -1;
  const canPrev = idx < availableMonths.length - 1;
  const canNext = idx > 0;

  const goPrev = () => setFilterMonth(availableMonths[idx + 1] ?? availableMonths[availableMonths.length - 1]);
  const goNext = () => setFilterMonth(availableMonths[idx - 1] ?? availableMonths[0]);

  return (
    <div className="month-filter">
      <button
        className="month-nav-btn"
        onClick={filterMonth ? goPrev : undefined}
        disabled={!filterMonth || !canPrev}
        aria-label="Mois précédent"
      >
        ←
      </button>

      <div className="month-pills">
        <button
          className={`month-pill ${!filterMonth ? 'active' : ''}`}
          onClick={() => setFilterMonth(null)}
        >
          Tous
        </button>
        {availableMonths.map(ym => (
          <button
            key={ym}
            className={`month-pill ${filterMonth === ym ? 'active' : ''}`}
            onClick={() => setFilterMonth(ym)}
          >
            {monthLabel(ym)}
          </button>
        ))}
      </div>

      <button
        className="month-nav-btn"
        onClick={filterMonth ? goNext : undefined}
        disabled={!filterMonth || !canNext}
        aria-label="Mois suivant"
      >
        →
      </button>
    </div>
  );
}

export default function App() {
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    income,
    expense,
    balance,
    expensesByCategory,
    filterMonth,
    setFilterMonth,
    availableMonths,
  } = useTransactions();

  const dateLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="header-name">Suivi de Budget</span>
        </div>

        <span className="header-date">{dateLabel}</span>

        <div className={`header-balance ${balance >= 0 ? 'positive' : 'negative'}`}>
          <span className="header-balance-label">
            {filterMonth ? monthLabel(filterMonth) : 'Solde disponible'}
          </span>
          <span className="header-balance-amount">{formatAmount(balance)}</span>
        </div>
      </header>

      <main className="main">
        <Dashboard income={income} expense={expense} balance={balance} />

        <MonthFilter
          filterMonth={filterMonth}
          setFilterMonth={setFilterMonth}
          availableMonths={availableMonths}
        />

        <div className="content-grid">
          <section>
            <h2 className="section-title">Nouvelle transaction</h2>
            <TransactionForm onAdd={addTransaction} />
          </section>

          <section>
            <h2 className="section-title">Répartition des dépenses</h2>
            <CategoryChart data={expensesByCategory} total={expense} />
          </section>
        </div>

        <section>
          <div className="section-list-header">
            <h2 className="section-title" style={{ marginBottom: 0 }}>Historique</h2>
            <span className="section-count">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <TransactionList transactions={transactions} onDelete={deleteTransaction} />
        </section>
      </main>
    </div>
  );
}
