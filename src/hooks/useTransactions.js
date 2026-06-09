import { useState, useEffect, useMemo } from 'react';
import { CATEGORIES } from '../constants';

const STORAGE_KEY = 'ledger_transactions_v1';

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
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
  return CATEGORIES
    .filter(cat => map[cat.id])
    .map(cat => ({ name: cat.label, value: map[cat.id], color: cat.color }));
}

export function useTransactions() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [filterMonth, setFilterMonth] = useState(null); // null = tous, "YYYY-MM" = mois filtré

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (data) => {
    setTransactions(prev => [
      {
        ...data,
        id: crypto.randomUUID(),
        amount: parseFloat(data.amount),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Mois disponibles (triés du plus récent au plus ancien)
  const availableMonths = useMemo(() => {
    const months = new Set(transactions.map(t => t.date.slice(0, 7)));
    return [...months].sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  // Transactions visibles selon le filtre
  const visibleTransactions = useMemo(() => {
    if (!filterMonth) return transactions;
    return transactions.filter(t => t.date.startsWith(filterMonth));
  }, [transactions, filterMonth]);

  const { income, expense } = useMemo(
    () => computeTotals(visibleTransactions),
    [visibleTransactions]
  );

  const expensesByCategory = useMemo(
    () => computeExpensesByCategory(visibleTransactions),
    [visibleTransactions]
  );

  return {
    transactions: visibleTransactions,
    addTransaction,
    deleteTransaction,
    income,
    expense,
    balance: income - expense,
    expensesByCategory,
    filterMonth,
    setFilterMonth,
    availableMonths,
  };
}
