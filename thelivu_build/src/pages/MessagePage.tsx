import { useState } from 'react';
import { ExternalLink, MessageSquareWarning, ShieldCheck, Trash2 } from 'lucide-react';
import { analyzeMessage } from '../lib/analyzers';
import { announceDataChange } from '../lib/events';
import { saveHistory } from '../lib/storage';
import type { ScanRecord } from '../lib/types';
import { ResultPanel } from '../components/ResultPanel';
import { useToast } from '../components/Toast';

const id = () => globalThis.crypto?.randomUUID?.() ?? String(Date.now());
export function MessagePage() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<ScanRecord | null>(null);
  const { notify } = useToast();
  const analyze = () => {
    if (!message.trim()) { notify('Paste a message or email body to review.', 'error'); return; }
    const checked = analyzeMessage(message);
    const record: ScanRecord = { id: id(), type: 'message', label: 'Pasted message (content not stored)', assessment: checked.assessment, summary: `${checked.findings.length} local indicator(s); message text was not saved and no third party was contacted.`, checkedAt: new Date().toISOString(), findings: checked.findings, coverage: ['Text and URL patterns checked locally', 'No sender authentication/header validation', 'No links were opened or fetched', 'Message body not stored in history'] };
    saveHistory(record); announceDataChange(); setResult(record);
  };
  return <div className="stack">
    <div className="page-head"><div><span className="eyebrow"><MessageSquareWarning /> Local text analysis</span><h1>Message Checker</h1><p>Review suspicious email, SMS, social messages, ads, delivery notices, and payment requests without sending the content anywhere.</p></div><span className="badge badge-success"><ShieldCheck size={11} /> Not uploaded</span></div>
    <section className="panel panel-pad stack"><div><label className="field-label" htmlFor="message-text">Message or email text</label><textarea className="textarea" id="message-text" style={{ minHeight: 230 }} value={message} onChange={(event) => { setMessage(event.target.value); setResult(null); }} placeholder={'Paste the text you want to review. Avoid including passwords, one-time codes, or personal details.'} /></div><div className="row-between" style={{ flexWrap: 'wrap' }}><span className="muted-text small">{message.length} characters · stored only in the current form until you clear it</span><div className="row"><button className="button button-secondary" type="button" onClick={() => { setMessage(''); setResult(null); }}><Trash2 /> Clear</button><button className="button button-primary" type="button" onClick={analyze}><ShieldCheck /> Analyse locally</button></div></div><div className="notice"><ShieldCheck /><span>The checker looks for a small set of urgency, credential/payment, identity, and link indicators. It can miss scams and can flag legitimate messages. It does not authenticate the sender or open links.</span></div></section>
    {result && <div className="stack"><ResultPanel record={result} recommendations={['Contact the organization through a phone number or app you already trust.', 'Never share one-time codes or passwords in response to an unexpected message.', 'Inspect a link hostname before opening; a displayed brand name does not prove ownership.']} />{analyzeMessage(message).links.length > 0 && <section className="panel panel-pad stack-sm"><div className="panel-head"><div><h2>Embedded links</h2><p>Not opened or fetched. Verify the hostname before you visit.</p></div><span className="badge badge-warning">Manual review</span></div>{analyzeMessage(message).links.map((link) => <a className="row-between finding-card" key={link} href={link} target="_blank" rel="noreferrer noopener"><span className="muted-text" style={{ overflowWrap: 'anywhere' }}>{link}</span><ExternalLink size={14} /></a>)}</section>}</div>}
  </div>;
}
