import { useState } from 'react';
import { AlertTriangle, ArrowDownToLine, Check, CircleHelp, Copy, FileText, Share2, Shield, ShieldAlert } from 'lucide-react';
import type { Finding, ScanRecord } from '../lib/types';
import { saveReport } from '../lib/storage';
import { announceDataChange } from '../lib/events';
import { downloadPdfReport, shareSummary } from '../lib/reports';
import { useToast } from './Toast';

function badgeClass(assessment: string) {
  if (assessment === 'High Risk') return 'badge-danger';
  if (assessment === 'Suspicious' || assessment === 'Contradicted by Available Evidence') return 'badge-warning';
  if (assessment === 'No Known Threat Detected' || assessment === 'Supported by Available Evidence') return 'badge-success';
  return 'badge-info';
}
function FindingCard({ finding }: { finding: Finding }) {
  const Icon = finding.severity === 'high' ? ShieldAlert : finding.severity === 'medium' ? AlertTriangle : finding.severity === 'low' ? Shield : CircleHelp;
  return <div className="finding-card"><span className={`finding-icon ${finding.severity}`}><Icon /></span><div className="finding-copy"><div className="row-between"><h3>{finding.title}</h3><span className={`badge ${finding.severity === 'high' ? 'badge-danger' : finding.severity === 'medium' ? 'badge-warning' : 'badge-info'}`}>{finding.severity}</span></div><p>{finding.detail}</p>{finding.evidence && <span className="finding-evidence">{finding.evidence}</span>}<div className="small subtle" style={{ marginTop: 6 }}>Source: {finding.source}</div></div></div>;
}

export function ResultPanel({ record, recommendations = [] }: { record: ScanRecord; recommendations?: string[] }) {
  const [showCoverage, setShowCoverage] = useState(true);
  const { notify } = useToast();
  const save = () => {
    saveReport({ id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()), title: `${record.type === 'website' ? 'Website' : record.type.replace('-', ' ')} report — ${new Date(record.checkedAt).toLocaleDateString()}`, createdAt: new Date().toISOString(), record });
    announceDataChange();
    notify('Report saved in this browser.');
  };
  const share = async () => {
    const message = `${record.assessment}: ${record.summary}\nItem: ${record.label}\nCoverage: ${record.coverage.join('; ')}`;
    const result = await shareSummary('Thelivu verification summary', message);
    notify(result === 'shared' ? 'Share sheet opened.' : result === 'copied' ? 'Summary copied to clipboard.' : 'Sharing is unavailable in this browser.', result === 'unavailable' ? 'info' : 'success');
  };
  return <section className="panel panel-pad stack" aria-live="polite">
    <div className="row-between" style={{ alignItems: 'flex-start' }}>
      <div><span className="eyebrow"><ShieldCheckMark /> Assessment</span><h2 style={{ margin: 0, fontSize: 20, letterSpacing: '-.035em' }}>{record.assessment}</h2><p className="muted-text" style={{ margin: '6px 0 0' }}>{record.summary}</p></div>
      <span className={`badge ${badgeClass(record.assessment)}`}><span className="status-dot" />{record.assessment}</span>
    </div>
    <div className="grid grid-2">
      <div className="stat-card" style={{ minHeight: 68 }}><div><div className="stat-label">Analysed item</div><div className="stat-foot" style={{ color: 'var(--text)', overflowWrap: 'anywhere' }}>{record.label}</div></div><span className="stat-icon"><FileText /></span></div>
      <div className="stat-card" style={{ minHeight: 68 }}><div><div className="stat-label">Scan timestamp</div><div className="stat-foot" style={{ color: 'var(--text)' }}>{new Date(record.checkedAt).toLocaleString()}</div></div><span className="stat-icon"><CircleHelp /></span></div>
    </div>
    <div className="row" style={{ flexWrap: 'wrap' }}><button className="button button-secondary button-small" onClick={save}><FileText /> Save report</button><button className="button button-secondary button-small" onClick={() => downloadPdfReport(record)}><ArrowDownToLine /> Download PDF</button><button className="button button-secondary button-small" onClick={() => void share()}><Share2 /> Share summary</button></div>
    <hr className="divider" />
    <div className="stack-sm"><div className="panel-head" style={{ margin: 0 }}><h3>Security checks</h3><span className="badge badge-info">{record.findings.length} finding(s)</span></div>{record.findings.length ? record.findings.map((finding) => <FindingCard key={finding.id} finding={finding} />) : <div className="notice"><CircleHelp /><span>No local structural concern was found. That is not a safety verdict; see the coverage details below.</span></div>}</div>
    {recommendations.length > 0 && <div className="stack-sm"><h3 style={{ margin: 0, fontSize: 12 }}>Recommended next steps</h3>{recommendations.map((text) => <div className="row muted-text" key={text}><Check size={13} color="var(--cyan)" />{text}</div>)}</div>}
    <div className="stack-sm"><button className="row-between" style={{ padding: 0, border: 0, color: 'var(--text)', background: 'transparent', cursor: 'pointer', textAlign: 'left' }} onClick={() => setShowCoverage((open) => !open)}><strong style={{ fontSize: 11 }}>Confidence, coverage & limitations</strong><Copy size={13} color="var(--muted)" /></button>{showCoverage && <div className="row" style={{ flexWrap: 'wrap' }}>{record.coverage.map((item) => <span className="badge" key={item}>{item}</span>)}<span className="badge badge-warning">Heuristic, not a guarantee</span></div>}</div>
  </section>;
}

function ShieldCheckMark() { return <Shield size={12} />; }
