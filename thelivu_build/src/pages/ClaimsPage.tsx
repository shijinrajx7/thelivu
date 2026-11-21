import { useMemo, useState } from 'react';
import { ExternalLink, FileSearch, Plus, Trash2 } from 'lucide-react';
import { announceDataChange } from '../lib/events';
import { saveHistory } from '../lib/storage';
import { stripSensitiveUrl } from '../lib/analyzers';
import type { Assessment, ClaimEvidence, Finding, ScanRecord } from '../lib/types';
import { ResultPanel } from '../components/ResultPanel';
import { useToast } from '../components/Toast';

const createId = () => globalThis.crypto?.randomUUID?.() ?? String(Date.now() + Math.random());
export function ClaimsPage() {
  const { notify } = useToast();
  const [claim, setClaim] = useState('');
  const [claimType, setClaimType] = useState('Factual statement');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [sourceDate, setSourceDate] = useState('');
  const [stance, setStance] = useState<ClaimEvidence['stance']>('unverified');
  const [evidence, setEvidence] = useState<ClaimEvidence[]>([]);
  const [record, setRecord] = useState<ScanRecord | null>(null);
  const outcome = useMemo<Assessment>(() => {
    if (!evidence.length || evidence.some((item) => item.stance === 'unverified')) return 'Insufficient Evidence';
    const supports = evidence.some((item) => item.stance === 'support');
    const contradicts = evidence.some((item) => item.stance === 'contradict');
    const context = evidence.some((item) => item.stance === 'context');
    if (supports && contradicts) return 'Partially Supported';
    if (contradicts) return 'Contradicted by Available Evidence';
    if (supports && context) return 'Partially Supported';
    if (supports) return 'Supported by Available Evidence';
    if (context) return 'Missing Context';
    return 'Insufficient Evidence';
  }, [evidence]);
  const addEvidence = () => {
    if (!url.trim()) { notify('Enter a source URL first.', 'info'); return; }
    try {
      const parsed = new URL(url.trim());
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
      setEvidence((items) => [...items, { id: createId(), url: stripSensitiveUrl(parsed.toString()), note: note.trim(), stance, publicationDate: sourceDate } as ClaimEvidence]);
      setUrl(''); setNote(''); setSourceDate('');
      setRecord(null);
    } catch { notify('Enter a valid HTTP or HTTPS source URL.', 'error'); }
  };
  const reviewEvidence = () => {
    if (!claim.trim()) { notify('Enter a claim or statement to review.', 'error'); return; }
    const findings: Finding[] = evidence.map((source) => ({ id: source.id, title: `Source marked ${source.stance}`, detail: source.note || 'No source notes added. The page was not fetched or independently verified.', severity: source.stance === 'contradict' ? 'medium' : 'info', evidence: `${host(source.url)}${source.publicationDate ? ` · ${source.publicationDate}` : ''} · ${source.url}`, source: 'User-provided source' }));
    if (!findings.length) findings.push({ id: createId(), title: 'No sources provided', detail: 'Add original source links and dates, then record whether each appears to support, contradict, or contextualize the claim.', severity: 'info', source: 'Evidence workspace' });
    const next: ScanRecord = { id: createId(), type: 'claim', label: `Claim workspace · ${claimType}`, assessment: outcome, summary: evidence.length ? `Assessment is based only on ${evidence.length} source(s) you added and classified. Sources were not fetched or independently fact-checked.` : 'No evidence was supplied. The claim remains unverified and no verdict is made.', checkedAt: new Date().toISOString(), findings, coverage: ['User-provided source links only', 'Source content not fetched', 'Publication dates supplied by user', 'No automatic fact search', 'Claim text not stored in history'] };
    setRecord(next); saveHistory(next); announceDataChange();
  };
  const searchUrl = (engine: 'duckduckgo' | 'google') => engine === 'duckduckgo' ? `https://duckduckgo.com/?q=${encodeURIComponent(claim)}` : `https://www.google.com/search?q=${encodeURIComponent(claim)}`;
  return <div className="stack">
    <div className="page-head"><div><span className="eyebrow"><FileSearch /> Evidence-first workspace</span><h1>Claim & News Checker</h1><p>Separate a claim from its evidence. This workspace does not automatically search the web or invent citations.</p></div><span className="badge badge-warning">Source review is manual</span></div>
    <section className="panel panel-pad stack">
      <div className="grid grid-2"><div><label className="field-label" htmlFor="claim-type">Statement type</label><select className="select" id="claim-type" value={claimType} onChange={(event) => setClaimType(event.target.value)}><option>Factual statement</option><option>Opinion</option><option>Prediction</option><option>Unverified claim</option></select></div><div><label className="field-label" htmlFor="claim-text">Claim, headline, article statement, or public information</label><textarea className="textarea" id="claim-text" value={claim} onChange={(event) => { setClaim(event.target.value); setRecord(null); }} placeholder="What exactly is being claimed? Separate verifiable facts from opinion or prediction." /></div></div>
      <div className="notice"><FileSearch /><span><strong>Automatic source search is not configured.</strong> No result is produced unless you add evidence. Outbound search buttons below open a provider only after you click; claim text is then sent to that search provider.</span></div>
      <div className="panel-head" style={{ marginBottom: 0 }}><div><h2>Add an original source</h2><p>Classify the source yourself; Thelivu does not fetch or verify it.</p></div></div>
      <div className="grid grid-2"><div><label className="field-label" htmlFor="source-url">Source URL</label><input className="input" id="source-url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://publisher.example/article" /></div><div><label className="field-label" htmlFor="source-note">Why it matters / relevant context</label><input className="input" id="source-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a short note; avoid private information" /></div></div>
      <div className="form-row"><div style={{ flex: 1 }}><label className="field-label" htmlFor="source-date">Publication date (if known)</label><input className="input" type="date" id="source-date" value={sourceDate} onChange={(event) => setSourceDate(event.target.value)} /></div><div style={{ flex: 1 }}><label className="field-label" htmlFor="source-stance">Your source assessment</label><select className="select" id="source-stance" value={stance} onChange={(event) => setStance(event.target.value as ClaimEvidence['stance'])}><option value="unverified">Not reviewed</option><option value="support">Appears to support</option><option value="contradict">Appears to contradict</option><option value="context">Adds context</option></select></div><div style={{ alignSelf: 'end' }}><button className="button button-secondary" type="button" onClick={addEvidence}><Plus /> Add source</button></div></div>
      {evidence.length > 0 && <div className="stack-sm">{evidence.map((item) => <div className="finding-card" key={item.id}><div className="finding-copy"><div className="row-between"><a href={item.url} target="_blank" rel="noreferrer noopener">{host(item.url)} <ExternalLink size={11} /></a><button className="icon-button" aria-label="Remove source" onClick={() => { setEvidence((items) => items.filter((source) => source.id !== item.id)); setRecord(null); }}><Trash2 size={14} /></button></div><p>{item.note || 'No note added.'}{item.publicationDate ? ` · ${item.publicationDate}` : ''}</p><span className="badge badge-info">{item.stance}</span></div></div>)}</div>}
      <div className="row-between" style={{ flexWrap: 'wrap' }}><button className="button button-primary" type="button" onClick={reviewEvidence}>Review evidence</button><div className="row"><a className={`button button-secondary button-small ${!claim.trim() ? 'disabled' : ''}`} aria-disabled={!claim.trim()} href={claim.trim() ? searchUrl('duckduckgo') : undefined} target="_blank" rel="noreferrer noopener">Search DuckDuckGo <ExternalLink size={11} /></a><a className={`button button-secondary button-small ${!claim.trim() ? 'disabled' : ''}`} aria-disabled={!claim.trim()} href={claim.trim() ? searchUrl('google') : undefined} target="_blank" rel="noreferrer noopener">Search Google <ExternalLink size={11} /></a></div></div>
    </section>
    {record && <ResultPanel record={record} recommendations={['Check the original publication and its date, not only reposts or screenshots.', 'Look for independent sources that could contradict the claim or provide missing context.', 'Opinion, prediction, and factual reporting should be assessed differently.']} />}
  </div>;
}
function host(value: string) { try { return new URL(value).hostname; } catch { return value; } }
