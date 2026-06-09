import { useState, useEffect } from 'react';

const KEY = 'ledger_goals_v1';

export function useGoals() {
  const [goals, setGoals] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(goals));
  }, [goals]);

  const addGoal = (data) =>
    setGoals(prev => [...prev, { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]);

  const updateGoal = (id, data) =>
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));

  const deleteGoal = (id) =>
    setGoals(prev => prev.filter(g => g.id !== id));

  return { goals, addGoal, updateGoal, deleteGoal };
}
