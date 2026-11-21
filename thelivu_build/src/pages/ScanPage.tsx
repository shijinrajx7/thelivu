import { useEffect, useState } from 'react';
import { ArrowLeftRight, Clipboard, Eraser, Globe2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { analyzeWebsiteUrl, stripSensitiveUrl } from '../lib/analyzers';
import { announceDataChange } from '../lib/events';
import { saveHistory } from '../lib/storage';
import type { ScanRecord } from '../lib/types';
import { ResultPanel } from '../components/ResultPanel';
import { useToast } from '../components/Toast';

interface ScanLocationState { url?: string; }
export function ScanPage() {
  const location = useLocation();
  const routeState = location.state as ScanLocationState | null;
  const [url, setUrl] = useState(routeState?.url ?? '');
  const [compare, setCompare] = useState(false);
  const [secondUrl, setSecondUrl] = useState('');
  const [result, setResult] = useState<ScanRecord | null>(null);
  const [secondResult, setSecondResult] = useState<ScanRecord | null>(null);
  const { notify } = useToast();
  useEffect(() => { if (routeState?.url) setUrl(routeState.url); }, [routeState?.url]);
  const paste = async () => {
    try { const text = await navigator.clipboard.readText(); if (text) { setUrl(text.trim()); notify('URL pasted from clipboard.'); } else notify('Clipboard is empty.', 'info'); }
    catch { notify('Clipboard access was denied. Paste the URL into the field instead.', 'info'); }
  };
  const run = () => {
    try {
      const first = analyzeWebsiteUrl(url).record;
      let second: ScanRecord | null = null;
      if (compare) second = analyzeWebsiteUrl(secondUrl).record;
      saveHistory(first); if (second) saveHistory(second);
      announceDataChange(); setResult(first); setSecondResult(second);
    } catch (error) { notify(error instanceof Error ? error.message : 'Unable to analyze this URL.', 'error'); }
  };
  return <div className="stack">
    <div className="page-head"><div><span className="eyebrow"><Globe2 /> Local structural review</span><h1>Website Scanner</h1><p>Review visible URL structure without opening the site. This is not a reputation check, TLS inspection, or guarantee of safety.</p></div><span className="badge badge-success"><ShieldCheck size={11} /> Browser-only</span></div>
    <section className="panel panel-pad stack">
      <div><label className="field-label" htmlFor="url-input">Website URL</label><div className="url-entry"><Globe2 size={16} color="var(--cyan)" /><input id="url-input" value={url} onChange={(event) => setUrl(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') run(); }} placeholder="https://example.com" autoComplete="url" /><button className="button button-secondary button-small" type="button" onClick={() => void paste()}><Clipboard /> Paste</button><button className="button button-secondary button-small" type="button" onClick={() => { setUrl(''); setResult(null); setSecondResult(null); }}><Eraser /> Clear</button></div><p className="muted-text small" style={{ margin: '8px 0 0' }}>Accepts only complete HTTP/HTTPS URLs. Sensitive query values are omitted from saved history and reports.</p></div>
      {compare && <div><label className="field-label" htmlFor="second-url">Compare with another URL</label><input className="input" id="second-url" value={secondUrl} onChange={(event) => setSecondUrl(event.target.value)} placeholder="https://another-example.com" /></div>}
      <div className="row-between" style={{ flexWrap: 'wrap' }}><div className="row"><button className="button button-primary" type="button" onClick={run}><ShieldCheck size={14} /> Analyse Website</button><button className="button button-secondary" type="button" onClick={() => { setCompare((value) => !value); setSecondResult(null); }}><ArrowLeftRight size={14} />{compare ? 'Close comparison' : 'Compare URLs'}</button></div><span className="badge badge-warning"><ShieldAlert size={11} /> No arbitrary site fetch</span></div>
      <div className="notice"><ShieldCheck /><span><strong>Privacy:</strong> URL analysis runs in this browser. This app does not open your URL, query a reputation provider, follow redirects, or send private query values to a third party.</span></div>
    </section>
    {result && <div className="stack"><ResultPanel record={result} recommendations={[
      'Verify the registered domain character-by-character before entering credentials.',
      'Use a trusted independent reputation tool if you need provider-backed results; review its privacy policy before submitting a sensitive URL.',
      'Do not treat the lack of local warnings as proof that the site is safe.',
    ]} />{secondResult && <><ResultPanel record={secondResult} /><section className="panel panel-pad"><div className="panel-head"><h2>Structural comparison</h2><span className="badge badge-info">Heuristic only</span></div><p className="muted-text">First host: <strong style={{ color: 'var(--text)' }}>{hostFrom(result.label)}</strong> · Second host: <strong style={{ color: 'var(--text)' }}>{hostFrom(secondResult.label)}</strong></p><p className="muted-text">{result.findings.length === secondResult.findings.length ? 'Both URLs produced the same number of local structural indicators.' : `${result.findings.length > secondResult.findings.length ? 'The first' : 'The second'} URL produced more local structural indicators.`} This comparison does not include DNS, TLS, reputation, or content.</p></section></>}</div>}
  </div>;
}
function hostFrom(value: string) { try { return new URL(stripSensitiveUrl(value)).hostname; } catch { return 'unparsed'; } }
