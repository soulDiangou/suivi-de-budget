export const CATEGORIES = [
  { id: 'transport',      label: 'Transport',      color: '#4E9AF1', bg: 'rgba(78,154,241,0.12)',  border: 'rgba(78,154,241,0.3)'  },
  { id: 'alimentation',  label: 'Alimentation',   color: '#C9A84C', bg: 'rgba(201,168,76,0.12)', border: 'rgba(201,168,76,0.3)' },
  { id: 'logement',      label: 'Logement',        color: '#9B72CF', bg: 'rgba(155,114,207,0.12)', border: 'rgba(155,114,207,0.3)' },
  { id: 'divertissement',label: 'Divertissement',  color: '#E05C87', bg: 'rgba(224,92,135,0.12)',  border: 'rgba(224,92,135,0.3)'  },
  { id: 'sante',         label: 'Santé',           color: '#4CAF7D', bg: 'rgba(76,175,125,0.12)',  border: 'rgba(76,175,125,0.3)'  },
  { id: 'vetements',     label: 'Vêtements',       color: '#4EC9C9', bg: 'rgba(78,201,201,0.12)',  border: 'rgba(78,201,201,0.3)'  },
  { id: 'loisirs',       label: 'Loisirs',         color: '#E07B3A', bg: 'rgba(224,123,58,0.12)',  border: 'rgba(224,123,58,0.3)'  },
  { id: 'autres',        label: 'Autres',          color: '#7A8499', bg: 'rgba(122,132,153,0.12)', border: 'rgba(122,132,153,0.3)' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

export const formatAmount = (amount) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

export const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
};

export const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
