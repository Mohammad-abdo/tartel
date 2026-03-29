/**
 * Branded PDF reports (per-type layout + emerald dashboard theme).
 * Uses Noto Sans Arabic (CDN) for proper Arabic shaping in tables/titles.
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const FONT_URL =
  'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansArabic/NotoSansArabic-Regular.ttf';

let cachedFontBase64 = null;
let fontLoadFailed = false;

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function ensureArabicFont(doc) {
  if (fontLoadFailed) {
    doc.setFont('helvetica', 'normal');
    return false;
  }
  try {
    if (!cachedFontBase64) {
      const res = await fetch(FONT_URL);
      if (!res.ok) throw new Error('Font fetch failed');
      cachedFontBase64 = arrayBufferToBase64(await res.arrayBuffer());
    }
    doc.addFileToVFS('NotoSansArabic-Regular.ttf', cachedFontBase64);
    doc.addFont('NotoSansArabic-Regular.ttf', 'NotoSansArabic', 'normal');
    doc.setFont('NotoSansArabic', 'normal');
    return true;
  } catch {
    fontLoadFailed = true;
    doc.setFont('helvetica', 'normal');
    return false;
  }
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

function svgToPngDataUrl(svgText, outW = 320, outH = 96) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = outW;
        c.height = outH;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outW, outH);
        ctx.drawImage(img, 0, 0, outW, outH);
        const data = c.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(data);
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('svg image load'));
    };
    img.src = url;
  });
}

async function resolveLogoDataUrl(logoUrl) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const candidates = [];
  if (logoUrl && String(logoUrl).trim()) {
    const u = String(logoUrl).trim();
    candidates.push(u.startsWith('http') ? u : `${origin}${u.startsWith('/') ? '' : '/'}${u}`);
  }
  candidates.push(`${origin}/admin-logo.svg`);

  for (const url of candidates) {
    try {
      const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
      if (!res.ok) continue;
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (ct.includes('svg') || url.endsWith('.svg')) {
        const text = await res.text();
        return await svgToPngDataUrl(text);
      }
      const blob = await res.blob();
      if (blob.type.startsWith('image/')) {
        return await blobToDataUrl(blob);
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

/** RGB tuples for setFillColor / setDrawColor */
const THEMES = {
  principal: { header: [5, 95, 70], accent: [245, 158, 11], stripe: [16, 185, 129] },
  teachers: { header: [13, 116, 110], accent: [251, 191, 36], stripe: [45, 212, 191] },
  students: { header: [3, 105, 161], accent: [125, 211, 252], stripe: [14, 165, 233] },
  profits: { header: [20, 83, 45], accent: [234, 179, 8], stripe: [34, 197, 94] },
  trends: { header: [67, 56, 202], accent: [165, 180, 252], stripe: [129, 140, 248] },
  sessions: { header: [109, 40, 217], accent: [216, 180, 254], stripe: [167, 139, 250] },
};

function drawHeaderBand(doc, theme, { title, subtitle, periodLine, logoDataUrl, isRTL }) {
  const pageW = doc.internal.pageSize.getWidth();
  const bandH = 30;
  doc.setFillColor(...theme.header);
  doc.rect(0, 0, pageW, bandH, 'F');
  doc.setDrawColor(...theme.accent);
  doc.setLineWidth(0.8);
  doc.line(0, bandH, pageW, bandH);

  const logoW = 36;
  const logoH = 14;
  const margin = 12;
  if (logoDataUrl) {
    try {
      const lx = isRTL ? pageW - margin - logoW : margin;
      doc.addImage(logoDataUrl, 'PNG', lx, 8, logoW, logoH);
    } catch {
      /* ignore */
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  const textX = isRTL ? pageW - margin : margin + (logoDataUrl && !isRTL ? logoW + 6 : 0);
  const align = isRTL ? 'right' : 'left';
  doc.text(title, textX, 14, { align, maxWidth: pageW - margin * 2 - logoW - 8 });
  doc.setFontSize(9);
  doc.setTextColor(230, 245, 240);
  doc.text(subtitle, textX, 22, { align, maxWidth: pageW - margin * 2 - logoW - 8 });

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  const yMeta = bandH + 7;
  doc.text(periodLine, margin, yMeta, { maxWidth: pageW - margin * 2 });
  const gen = new Date().toLocaleString();
  doc.text(gen, isRTL ? pageW - margin : margin, yMeta + 5, { align: isRTL ? 'right' : 'left' });

  return yMeta + 12;
}

function runAutoTable(doc, opts) {
  const { footerBrand, pdfFooterRTL, ...rest } = opts;
  autoTable(doc, {
    ...rest,
    didDrawPage: (data) => {
      const pageH = doc.internal.pageSize.getHeight();
      const pageW = doc.internal.pageSize.getWidth();
      doc.setFontSize(7);
      doc.setTextColor(130);
      const font = rest.styles?.font || 'helvetica';
      doc.setFont(font, 'normal');
      const xBrand = pdfFooterRTL ? pageW - 12 : 12;
      doc.text(footerBrand || '', xBrand, pageH - 6, {
        align: pdfFooterRTL ? 'right' : 'left',
        maxWidth: pageW - 44,
      });
      doc.text(String(data.pageNumber), pdfFooterRTL ? 14 : pageW - 14, pageH - 6);
    },
  });
}

function teacherDisplayName(t) {
  return (
    [t.user?.firstName, t.user?.lastName].filter(Boolean).join(' ') ||
    [t.user?.firstNameAr, t.user?.lastNameAr].filter(Boolean).join(' ') ||
    '—'
  );
}

function studentDisplayName(s) {
  return (
    [s.firstName, s.lastName].filter(Boolean).join(' ') ||
    [s.firstNameAr, s.lastNameAr].filter(Boolean).join(' ') ||
    '—'
  );
}

/**
 * @param {object} params
 * @returns {Promise<void>}
 */
export async function exportReportPdf(params) {
  const {
    type,
    dateRange,
    labels,
    formatCurrency,
    principalData,
    trendsData,
    reportData,
    sidebar,
    isRTL,
    language,
  } = params;

  const theme = THEMES[type] || THEMES.principal;
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const hasArabic = await ensureArabicFont(doc);

  const logoDataUrl = await resolveLogoDataUrl(sidebar?.logoUrl);
  const brandTitle = language === 'ar' ? sidebar?.titleAr || 'ترتيل' : sidebar?.titleEn || 'Tarteel';
  const brandSub =
    language === 'ar' ? sidebar?.subtitleAr || 'منصة حفظ القرآن' : sidebar?.subtitleEn || 'Quran memorization platform';
  const reportTitle = labels.reportTitle || labels.title || brandTitle;
  const periodLine = `${labels.period}: ${dateRange.startDate} → ${dateRange.endDate}`;
  const footerBrand = `© ${brandTitle} — ${brandSub}`;

  let startY = drawHeaderBand(doc, theme, {
    title: reportTitle,
    subtitle: brandSub,
    periodLine,
    logoDataUrl,
    isRTL,
  });

  const fc = (n) => (typeof formatCurrency === 'function' ? formatCurrency(n) : String(n ?? '—'));

  switch (type) {
    case 'principal': {
      const s = principalData?.summary;
      if (!s) throw new Error('No principal data');
      const rows = [
        [labels.totalUsers, String(s.totalUsers ?? 0)],
        [labels.totalTeachers, String(s.totalTeachers ?? 0)],
        [labels.totalStudents, String(s.totalStudents ?? 0)],
        [labels.activeTeachers, String(s.activeTeachers ?? 0)],
        [labels.pendingTeachers, String(s.pendingTeachers ?? 0)],
        [labels.totalBookings, String(s.totalBookings ?? 0)],
        [labels.completedBookings, String(s.completedBookings ?? 0)],
        [labels.cancelledBookings, String(s.cancelledBookings ?? 0)],
        [labels.totalRevenue, fc(s.totalRevenue)],
        [labels.platformRevenue, fc(s.platformRevenue)],
        [labels.teacherPayouts, fc(s.teacherPayouts)],
        [labels.netProfit, fc(s.netProfit)],
      ];
      runAutoTable(doc, {
        startY,
        head: [[labels.metric, labels.value]],
        body: rows,
        styles: {
          font: hasArabic ? 'NotoSansArabic' : 'helvetica',
          fontSize: 10,
          halign: isRTL ? 'right' : 'left',
        },
        headStyles: {
          fillColor: theme.header,
          textColor: 255,
          font: hasArabic ? 'NotoSansArabic' : 'helvetica',
          halign: isRTL ? 'right' : 'left',
        },
        columnStyles: {
          0: { cellWidth: isRTL ? 'auto' : 85 },
          1: { cellWidth: isRTL ? 85 : 'auto', fontStyle: 'normal' },
        },
        footerBrand,
        pdfFooterRTL: isRTL,
      });
      const p = principalData?.period;
      if (p) {
        const after = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : startY + 80;
        doc.setFontSize(11);
        doc.setTextColor(...theme.header);
        doc.setFont(hasArabic ? 'NotoSansArabic' : 'helvetica', 'normal');
        doc.text(labels.periodNew, 12, after);
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(10);
        const py = after + 7;
        doc.text(`${labels.newUsers}: ${p.newUsers ?? 0}`, 12, py);
        doc.text(`${labels.newTeachers}: ${p.newTeachers ?? 0}`, 12, py + 6);
        doc.text(`${labels.newStudents}: ${p.newStudents ?? 0}`, 12, py + 12);
        doc.text(`${labels.newBookings}: ${p.newBookings ?? 0}`, 12, py + 18);
      }
      break;
    }
    case 'teachers': {
      const list = reportData?.teachers?.length ? reportData.teachers : reportData?.topTeachers || [];
      if (!list.length) throw new Error('No teachers data');
      const body = list.slice(0, 80).map((t) => [teacherDisplayName(t), t.user?.email || '—', String(t._count?.bookings ?? 0)]);
      runAutoTable(doc, {
        startY,
        head: [[labels.colTeacher, labels.colEmail, labels.colBookings]],
        body,
        styles: {
          font: hasArabic ? 'NotoSansArabic' : 'helvetica',
          fontSize: 9,
          halign: isRTL ? 'right' : 'left',
        },
        headStyles: {
          fillColor: theme.header,
          textColor: 255,
          font: hasArabic ? 'NotoSansArabic' : 'helvetica',
        },
        foot: list.length > 80 ? [[labels.truncated, '', '']] : undefined,
        footStyles: { fillColor: [250, 250, 250], textColor: [100, 100, 100], fontSize: 8 },
        footerBrand,
        pdfFooterRTL: isRTL,
      });
      break;
    }
    case 'students': {
      const list = reportData?.students?.length ? reportData.students : reportData?.topStudents || [];
      if (!list.length) throw new Error('No students data');
      const body = list.slice(0, 80).map((s) => [studentDisplayName(s), s.email || '—', String(s._count?.studentBookings ?? 0)]);
      runAutoTable(doc, {
        startY,
        head: [[labels.colStudent, labels.colEmail, labels.colBookings]],
        body,
        styles: {
          font: hasArabic ? 'NotoSansArabic' : 'helvetica',
          fontSize: 9,
          halign: isRTL ? 'right' : 'left',
        },
        headStyles: {
          fillColor: theme.header,
          textColor: 255,
          font: hasArabic ? 'NotoSansArabic' : 'helvetica',
        },
        foot: list.length > 80 ? [[labels.truncated, '', '']] : undefined,
        footStyles: { fillColor: [250, 250, 250], textColor: [100, 100, 100], fontSize: 8 },
        footerBrand,
        pdfFooterRTL: isRTL,
      });
      break;
    }
    case 'profits': {
      const s = reportData?.summary;
      if (!s) throw new Error('No profits data');
      const summaryRows = [
        [labels.totalRevenue, fc(s.totalRevenue)],
        [labels.platformRevenue, fc(s.platformRevenue)],
        [labels.teacherPayouts, fc(s.teacherPayouts)],
        [labels.pendingPayouts, fc(s.pendingPayouts)],
        [labels.netProfit, fc(s.netProfit)],
        [labels.profitMargin, s.profitMargin != null ? `${s.profitMargin}%` : '—'],
        [labels.avgRevenueBooking, fc(s.averageRevenuePerBooking)],
      ];
      runAutoTable(doc, {
        startY,
        head: [[labels.metric, labels.value]],
        body: summaryRows,
        styles: {
          font: hasArabic ? 'NotoSansArabic' : 'helvetica',
          fontSize: 10,
          halign: isRTL ? 'right' : 'left',
        },
        headStyles: { fillColor: theme.header, textColor: 255, font: hasArabic ? 'NotoSansArabic' : 'helvetica' },
        footerBrand,
        pdfFooterRTL: isRTL,
      });
      const rev = reportData?.revenueByDate;
      if (rev?.length) {
        const y = (doc.lastAutoTable?.finalY || startY) + 12;
        doc.setFontSize(11);
        doc.setTextColor(...theme.header);
        doc.setFont(hasArabic ? 'NotoSansArabic' : 'helvetica', 'normal');
        doc.text(labels.revenueByDate, 12, y);
        runAutoTable(doc, {
          startY: y + 4,
          head: [[labels.colDate, labels.colAmount]],
          body: rev.slice(0, 40).map((r) => [formatDateSafe(r.createdAt), fc(r.amount)]),
          styles: {
            font: hasArabic ? 'NotoSansArabic' : 'helvetica',
            fontSize: 9,
            halign: isRTL ? 'right' : 'left',
          },
          headStyles: { fillColor: theme.stripe, textColor: 255, font: hasArabic ? 'NotoSansArabic' : 'helvetica' },
          footerBrand,
          pdfFooterRTL: isRTL,
        });
      }
      break;
    }
    case 'trends': {
      const list = trendsData || [];
      if (!list.length) throw new Error('No trends data');
      const body = list.map((r) => [
        String(r.date ?? '—'),
        String(r.total ?? 0),
        String(r.completed ?? 0),
        String(r.cancelled ?? 0),
      ]);
      runAutoTable(doc, {
        startY,
        head: [[labels.colDate, labels.colTotal, labels.colCompleted, labels.colCancelled]],
        body,
        styles: {
          font: hasArabic ? 'NotoSansArabic' : 'helvetica',
          fontSize: 9,
          halign: isRTL ? 'right' : 'left',
        },
        headStyles: { fillColor: theme.header, textColor: 255, font: hasArabic ? 'NotoSansArabic' : 'helvetica' },
        footerBrand,
        pdfFooterRTL: isRTL,
      });
      break;
    }
    case 'sessions': {
      const list = reportData?.data || [];
      if (!list.length) throw new Error('No sessions data');
      const body = list.slice(0, 100).map((r) => [
        String(r.date ?? '—'),
        String(r.teacherName ?? '—'),
        String(r.studentName ?? '—'),
        String(r.studentEmail ?? '—'),
        String(r.endedAt ?? '—'),
      ]);
      runAutoTable(doc, {
        startY,
        head: [[labels.colDate, labels.colTeacher, labels.colStudent, labels.colEmail, labels.sessionEnded]],
        body,
        styles: {
          font: hasArabic ? 'NotoSansArabic' : 'helvetica',
          fontSize: 8,
          halign: isRTL ? 'right' : 'left',
        },
        headStyles: { fillColor: theme.header, textColor: 255, font: hasArabic ? 'NotoSansArabic' : 'helvetica' },
        foot: list.length > 100 ? [[labels.truncated, '', '', '', '']] : undefined,
        footStyles: { fillColor: [250, 250, 250], textColor: [100, 100, 100], fontSize: 8 },
        footerBrand,
        pdfFooterRTL: isRTL,
      });
      break;
    }
    default:
      throw new Error(`Unknown report type: ${type}`);
  }

  const fname = `tarteel-report-${type}-${dateRange.startDate}-${dateRange.endDate}.pdf`;
  doc.save(fname);
}

function formatDateSafe(v) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
}
