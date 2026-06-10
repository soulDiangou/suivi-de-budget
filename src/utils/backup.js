// Export : crée un JSON avec toutes les données
export function exportBackup({ transactions, budgets, goals }) {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions,
    budgets,
    goals,
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `suivi-budget-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import : lit un fichier JSON et restaure les données dans localStorage
// Retourne { ok: true } ou { ok: false, error: string }
export function importBackup(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    if (!data.transactions || !Array.isArray(data.transactions)) {
      return { ok: false, error: 'Format invalide : champ "transactions" manquant ou incorrect.' };
    }
    localStorage.setItem('ledger_transactions_v1', JSON.stringify(data.transactions));
    if (data.budgets && typeof data.budgets === 'object') {
      localStorage.setItem('ledger_budgets_v1', JSON.stringify(data.budgets));
    }
    if (data.goals && Array.isArray(data.goals)) {
      localStorage.setItem('ledger_goals_v1', JSON.stringify(data.goals));
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: 'Fichier JSON invalide ou corrompu.' };
  }
}
