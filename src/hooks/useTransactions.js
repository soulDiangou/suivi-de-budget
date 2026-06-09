import { useState, useEffect, useMemo } from 'react';
import { CATEGORIES } from '../constants';

const STORAGE_KEY  = 'ledger_transactions_v1';
const RECURRING_KEY = 'ledger_recurring_v1';

function todayMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function computeTotals(list) {
  return list.reduce(
    (acc, t) => {
      if (t.type === 'revenu') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );
}

function computeExpensesByCategory(list) {
  const map = list
    .filter(t => t.type === 'depense')
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});
  return CATEGORIES
    .filter(cat => map[cat.id])
    .map(cat => ({ name: cat.label, value: map[cat.id], color: cat.color }));
}

function autoGenerateRecurring(saved) {
  const month = todayMonth();
  let generated;
  try { generated = JSON.parse(localStorage.getItem(RECURRING_KEY) || '{}'); }
  catch { generated = {}; }

  const newTxs = [];
  let changed = false;

  saved.filter(t => t.isRecurring).forEach(t => {
    const done = generated[t.id] || [];
    if (!done.includes(month)) {
      const day = t.date.slice(8);
      const [y, m] = month.split('-').map(Number);
      const maxDay = new Date(y, m, 0).getDate();
      const actualDay = String(Math.min(parseInt(day, 10), maxDay)).padStart(2, '0');
      newTxs.push({
        ...t,
        id: crypto.randomUUID(),
        date: `${month}-${actualDay}`,
        isRecurring: false,
        generatedFrom: t.id,
        createdAt: new Date().toISOString(),
      });
      generated[t.id] = [...done, month];
      changed = true;
    }
  });

  if (changed) localStorage.setItem(RECURRING_KEY, JSON.stringify(generated));
  return newTxs;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const generated = autoGenerateRecurring(saved);
      if (generated.length > 0) {
        const updated = [...generated, ...saved];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }
      return saved;
    } catch { return []; }
  });

  const [filterMonth, setFilterMonth]   = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (data) =>
    setTransactions(prev => [{
      ...data,
      id: crypto.randomUUID(),
      amount: parseFloat(data.amount),
      note: data.note || '',
      isRecurring: data.isRecurring || false,
      createdAt: new Date().toISOString(),
    }, ...prev]);

  const deleteTransaction = (id) =>
    setTransactions(prev => prev.filter(t => t.id !== id));

  const editTransaction = (id, data) =>
    setTransactions(prev => prev.map(t =>
      t.id === id ? { ...t, ...data, amount: parseFloat(data.amount) } : t
    ));

  const importTransactions = (list) =>
    setTransactions(prev => [
      ...list.map(t => ({ ...t, id: crypto.randomUUID(), createdAt: new Date().toISOString() })),
      ...prev,
    ]);

  const availableMonths = useMemo(() => {
    const months = new Set(transactions.map(t => t.date.slice(0, 7)));
    return [...months].sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const visibleTransactions = useMemo(() => {
    let list = filterMonth
      ? transactions.filter(t => t.date.startsWith(filterMonth))
      : transactions;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(t =>
        t.description.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q))
      );
    }
    return list;
  }, [transactions, filterMonth, searchQuery]);

  const { income, expense } = useMemo(() => computeTotals(visibleTransactions), [visibleTransactions]);

  const expensesByCategory = useMemo(() => computeExpensesByCategory(visibleTransactions), [visibleTransactions]);

  const trends = useMemo(() => {
    const target = filterMonth || todayMonth();
    const [y, m] = target.split('-').map(Number);
    const pd = new Date(y, m - 2, 1);
    const prev = `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, '0')}`;
    const curr = computeTotals(transactions.filter(t => t.date.startsWith(target)));
    const prevT = computeTotals(transactions.filter(t => t.date.startsWith(prev)));
    const expenseChange = prevT.expense > 0
      ? ((curr.expense - prevT.expense) / prevT.expense) * 100
      : null;
    const incomeChange = prevT.income > 0
      ? ((curr.income - prevT.income) / prevT.income) * 100
      : null;
    return { currentMonth: target, prevMonth: prev, curr, prev: prevT, expenseChange, incomeChange };
  }, [transactions, filterMonth]);

  return {
    transactions: visibleTransactions,
    allTransactions: transactions,
    addTransaction,
    deleteTransaction,
    editTransaction,
    importTransactions,
    income,
    expense,
    balance: income - expense,
    expensesByCategory,
    filterMonth,
    setFilterMonth,
    availableMonths,
    searchQuery,
    setSearchQuery,
    trends,
  };
}
