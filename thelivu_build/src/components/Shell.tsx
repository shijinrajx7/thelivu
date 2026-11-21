import { useMemo, useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Activity, BookOpenCheck, ChevronRight, CircleHelp, FileSearch, FileText, Globe2, GraduationCap, Home, Image, LayoutDashboard, LockKeyhole, Menu, MessageSquareWarning, Moon, Search, Settings, Shield, ShieldAlert, ShieldCheck, Sun, Video, X, Bell, UserRound, ExternalLink } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { usePreferences } from '../app/Preferences';
import { getReports } from '../lib/storage';

interface NavItem { labelKey: string; path: string; icon: LucideIcon; }
const navItems: NavItem[] = [
  { labelKey: 'overview', path: '/', icon: Home },
  { labelKey: 'scanner', path: '/scanner', icon: Globe2 },
  { labelKey: 'claims', path: '/claims', icon: FileSearch },
  { labelKey: 'image', path: '/image', icon: Image },
  { labelKey: 'video', path: '/video', icon: Video },
  { labelKey: 'messages', path: '/messages', icon: MessageSquareWarning },
  { labelKey: 'review', path: '/security-review', icon: ShieldCheck },
  { labelKey: 'threats', path: '/threats', icon: Activity },
  { labelKey: 'learning', path: '/learning', icon: GraduationCap },
  { labelKey: 'history', path: '/history', icon: FileText },
  { labelKey: 'reports', path: '/reports', icon: BookOpenCheck },
];

export function Shell({ children }: { children: ReactNode }) {
  const { text, toggleTheme, theme } = usePreferences();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const routeTitle = navItems.find((item) => item.path === location.pathname);
  const currentTitle = routeTitle ? text(routeTitle.labelKey) : location.pathname === '/settings' ? text('settings') : location.pathname === '/account' ? text('account') : location.pathname === '/admin' ? 'Administration' : location.pathname.startsWith('/search') ? 'Search results' : 'Thelivu';
  const searchResults = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    const routes = navItems.map((item) => ({ label: text(item.labelKey), path: item.path, meta: 'Workspace' }));
    routes.push({ label: text('settings'), path: '/settings', meta: 'Preferences' }, { label: text('account'), path: '/account', meta: 'Account' });
    const reportResults = getReports().map((report) => ({ label: report.title, path: '/reports', meta: 'Saved report' }));
    const resources = [
      { label: 'Official advisory sources', path: '/threats', meta: 'Source directory' },
      { label: 'Safe URL basics', path: '/learning', meta: 'Learning resource' },
      { label: 'SQL parameterization guide', path: '/security-review', meta: 'Security resource' },
    ];
    return [...routes, ...reportResults, ...resources].filter((result) => `${result.label} ${result.meta}`.toLowerCase().includes(value)).slice(0, 7);
  }, [query, text]);
  const submitSearch = () => {
    const result = searchResults[0];
    if (result) { navigate(result.path); setQuery(''); }
    else if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };
  const closeNav = () => setMobileOpen(false);

  return (
    <div className="app-shell">
      {mobileOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={closeNav} />}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`} aria-label="Main navigation">
        <NavLink className="brand" to="/" onClick={closeNav}>
          <img className="brand-mark" src="/thelivu-shield.svg" alt="" />
          <span><span className="brand-name">THELIVU</span><span className="brand-sub">DIGITAL TRUST CENTRE</span></span>
        </NavLink>
        <div className="nav-label">Workspace</div>
        <nav className="sidebar-nav">
          {navItems.map(({ labelKey, path, icon: Icon }) => (
            <NavLink key={path} to={path} end={path === '/'} onClick={closeNav} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon aria-hidden="true" /><span>{text(labelKey)}</span>
            </NavLink>
          ))}
          <div className="nav-label" style={{ margin: '15px 0 5px' }}>Personal</div>
          <NavLink to="/account" onClick={closeNav} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><UserRound aria-hidden="true" /><span>{text('account')}</span></NavLink>
          <NavLink to="/settings" onClick={closeNav} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Settings aria-hidden="true" /><span>{text('settings')}</span></NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="privacy-card"><strong><LockKeyhole size={13} /> Private by design</strong><p>Website, message, code and media checks stay in this browser. External reputation is not queried.</p></div>
          <button className="sidebar-profile" type="button" onClick={() => navigate('/account')}>
            <span className="profile-avatar"><UserRound size={14} /></span><span className="profile-label">Guest workspace<small>Account not configured</small></span><ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--muted)' }} />
          </button>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" type="button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu /></button>
            <div className="breadcrumb"><span>THELIVU</span><ChevronRight size={13} /><strong>{currentTitle}</strong></div>
          </div>
          <div className="topbar-actions">
            <div className="search-wrap">
              <label className="search-box"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitSearch(); if (event.key === 'Escape') setQuery(''); }} placeholder={text('search')} aria-label={text('search')} /></label>
              {query.trim() && <div className="search-popover" role="listbox">{searchResults.length ? searchResults.map((result, index) => <button className="search-result" key={`${result.path}-${index}`} onClick={() => { navigate(result.path); setQuery(''); }}><Search size={13} /><span>{result.label}<small>{result.meta}</small></span></button>) : <button className="search-result" onClick={submitSearch}><Search size={13} /><span>Search for “{query}”<small>Open search results</small></span></button>}</div>}
            </div>
            <div style={{ position: 'relative' }}>
              <button className="icon-button" type="button" aria-label={text('notifications')} aria-expanded={noticeOpen} onClick={() => setNoticeOpen((open) => !open)}><Bell /></button>
              {noticeOpen && <div className="popover"><div className="row-between" style={{ padding: '8px 9px 10px' }}><strong style={{ fontSize: 11 }}>{text('notifications')}</strong><button className="icon-button" aria-label="Close notifications" onClick={() => setNoticeOpen(false)}><X size={14} /></button></div><div className="notice"><ShieldAlert size={15} /><span><strong>Live alerts are not connected.</strong><br />This workspace does not have an advisory feed configured. Browse verified publishers instead.</span></div><button className="button button-secondary button-small" style={{ width: '100%', marginTop: 10 }} onClick={() => { navigate('/threats'); setNoticeOpen(false); }}>Browse source directory <ExternalLink size={12} /></button></div>}
            </div>
            <button className="icon-button" type="button" aria-label="Toggle light/dark theme" onClick={toggleTheme}>{theme === 'dark' ? <Sun /> : <Moon />}</button>
            <button className="icon-button" type="button" aria-label={text('help')} onClick={() => setHelpOpen(true)}><CircleHelp /></button>
            <button className="icon-button" type="button" aria-label={text('account')} onClick={() => navigate('/account')}><UserRound /></button>
          </div>
        </header>
        <main className="content" id="main-content">{children}</main>
      </div>
      <nav className="mobile-bottom" aria-label="Quick navigation">
        {[{ path: '/', label: 'Home', icon: LayoutDashboard }, { path: '/scanner', label: 'Scan', icon: Globe2 }, { path: '/security-review', label: 'Review', icon: Shield }, { path: '/learning', label: 'Learn', icon: GraduationCap }].map(({ path, label, icon: Icon }) => <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => isActive ? 'active' : ''}><Icon /><span>{label}</span></NavLink>)}
      </nav>
      {helpOpen && <div className="dialog-backdrop" role="presentation" onClick={() => setHelpOpen(false)}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={(event) => event.stopPropagation()}><div className="dialog-head"><h2 id="help-title">Thelivu help & limitations</h2><button className="icon-button modal-close" onClick={() => setHelpOpen(false)} aria-label="Close help"><X /></button></div><p className="muted-text">Thelivu's guest tools analyze the data you provide in this browser. A structural check is not a guarantee that a website is safe. Reputation, DNS, TLS, live advisories, automated source search, and deepfake detection require configured providers and are not reported as successful here.</p><div className="notice"><ShieldCheck /><span>Do not use a security review to test systems you do not own or have explicit permission to assess. The static code/API review does not send traffic to a target.</span></div><div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}><button className="button button-primary" onClick={() => setHelpOpen(false)}>Understood</button></div></section></div>}
    </div>
  );
}
