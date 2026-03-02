/**
 * تصدير بيانات إلى ملف CSV يفتح في Excel (بدون إضافة مكتبات).
 * Excel يفتح CSV ويعرضه كجدول ويحافظ على UTF-8 بفضل BOM.
 *
 * @param {string} filename - اسم الملف (مثلاً: payouts-2025-03-01.csv)
 * @param {Array<Object>} rows - مصفوفة كائنات (صفوف)
 * @param {Array<{ label: string, key?: string, get?: (row) => any }>} columns - تعريف الأعمدة
 */
export function downloadExcel(filename, rows, columns) {
  const escape = (v) => {
    if (v == null) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const header = columns.map((c) => escape(c.label)).join(',');
  const body = rows
    .map((row) =>
      columns.map((c) => {
        const val = c.key ? row[c.key] : c.get ? c.get(row) : '';
        return escape(val);
      }).join(',')
    )
    .join('\r\n');
  const csv = '\uFEFF' + header + '\r\n' + body;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
