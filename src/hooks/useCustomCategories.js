import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ledger_custom_categories_v1';

const CUSTOM_PALETTE = [
  '#9370DB', '#FF8C00', '#20B2AA', '#FF6B6B', '#6495ED',
  '#F0A500', '#32CD32', '#FF69B4', '#87CEEB', '#DDA0DD',
];

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function useCustomCategories() {
  const [customCategories, setCustomCategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customCategories));
  }, [customCategories]);

  const addCustomCategory = (label) => {
    const color = CUSTOM_PALETTE[customCategories.length % CUSTOM_PALETTE.length];
    const newCat = {
      id: crypto.randomUUID(),
      label,
      color,
      bg: hexToRgba(color, 0.12),
      border: hexToRgba(color, 0.3),
      isCustom: true,
    };
    setCustomCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const deleteCustomCategory = (id) => {
    setCustomCategories(prev => prev.filter(c => c.id !== id));
  };

  return { customCategories, addCustomCategory, deleteCustomCategory };
}
