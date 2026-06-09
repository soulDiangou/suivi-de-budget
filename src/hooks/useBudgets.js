import { useState, useEffect } from 'react';

const KEY = 'ledger_budgets_v1';

export function useBudgets() {
  const [budgets, setBudgets] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(budgets));
  }, [budgets]);

  const setBudget = (categoryId, amount) =>
    setBudgets(prev => ({ ...prev, [categoryId]: parseFloat(amount) || 0 }));

  const clearBudget = (categoryId) =>
    setBudgets(prev => { const n = { ...prev }; delete n[categoryId]; return n; });

  return { budgets, setBudget, clearBudget };
}
