export function exportToCSV(transactions) {
  const headers = ['Date', 'Type', 'Description', 'Catégorie', 'Montant', 'Note', 'Récurrent'];
  const rows = transactions.map(t => [
    t.date,
    t.type === 'revenu' ? 'Revenu' : 'Dépense',
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.category || '',
    t.amount.toFixed(2).replace('.', ','),
    `"${(t.note || '').replace(/"/g, '""')}"`,
    t.isRecurring ? 'Oui' : 'Non',
  ]);

  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `suivi-budget-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCSVImport(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const sep = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(sep).map(h => h.replace(/"/g, '').trim().toLowerCase());

  const idx = (terms) => headers.findIndex(h => terms.some(t => h.includes(t)));
  const dateIdx   = idx(['date']);
  const descIdx   = idx(['desc', 'libel', 'label', 'intitul', 'operat']);
  const amountIdx = idx(['mont', 'amount', 'debit', 'crédit', 'credit', 'solde']);
  const typeIdx   = idx(['type']);

  if (dateIdx === -1 || amountIdx === -1) return null;

  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = splitCSVLine(line, sep);
    const rawDate   = fields[dateIdx]?.replace(/"/g, '').trim();
    const desc      = descIdx >= 0 ? fields[descIdx]?.replace(/"/g, '').trim() : `Ligne ${i}`;
    const rawAmount = fields[amountIdx]?.replace(/"/g, '').replace(/\s/g, '').replace(',', '.').trim();
    const amount    = parseFloat(rawAmount);

    if (!rawDate || isNaN(amount) || !desc) continue;

    const date = normalizeDate(rawDate);
    if (!date) continue;

    let type = 'depense';
    if (typeIdx >= 0) {
      const typeStr = fields[typeIdx]?.toLowerCase() || '';
      type = typeStr.includes('rev') || typeStr.includes('cr') ? 'revenu' : 'depense';
    } else {
      type = amount >= 0 ? 'revenu' : 'depense';
    }

    result.push({
      type,
      description: desc,
      amount: Math.abs(amount),
      date,
      category: type === 'depense' ? 'autres' : null,
      note: '',
      isRecurring: false,
    });
  }

  return result;
}

function splitCSVLine(line, sep) {
  const result = [];
  let cur = '';
  let inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === sep && !inQ) { result.push(cur); cur = ''; }
    else { cur += ch; }
  }
  result.push(cur);
  return result;
}

function normalizeDate(d) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const m1 = d.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m1) return `${m1[3]}-${m1[2].padStart(2,'0')}-${m1[1].padStart(2,'0')}`;
  return null;
}
