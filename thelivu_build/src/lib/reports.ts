import { jsPDF } from 'jspdf';
import type { ScanRecord } from './types';

export function downloadPdfReport(record: ScanRecord): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const width = 170;
  let y = 20;
  const add = (text: string, size = 10, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, width) as string[];
    const height = lines.length * (size * 0.42) + 3;
    if (y + height > 278) { doc.addPage(); y = 20; }
    doc.text(lines, 20, y);
    y += height;
  };
  doc.setTextColor(26, 44, 70);
  add('THELIVU — Digital Trust Report', 18, true);
  doc.setTextColor(75, 91, 113);
  add(`Assessment: ${record.assessment}`, 12, true);
  add(`Item: ${record.label}`);
  add(`Generated: ${new Date(record.checkedAt).toLocaleString()}`);
  add(`Summary: ${record.summary}`);
  y += 3;
  add('Findings', 13, true);
  if (!record.findings.length) add('No local structural findings were returned. External reputation and security checks were not performed unless listed in coverage.');
  for (const finding of record.findings) {
    add(`${finding.severity.toUpperCase()} — ${finding.title}`, 10, true);
    add(finding.detail);
    if (finding.evidence) add(`Evidence: ${finding.evidence}`);
    add(`Source: ${finding.source}`);
  }
  y += 2;
  add('Coverage and limitations', 13, true);
  for (const coverage of record.coverage) add(`• ${coverage}`);
  add('This report is informational and does not guarantee safety or establish the absence of a vulnerability.');
  const filename = `thelivu-${record.type}-${new Date(record.checkedAt).toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

export async function shareSummary(title: string, text: string): Promise<'shared' | 'copied' | 'unavailable'> {
  const payload = { title, text };
  if (navigator.share) {
    try { await navigator.share(payload); return 'shared'; } catch { /* user cancellation is not a failure */ }
  }
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return 'copied'; } catch { return 'unavailable'; }
  }
  return 'unavailable';
}
