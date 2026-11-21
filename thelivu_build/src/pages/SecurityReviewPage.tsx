import { useState, type ChangeEvent } from 'react';
import { Code2, FileJson2, ShieldAlert, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { analyzeSecurityArtifact } from '../lib/analyzers';
import { announceDataChange } from '../lib/events';
import { saveHistory } from '../lib/storage';
import type { Assessment, ScanRecord } from '../lib/types';
import { ResultPanel } from '../components/ResultPanel';
import { useToast } from '../components/Toast';

const makeId = () => globalThis.crypto?.randomUUID?.() ?? String(Date.now());
export function SecurityReviewPage() {
  const [input, setInput] = useState('');
  const [target, setTarget] = useState('');
  const [record, setRecord] = useState<ScanRecord | null>(null);
  const { notify } = useToast();
  const loadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (file.size > 1024 * 1024) { notify('Choose a code/spec file smaller than 1 MB.', 'error'); return; }
    try { const text = await file.text(); setInput(text); setRecord(null); notify(`${file.name} loaded locally; the file was not uploaded.`); }
    catch { notify('Could not read this file in the browser.', 'error'); }
    event.target.value = '';
  };
  const run = () => {
    try {
      if (target.trim()) {
        const parsed = new URL(target.trim());
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Target label must be a valid HTTP or HTTPS URL.');
      }
      const analysis = analyzeSecurityArtifact(input);
      const assessment: Assessment = analysis.findings.some((item) => item.severity === 'high') ? 'High Risk' : analysis.findings.some((item) => item.severity === 'medium') ? 'Suspicious' : 'Inconclusive';
      const host = target.trim() ? new URL(target.trim()).hostname : undefined;
      const next: ScanRecord = { id: makeId(), type: 'security-review', label: host ? `Static review · ${host}` : `Static ${analysis.sourceKind} review`, assessment, summary: analysis.summary, checkedAt: new Date().toISOString(), findings: analysis.findings, coverage: [`${analysis.sourceKind === 'openapi' ? 'OpenAPI/Swagger contract' : 'Pasted source text'} reviewed locally`, `${analysis.scannedLines} line(s) inspected`, 'No target domain was contacted', 'No SQL payloads, fuzzing, or destructive requests', 'Static patterns can miss issues and generate false positives'] };
      setRecord(next); saveHistory(next); announceDataChange();
    } catch (error) { notify(error instanceof Error ? error.message : 'Unable to run this static review.', 'error'); }
  };
  return <div className="stack">
    <div className="page-head"><div><span className="eyebrow"><ShieldCheck /> Defensive static analysis</span><h1>API & Input Security Review</h1><p>Review your own API contract or code locally for SQL construction, missing input bounds, IP/port validation, and common control gaps.</p></div><span className="badge badge-success"><Code2 size={11} /> No target contact</span></div>
    <div className="notice danger"><ShieldAlert /><span><strong>Not a penetration test.</strong> The review does not send requests, exploit SQL injection, fuzz endpoints, bypass controls, or scan a domain. Use it only for code or API artifacts you are authorized to review. Findings are heuristic and cannot prove security or exploitability.</span></div>
    <section className="panel panel-pad stack"><div className="grid grid-2"><div><label className="field-label" htmlFor="security-target">Website URL label (optional; never contacted)</label><input className="input" id="security-target" value={target} onChange={(event) => setTarget(event.target.value)} placeholder="https://your-staging-site.example" /><p className="muted-text small">This is stored only as a hostname label in history; no network request is sent.</p></div><div><label className="field-label" htmlFor="artifact-file">Load OpenAPI/Swagger JSON or source file (max 1 MB)</label><label className="button button-secondary" htmlFor="artifact-file"><Upload /> Choose local file<input id="artifact-file" type="file" accept=".json,.yaml,.yml,.ts,.tsx,.js,.jsx,.py,.sql,.txt" style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} onChange={loadFile} /></label></div></div>
      <div><label className="field-label" htmlFor="security-input">Paste API schema or code</label><textarea className="textarea" id="security-input" style={{ minHeight: 250, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 10 }} value={input} onChange={(event) => { setInput(event.target.value); setRecord(null); }} placeholder={"Paste your authorized OpenAPI JSON or a source snippet. Example fields:\n{\"type\":\"integer\",\"minimum\":1,\"maximum\":1000}\n\nFor IP-like fields, use a validated IPv4/IPv6 format and range checks."} /></div>
      <div className="row-between" style={{ flexWrap: 'wrap' }}><span className="muted-text small">Code and specifications are not uploaded or saved.</span><div className="row"><button className="button button-secondary" onClick={() => { setInput(''); setTarget(''); setRecord(null); }}><Trash2 /> Clear</button><button className="button button-primary" onClick={run}><FileJson2 /> Run local review</button></div></div>
      <div className="grid grid-3"><div className="source-card"><span className="badge badge-warning">SQL injection risk</span><p>Checks visible source patterns that may concatenate request data into SQL. Use prepared/parameterized queries.</p></div><div className="source-card"><span className="badge badge-info">Integer overflow</span><p>Looks for unbounded integer/query parameters. Set application-specific ranges and enforce them on the server.</p></div><div className="source-card"><span className="badge badge-info">IP/network input</span><p>Flags IP-like fields without explicit format/range hints. Validate address family and every component server-side.</p></div></div>
    </section>
    {record && <ResultPanel record={record} recommendations={['Use parameterized queries/prepared statements for every untrusted SQL value.', 'Define minimum/maximum constraints for numeric IDs, ports, offsets, and limits, then enforce them at runtime.', 'Validate IP addresses with a vetted parser; do not rely on a regex or declared OpenAPI format alone.', 'Perform authorized security tests only in a controlled staging environment with written scope and rate limits.']} />}
  </div>;
}
