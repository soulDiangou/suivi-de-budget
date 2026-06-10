import { useMemo } from 'react';
import { useTransactions } from './hooks/useTransactions';
import { useTheme } from './hooks/useTheme';
import { useBudgets } from './hooks/useBudgets';
import { useGoals } from './hooks/useGoals';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import CategoryChart from './components/CategoryChart';
import YearlyChart from './components/YearlyChart';
import TrendCard from './components/TrendCard';
import BudgetManager from './components/BudgetManager';
import SavingsGoals from './components/SavingsGoals';
import SearchBar from './components/SearchBar';
import { formatAmount, CATEGORIES } from './constants';

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
      <button className="month-nav-btn" onClick={filterMonth ? goPrev : undefined} disabled={!filterMonth || !canPrev} aria-label="Mois précédent">←</button>
      <div className="month-pills">
        <button className={`month-pill ${!filterMonth ? 'active' : ''}`} onClick={() => setFilterMonth(null)}>Tous</button>
        {availableMonths.map(ym => (
          <button key={ym} className={`month-pill ${filterMonth === ym ? 'active' : ''}`} onClick={() => setFilterMonth(ym)}>
            {monthLabel(ym)}
          </button>
        ))}
      </div>
      <button className="month-nav-btn" onClick={filterMonth ? goNext : undefined} disabled={!filterMonth || !canNext} aria-label="Mois suivant">→</button>
    </div>
  );
}

function ThemeToggle({ theme, toggle }) {
  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Changer le thème" title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  );
}

export default function App() {
  const {
    transactions, allTransactions,
    addTransaction, deleteTransaction, editTransaction, importTransactions,
    income, expense, balance,
    expensesByCategory,
    filterMonth, setFilterMonth, availableMonths,
    searchQuery, setSearchQuery,
    trends,
  } = useTransactions();

  const { theme, toggleTheme } = useTheme();
  const { budgets, setBudget, clearBudget } = useBudgets();
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals();

  const totalBalance = allTransactions.reduce((acc, t) => {
    return acc + (t.type === 'revenu' ? t.amount : -t.amount);
  }, 0);

  const dateLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

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

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="header-name">Suivi de Budget</span>
        </div>

        <span className="header-date">{dateLabel}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          <ThemeToggle theme={theme} toggle={toggleTheme} />
          {overBudgetCount > 0 && (
            <span className="budget-alert-badge">
              ⚠ {overBudgetCount} {overBudgetCount === 1 ? 'dépassé' : 'dépassés'}
            </span>
          )}
          <div className={`header-balance ${balance >= 0 ? 'positive' : 'negative'}`}>
            <span className="header-balance-label">
              {filterMonth ? monthLabel(filterMonth) : 'Solde disponible'}
            </span>
            <span className="header-balance-amount">{formatAmount(balance)}</span>
          </div>
        </div>
      </header>

      <main className="main">
        <Dashboard income={income} expense={expense} balance={balance} />

        <TrendCard trends={trends} />

        <MonthFilter filterMonth={filterMonth} setFilterMonth={setFilterMonth} availableMonths={availableMonths} />

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

        <YearlyChart allTransactions={allTransactions} />

        <div className="content-grid">
          <section>
            <BudgetManager
              budgets={budgets}
              setBudget={setBudget}
              clearBudget={clearBudget}
              expensesByCategory={expensesByCategory}
            />
          </section>
          <section>
            <SavingsGoals
              goals={goals}
              addGoal={addGoal}
              updateGoal={updateGoal}
              deleteGoal={deleteGoal}
              totalBalance={totalBalance}
            />
          </section>
        </div>

        <section>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <TransactionList
            transactions={transactions}
            allTransactions={allTransactions}
            onDelete={deleteTransaction}
            onEdit={editTransaction}
            onImport={importTransactions}
          />
        </section>
      </main>
    </div>
  );
}
