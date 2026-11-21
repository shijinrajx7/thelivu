import { useEffect, useState, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Activity, BookOpenCheck, ExternalLink, FileText, ShieldCheck, Trash2, Settings as SettingsIcon, LockKeyhole, Search as SearchIcon } from 'lucide-react';
import { Shell } from './components/Shell';
import { ToastProvider } from './components/Toast';
import { Intro } from './components/Intro';
import { Dashboard } from './pages/Dashboard';
import { ScanPage } from './pages/ScanPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { ImagePage } from './pages/ImagePage';
import { VideoPage } from './pages/VideoPage';
import { MessagePage } from './pages/MessagePage';
import { SecurityReviewPage } from './pages/SecurityReviewPage';
import { LearningPage } from './pages/LearningPage';
import { clearAllLocalData, clearHistory, deleteReport, getHistory, getReports } from './lib/storage';
import { announceDataChange, DATA_CHANGED } from './lib/events';
import { supabaseConfigured } from './lib/supabase';
import type { ScanRecord } from './lib/types';
import { usePreferences } from './app/Preferences';

function IntroGate({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(() => {
    try { return sessionStorage.getItem('thelivu.intro.seen') !== '1' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch { return false; }
  });
  return <>{show && <Intro onComplete={() => setShow(false)} />}{children}</>;
}
function PageFrame({ children }: { children: ReactNode }) { return <Shell>{children}</Shell>; }
function ThreatsPage() {
  const sources = [
    ['CERT-In', 'Indian Computer Emergency Response Team', 'https://www.cert-in.org.in/'],
    ['Kerala Police Cyberdome', 'Cyber safety and awareness resources', 'https://cyberdome.kerala.gov.in/'],
    ['National Cyber Crime Portal', 'Report cybercrime and access official guidance', 'https://cybercrime.gov.in/'],
    ['CISA Alerts', 'United States cybersecurity advisories', 'https://www.cisa.gov/news-events/cybersecurity-advisories'],
    ['Google Safe Browsing', 'Information about unsafe web resources', 'https://safebrowsing.google.com/'],
  ];
  return <div className="stack"><div className="page-head"><div><span className="eyebrow"><Activity /> Threat intelligence directory</span><h1>Threat Intelligence</h1><p>Official sources to check current advisories. Thelivu does not currently ingest or verify live threat feeds.</p></div><span className="badge badge-warning">Live feed not configured</span></div><section className="panel panel-pad stack"><div className="notice"><ShieldCheck /><span>These are external source links, not live alerts inside Thelivu. Check the publication date and original advisory before acting.</span></div>{sources.map(([name, desc, url]) => <div className="finding-card" key={name}><div className="finding-copy"><div className="row-between"><h3>{name}</h3><a href={url} target="_blank" rel="noreferrer noopener" aria-label={`Open ${name}`}><ExternalLink size={14}/></a></div><p>{desc}</p><a href={url} target="_blank" rel="noreferrer noopener">Visit official source <ExternalLink size={11}/></a></div></div>)}</section></div>;
}
function HistoryPage() {
  const [items, setItems] = useState<ScanRecord[]>(() => getHistory());
  const refresh = () => setItems(getHistory());
  useEffect(() => {
    window.addEventListener('storage', refresh);
    window.addEventListener(DATA_CHANGED, refresh);
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener(DATA_CHANGED, refresh); };
  }, []);
  const removeAll = () => { clearHistory(); announceDataChange(); refresh(); };
  return <div className="stack"><div className="page-head"><div><span className="eyebrow"><FileText/> Local activity</span><h1>Scan History</h1><p>Recent analysis summaries stored in this browser only.</p></div><button className="button button-secondary button-small" onClick={removeAll} disabled={!items.length}><Trash2 size={13}/> Clear history</button></div><section className="panel panel-pad stack">{items.length ? [...items].reverse().map((item) => <div className="finding-card" key={item.id}><div className="finding-copy"><div className="row-between"><h3>{item.type.replace('-', ' ')} · {item.assessment}</h3><span className="small subtle">{new Date(item.checkedAt).toLocaleString()}</span></div><p>{item.label}</p><p className="small muted-text">{item.summary}</p></div></div>) : <div className="empty-state"><FileText/><h3>No scans yet</h3><p>Your locally saved analysis history will appear here.</p></div>}</section></div>;
}
function ReportsPage() {
  const [items, setItems] = useState(() => getReports());
  const refresh = () => setItems(getReports());
  useEffect(() => {
    window.addEventListener('storage', refresh);
    window.addEventListener(DATA_CHANGED, refresh);
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener(DATA_CHANGED, refresh); };
  }, []);
  return <div className="stack"><div className="page-head"><div><span className="eyebrow"><BookOpenCheck/> Your documents</span><h1>Saved Reports</h1><p>Reports saved locally in this browser.</p></div></div><section className="panel panel-pad stack">{items.length ? items.map((item) => <div className="finding-card" key={item.id}><div className="finding-copy"><div className="row-between"><h3>{item.title}</h3><button className="icon-button" aria-label="Delete report" onClick={() => { deleteReport(item.id); announceDataChange(); refresh(); }}><Trash2 size={14}/></button></div><p className="small muted-text">Saved {new Date(item.createdAt).toLocaleString()} · {item.record.assessment}</p><p>{item.record.summary}</p></div></div>) : <div className="empty-state"><BookOpenCheck/><h3>No saved reports</h3><p>Run an analysis and choose Save report to keep it here.</p></div>}</section></div>;
}
function SettingsPage() {
 const [cleared, setCleared] = useState(false);
 const { preferences, setLanguage } = usePreferences();
 return <div className="stack"><div className="page-head"><div><span className="eyebrow"><SettingsIcon/> Preferences & privacy</span><h1>Settings</h1><p>Understand what is stored and how this installation is configured.</p></div></div><section className="panel panel-pad stack"><h2>Display preferences</h2><div className="row-between"><div><strong>Language</strong><p className="small muted-text">Changes navigation and dashboard labels.</p></div><select className="select" style={{ width: 180 }} value={preferences.language} onChange={(event) => setLanguage(event.target.value as 'en' | 'ml' | 'hi')} aria-label="Interface language"><option value="en">English</option><option value="ml">മലയാളം</option><option value="hi">हिन्दी</option></select></div><hr className="divider"/><h2>Privacy controls</h2><div className="notice"><LockKeyhole/><span>Guest workspace data is stored in this browser's local storage. Uploaded image/video bytes are not uploaded by the analysis pages. Do not paste secrets or private URLs into tools you do not trust.</span></div><div className="row-between"><div><strong>Erase local Thelivu data</strong><p className="small muted-text">Clears local history, saved reports, preferences and learning progress from this browser.</p></div><button className="button button-danger button-small" onClick={() => { if (window.confirm('Erase all Thelivu data stored in this browser?')) { clearAllLocalData(); setCleared(true); window.location.reload(); } }}><Trash2 size={13}/> Erase data</button></div>{cleared && <p>Local data cleared.</p>}<hr className="divider"/><h2>Connected services</h2><div className="row-between"><span>Supabase authentication / sync</span><span className={`badge ${supabaseConfigured ? 'badge-success' : 'badge-warning'}`}>{supabaseConfigured ? 'Configured' : 'Not configured'}</span></div><p className="small muted-text">No account, remote sync, or cloud deletion is claimed unless Supabase credentials and backend policies are configured and tested.</p></section></div>;
}
function AccountPage() { return <div className="stack"><div className="page-head"><div><span className="eyebrow"><LockKeyhole/> Personal workspace</span><h1>Guest Account</h1><p>You are using Thelivu without signing in.</p></div><span className="badge badge-info">Guest mode</span></div><section className="panel panel-pad stack"><h2>Account services are not connected</h2><p className="muted-text">Guest tools are available without registration. Cloud accounts, password recovery and cross-device sync are disabled until a Supabase project is configured.</p><a href="/settings" className="button button-secondary">Open privacy settings</a></section></div>; }
function SearchPage() { const location = useLocation(); const q = new URLSearchParams(location.search).get('q') || ''; const navigate = useNavigate(); return <div className="stack"><div className="page-head"><div><span className="eyebrow"><SearchIcon/> Workspace search</span><h1>Search results</h1><p>Results for “{q}”.</p></div></div><section className="panel panel-pad stack"><p>Try the navigation search for tools, learning modules, settings, or saved reports.</p><button className="button button-primary" onClick={() => navigate('/scanner')}>Open Website Scanner</button></section></div>; }
function AppRoutes() { return <Routes><Route path="/" element={<Dashboard/>}/><Route path="/scanner" element={<ScanPage/>}/><Route path="/claims" element={<ClaimsPage/>}/><Route path="/image" element={<ImagePage/>}/><Route path="/video" element={<VideoPage/>}/><Route path="/messages" element={<MessagePage/>}/><Route path="/security-review" element={<SecurityReviewPage/>}/><Route path="/learning" element={<LearningPage/>}/><Route path="/threats" element={<ThreatsPage/>}/><Route path="/history" element={<HistoryPage/>}/><Route path="/reports" element={<ReportsPage/>}/><Route path="/settings" element={<SettingsPage/>}/><Route path="/account" element={<AccountPage/>}/><Route path="/search" element={<SearchPage/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>; }
export function App() { return <BrowserRouter><ToastProvider><IntroGate><PageFrame><AppRoutes/></PageFrame></IntroGate></ToastProvider></BrowserRouter>; }
