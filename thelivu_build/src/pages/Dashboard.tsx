import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowRight, FileText, Globe2, GraduationCap, Image, MessageSquareWarning, ShieldCheck, Sparkles, Video } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getHistory, getLearning, getReports } from '../lib/storage';
import type { ScanRecord } from '../lib/types';
import { DATA_CHANGED } from '../lib/events';
import { usePreferences } from '../app/Preferences';
import { useToast } from '../components/Toast';

const routeFor = (type: ScanRecord['type']) => ({ website: '/scanner', message: '/messages', claim: '/claims', image: '/image', video: '/video', 'security-review': '/security-review' })[type];

export function Dashboard() {
  const navigate = useNavigate();
  const { text } = usePreferences();
  const { notify } = useToast();
  const [history, setHistory] = useState<ScanRecord[]>(() => getHistory());
  const [url, setUrl] = useState('');
  useEffect(() => {
    const refresh = () => setHistory(getHistory());
    window.addEventListener(DATA_CHANGED, refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener(DATA_CHANGED, refresh); window.removeEventListener('storage', refresh); };
  }, []);
  const weekly = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(); date.setDate(date.getDate() - (6 - index));
      return { key: date.toISOString().slice(0, 10), day: date.toLocaleDateString(undefined, { weekday: 'short' }), scans: 0 };
    });
    const counts = new Map(days.map((day) => [day.key, day]));
    history.forEach((record) => { const bucket = counts.get(record.checkedAt.slice(0, 10)); if (bucket) bucket.scans += 1; });
    return days;
  }, [history]);
  const completed = getLearning().completed.length;
  const reportCount = getReports().length;
  const quickTools = [
    { title: 'Check a message', description: 'Review pressure, payment and credential cues locally.', icon: MessageSquareWarning, path: '/messages', tone: 'blue' },
    { title: 'Review an image', description: 'Inspect dimensions and metadata on this device.', icon: Image, path: '/image', tone: 'cyan' },
    { title: 'Check video metadata', description: 'Read local file details without uploading it.', icon: Video, path: '/video', tone: 'violet' },
    { title: 'Review API/code', description: 'Look for input-boundary and SQL-construction concerns.', icon: ShieldCheck, path: '/security-review', tone: 'amber' },
  ];
  const openScanner = () => {
    if (!url.trim()) { notify('Enter a website URL to continue.', 'info'); return; }
    navigate('/scanner', { state: { url } });
  };
  return <div className="stack">
    <div className="page-head"><div><span className="eyebrow"><Sparkles /> Digital trust workspace</span><h1>{text('dashboardTitle')}</h1><p>{text('dashboardSubtitle')}</p></div><span className="badge badge-success"><span className="status-dot" /> Guest mode · local checks</span></div>
    <section className="panel panel-pad" style={{ background: 'linear-gradient(112deg, rgba(67,139,255,.13), rgba(53,213,232,.045) 54%, transparent), var(--surface)' }}>
      <div className="row-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}><div><span className="eyebrow"><Globe2 /> Flagship tool</span><h2 style={{ margin: '0 0 6px', fontSize: 18 }}>Inspect a website URL</h2><p className="muted-text" style={{ margin: 0 }}>Local URL-structure review only. The site is not opened or fetched.</p></div><span className="badge badge-info"><ShieldCheck size={11} /> Private by design</span></div>
      <div className="url-entry" style={{ marginTop: 18 }}><Globe2 size={16} color="var(--cyan)" /><input value={url} onChange={(event) => setUrl(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') openScanner(); }} placeholder={text('urlPlaceholder')} aria-label="Website URL" /><button className="button button-primary" onClick={openScanner}>{text('scanNow')}<ArrowRight size={14} /></button></div>
      <div className="row" style={{ marginTop: 10 }}><span className="muted-text small">Example: https://example.com</span><span className="badge badge-warning">No reputation provider queried</span></div>
    </section>
    <div className="grid grid-4">
      <div className="stat-card"><div><div className="stat-label">Local analyses</div><div className="stat-value">{history.length}</div><div className="stat-foot">Saved in this browser</div></div><span className="stat-icon"><Activity /></span></div>
      <div className="stat-card"><div><div className="stat-label">Saved reports</div><div className="stat-value">{reportCount}</div><div className="stat-foot">Browser-local</div></div><span className="stat-icon"><FileText /></span></div>
      <div className="stat-card"><div><div className="stat-label">Learning modules</div><div className="stat-value">{completed}<span style={{ color: 'var(--muted)', fontSize: 13 }}> / 8</span></div><div className="stat-foot">Progress on this device</div></div><span className="stat-icon"><GraduationCap /></span></div>
      <div className="stat-card"><div><div className="stat-label">Provider checks</div><div className="stat-value" style={{ fontSize: 17, marginTop: 13 }}>Not configured</div><div className="stat-foot">No external verdicts</div></div><span className="stat-icon"><ShieldCheck /></span></div>
    </div>
    <div className="grid grid-2">
      <section className="panel panel-pad"><div className="panel-head"><div><h2>Security activity</h2><p>Only analyses saved in this browser are counted.</p></div><span className="badge badge-info">Last 7 days</span></div>
        {history.length ? <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={weekly} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}><defs><linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#438bff" stopOpacity={.28} /><stop offset="100%" stopColor="#438bff" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="rgba(151,171,202,.11)" vertical={false} /><XAxis dataKey="day" tick={{ fill: '#8292a9', fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: '#8292a9', fontSize: 9 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, fontSize: 10 }} /><Area type="monotone" dataKey="scans" stroke="#438bff" fill="url(#activityFill)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div> : <div className="empty-state"><Activity /><strong>No activity yet</strong><p>Your chart will reflect checks you run in this browser. No sample statistics are shown.</p></div>}
      </section>
      <section className="panel panel-pad"><div className="panel-head"><div><h2>{text('recent')}</h2><p>Recent local-only checks</p></div><button className="button button-secondary button-small" onClick={() => navigate('/history')}>View history<ArrowRight size={12} /></button></div>
        {history.length ? <div className="stack-sm">{history.slice(0, 4).map((record) => <button className="row-between search-result" key={record.id} onClick={() => navigate(routeFor(record.type))}><span><strong style={{ display: 'block', fontSize: 10, color: 'var(--text)', textAlign: 'left' }}>{record.label}</strong><small>{record.type} · {new Date(record.checkedAt).toLocaleString()}</small></span><span className={`badge ${record.assessment === 'High Risk' ? 'badge-danger' : record.assessment === 'Suspicious' ? 'badge-warning' : 'badge-info'}`}>{record.assessment}</span></button>)}</div> : <div className="empty-state"><FileText /><strong>{text('noResults')}</strong><p>Run a URL, message, media, or API review to see recent activity here.</p></div>}
      </section>
    </div>
    <section className="stack-sm"><div className="panel-head" style={{ marginBottom: 0 }}><div><h2>{text('quickTools')}</h2><p>Tools that work without creating an account.</p></div></div><div className="grid grid-4">{quickTools.map(({ title, description, icon: Icon, path }) => <button key={path} className="learning-card" type="button" onClick={() => navigate(path)}><span className="stat-icon"><Icon /></span><span style={{ width: '100%', textAlign: 'left' }}><strong style={{ display: 'block', fontSize: 11 }}>{title}</strong><span className="muted-text small">{description}</span></span><span className="row-between" style={{ width: '100%' }}><span className="badge badge-info">Open tool</span><ArrowRight size={13} color="var(--muted)" /></span></button>)}</div></section>
    <div className="notice warning"><ShieldCheck /><span><strong>{text('learningTip')}</strong> Website reputation, DNS/TLS and live intelligence providers are not connected. Read findings as limited observations, not proof of safety.</span></div>
  </div>;
}
