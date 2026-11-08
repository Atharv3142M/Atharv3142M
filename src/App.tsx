import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode
} from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  Check,
  ChevronRight,
  Clock3,
  Code2,
  Command,
  Cpu,
  ExternalLink,
  Folder,
  FolderOpen,
  HardDrive,
  Home,
  Info,
  Layers,
  Laptop,
  LayoutGrid,
  Mail,
  Maximize2,
  Minus,
  Monitor,
  Palette,
  PanelLeft,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Square,
  Terminal,
  UserRound,
  X,
  Zap,
  Gamepad2,
  Clapperboard,
  type LucideIcon
} from 'lucide-react';
import {
  certificates,
  contact,
  education,
  milestones,
  projects,
  skillGroups,
  wallpaperLibrary,
  type Project,
  type ProjectCategory
} from './data';
import { clampMove, clampResize, clampToViewport, type Geometry } from './windowGeometry';
import { DEFAULT_PREFERENCES, PREFERENCE_KEY, parsePreferences, serializePreferences, type Preferences } from './preferences';

type AppId = 'home' | 'projects' | 'about' | 'toolkit' | 'credentials' | 'terminal' | 'places' | 'settings' | 'contact' | 'lab' | 'device';
type WindowState = Geometry & {
  id: AppId;
  z: number;
  minimized: boolean;
  maximized: boolean;
};
type Interaction = {
  id: AppId;
  pointerId: number;
  mode: 'move' | 'resize';
  startX: number;
  startY: number;
  initial: Geometry;
  current: Geometry;
  element: HTMLElement;
};

type AppMeta = { title: string; short: string; subtitle: string; icon: LucideIcon };

function GitHubMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.68-3.76-1.31-3.76-1.31-.51-1.3-1.24-1.65-1.24-1.65-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 1.7 2.62 1.21 3.26.92.1-.72.39-1.21.71-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.67.11 2.95.72.78 1.15 1.77 1.15 2.99 0 4.29-2.62 5.23-5.11 5.51.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
    </svg>
  );
}

const appMeta: Record<AppId, AppMeta> = {
  home: { title: 'Welcome', short: 'Home', subtitle: 'Workspace overview', icon: Home },
  projects: { title: 'Projects', short: 'Projects', subtitle: 'Selected work and technical case studies', icon: FolderOpen },
  about: { title: 'About Atharv', short: 'About', subtitle: 'Profile and education', icon: UserRound },
  toolkit: { title: 'Toolkit', short: 'Toolkit', subtitle: 'Technologies and tools used', icon: Layers },
  credentials: { title: 'Credentials', short: 'Credentials', subtitle: 'Certificates and milestones', icon: Award },
  terminal: { title: 'Terminal', short: 'Terminal', subtitle: 'Portfolio command interface', icon: Terminal },
  places: { title: 'Places', short: 'Places', subtitle: 'Browse the workspace index', icon: Folder },
  settings: { title: 'Settings', short: 'Settings', subtitle: 'Personalize this browser workspace', icon: Settings },
  contact: { title: 'Contact', short: 'Contact', subtitle: 'Contact and profile links', icon: Mail },
  lab: { title: 'Lab Notes', short: 'Lab', subtitle: 'Hardware, systems, games and media', icon: Cpu },
  device: { title: 'About this device', short: 'Device', subtitle: 'Workspace information and privacy', icon: Monitor }
};

const appOrder: AppId[] = ['home', 'projects', 'places', 'about', 'toolkit', 'credentials', 'terminal', 'lab', 'settings', 'contact', 'device'];
const pinnedApps: AppId[] = ['home', 'projects', 'places', 'terminal', 'toolkit', 'settings'];
const defaultGeometry: Record<AppId, Geometry> = {
  home: { x: 160, y: 82, width: 690, height: 510 },
  projects: { x: 145, y: 66, width: 980, height: 650 },
  about: { x: 168, y: 84, width: 730, height: 570 },
  toolkit: { x: 160, y: 82, width: 800, height: 590 },
  credentials: { x: 160, y: 78, width: 780, height: 590 },
  terminal: { x: 160, y: 102, width: 700, height: 470 },
  places: { x: 160, y: 72, width: 820, height: 570 },
  settings: { x: 160, y: 76, width: 760, height: 590 },
  contact: { x: 176, y: 94, width: 620, height: 470 },
  lab: { x: 160, y: 88, width: 780, height: 580 },
  device: { x: 176, y: 105, width: 590, height: 440 }
};

const compactQuery = '(max-width: 760px)';

function readPreferences(): Preferences {
  try { return parsePreferences(window.localStorage.getItem(PREFERENCE_KEY)); }
  catch { return { ...DEFAULT_PREFERENCES }; }
}

function useCompactLayout() {
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia(compactQuery).matches);
  useEffect(() => {
    const query = window.matchMedia(compactQuery);
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return compact;
}

function LocalClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return <>
    <span>{now.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
    <strong>{now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</strong>
  </>;
}

function IconButton({ label, onClick, children, className = '' }: { label: string; onClick: () => void; children: ReactNode; className?: string }) {
  return <button className={`icon-button ${className}`} type="button" aria-label={label} title={label} onClick={onClick}>{children}</button>;
}

function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return <div className="section-heading">
    <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>
    {children}
  </div>;
}

function App() {
  const [preferences, setPreferences] = useState<Preferences>(readPreferences);
  const [windows, setWindows] = useState<WindowState[]>([
    { id: 'home', ...defaultGeometry.home, z: 10, minimized: false, maximized: false }
  ]);
  const [activeId, setActiveId] = useState<AppId>('home');
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [launcherQuery, setLauncherQuery] = useState('');
  const [notification, setNotification] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const compact = useCompactLayout();
  const windowElements = useRef(new Map<AppId, HTMLElement>());
  const interaction = useRef<Interaction | null>(null);
  const animationFrame = useRef<number | null>(null);
  const zCounter = useRef(20);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.dataset.accent = preferences.accent;
    document.documentElement.dataset.reduceMotion = preferences.reduceMotion ? 'true' : 'false';
    try { window.localStorage.setItem(PREFERENCE_KEY, serializePreferences(preferences)); } catch { /* storage may be disabled */ }
  }, [preferences]);

  useEffect(() => () => {
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
  }, []);

  const notify = useCallback((message: string) => {
    setNotification(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setNotification(''), 2300);
  }, []);

  const updatePreference = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences(current => ({ ...current, [key]: value }));
  }, []);

  const resetPreferences = useCallback(() => {
    try { window.localStorage.removeItem(PREFERENCE_KEY); } catch { /* storage may be disabled */ }
    setPreferences(DEFAULT_PREFERENCES);
    setWindows(current => current.map(item => ({ ...item, ...clampToViewport(defaultGeometry[item.id], { width: window.innerWidth, height: window.innerHeight }), maximized: false })));
    notify('Workspace preferences restored to defaults.');
  }, [notify]);

  const focusWindow = useCallback((id: AppId) => {
    setActiveId(id);
    const currentWindow = windows.find(item => item.id === id);
    const highest = Math.max(0, ...windows.filter(item => !item.minimized).map(item => item.z));
    if (!currentWindow || currentWindow.z >= highest) return;
    const nextZ = Math.max(zCounter.current, highest) + 1;
    zCounter.current = nextZ;
    setWindows(current => current.map(item => item.id === id ? { ...item, z: nextZ } : item));
  }, [windows]);

  const openApp = useCallback((id: AppId) => {
    const existing = windows.find(item => item.id === id);
    const nextZ = Math.max(zCounter.current, ...windows.map(item => item.z), 10) + 1;
    zCounter.current = nextZ;
    if (existing) {
      setWindows(current => current.map(item => item.id === id ? { ...item, minimized: false, z: nextZ } : item));
    } else {
      const base = defaultGeometry[id];
      const offset = Math.min(windows.length * 17, 85);
      const geometry = compact
        ? { x: 8, y: 58, width: window.innerWidth - 16, height: window.innerHeight - 134 }
        : clampToViewport({ ...base, x: base.x + offset, y: base.y + offset }, { width: window.innerWidth, height: window.innerHeight });
      setWindows(current => [...current, { id, ...geometry, z: nextZ, minimized: false, maximized: false }]);
    }
    setActiveId(id);
    setLauncherOpen(false);
    if (id !== 'projects') setSelectedProjectId(null);
  }, [compact, windows]);

  const closeApp = useCallback((id: AppId) => {
    const remaining = windows.filter(item => item.id !== id);
    setWindows(remaining);
    if (activeId === id) {
      const next = remaining.filter(item => !item.minimized).sort((a, b) => b.z - a.z)[0];
      setActiveId(next?.id ?? 'home');
    }
  }, [activeId, windows]);

  const minimizeApp = useCallback((id: AppId) => {
    const remaining = windows.map(item => item.id === id ? { ...item, minimized: true } : item);
    setWindows(remaining);
    if (activeId === id) {
      const next = remaining.filter(item => !item.minimized).sort((a, b) => b.z - a.z)[0];
      setActiveId(next?.id ?? 'home');
    }
  }, [activeId, windows]);

  const toggleMaximize = useCallback((id: AppId) => {
    const nextZ = ++zCounter.current;
    setWindows(current => current.map(item => item.id === id ? { ...item, maximized: !item.maximized, z: nextZ } : item));
    setActiveId(id);
  }, []);

  const restoreWindow = useCallback((id: AppId) => {
    const nextZ = ++zCounter.current;
    setWindows(current => current.map(item => item.id === id ? { ...item, minimized: false, z: nextZ } : item));
    setActiveId(id);
  }, []);

  const beginInteraction = useCallback((event: ReactPointerEvent<HTMLElement>, id: AppId, mode: 'move' | 'resize') => {
    if (compact || event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('button, a, input, textarea, select, [data-no-drag="true"]')) return;
    const windowState = windows.find(item => item.id === id);
    const element = windowElements.current.get(id);
    if (!windowState || !element || windowState.maximized) return;
    event.preventDefault();
    const initial: Geometry = { x: windowState.x, y: windowState.y, width: windowState.width, height: windowState.height };
    interaction.current = {
      id,
      pointerId: event.pointerId,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      initial,
      current: initial,
      element
    };
    element.classList.add('is-interacting');
    document.documentElement.classList.add('poserion-interacting');
  }, [compact, windows]);

  useEffect(() => {
    const applyGeometry = (session: Interaction, clientX: number, clientY: number) => {
      const delta = { x: clientX - session.startX, y: clientY - session.startY };
      const next = session.mode === 'move'
        ? clampMove(session.initial, delta, { width: window.innerWidth, height: window.innerHeight })
        : clampResize(session.initial, delta, { width: window.innerWidth, height: window.innerHeight });
      session.current = next;
      if (session.mode === 'move') {
        session.element.style.transform = `translate3d(${next.x - session.initial.x}px, ${next.y - session.initial.y}px, 0)`;
      } else {
        session.element.style.width = `${next.width}px`;
        session.element.style.height = `${next.height}px`;
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const session = interaction.current;
      if (!session || event.pointerId !== session.pointerId) return;
      if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
      animationFrame.current = requestAnimationFrame(() => {
        applyGeometry(session, event.clientX, event.clientY);
        animationFrame.current = null;
      });
    };

    const finishInteraction = (event?: PointerEvent) => {
      const session = interaction.current;
      if (!session || (event && event.pointerId !== session.pointerId)) return;
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
      if (event) applyGeometry(session, event.clientX, event.clientY);
      session.element.classList.remove('is-interacting');
      session.element.style.removeProperty('transform');
      session.element.style.removeProperty('width');
      session.element.style.removeProperty('height');
      document.documentElement.classList.remove('poserion-interacting');
      setWindows(current => current.map(item => item.id === session.id ? { ...item, ...session.current } : item));
      interaction.current = null;
    };

    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerup', finishInteraction);
    document.addEventListener('pointercancel', finishInteraction);
    const onBlur = () => finishInteraction();
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', finishInteraction);
      document.removeEventListener('pointercancel', finishInteraction);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      setWindows(current => current.map(item => item.maximized ? item : { ...item, ...clampToViewport(item, viewport) }));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setLauncherOpen(value => !value);
        setLauncherQuery('');
      }
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 't') {
        event.preventDefault();
        openApp('terminal');
      }
      if (event.key === 'Escape') setLauncherOpen(false);
      if (!typing && event.ctrlKey && event.key.toLowerCase() === 'w' && activeId) {
        event.preventDefault();
        closeApp(activeId);
      }
      if (!typing && event.altKey && /^[1-9]$/.test(event.key)) {
        const id = appOrder[Number(event.key) - 1];
        if (id) openApp(id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeId, closeApp, openApp]);

  const launcherApps = useMemo(() => appOrder.filter(id => {
    const search = `${appMeta[id].title} ${appMeta[id].subtitle} ${id}`.toLowerCase();
    return search.includes(launcherQuery.toLowerCase().trim());
  }), [launcherQuery]);

  const getWindowRef = (id: AppId) => (node: HTMLElement | null) => {
    if (node) windowElements.current.set(id, node);
    else windowElements.current.delete(id);
  };

  const renderApplication = (id: AppId) => {
    switch (id) {
      case 'home': return <HomeApp openApp={openApp} />;
      case 'projects': return <ProjectsApp selectedProjectId={selectedProjectId} setSelectedProjectId={setSelectedProjectId} />;
      case 'about': return <AboutApp openApp={openApp} />;
      case 'toolkit': return <ToolkitApp />;
      case 'credentials': return <CredentialsApp />;
      case 'terminal': return <TerminalApp openApp={openApp} preferences={preferences} setPreferences={setPreferences} />;
      case 'places': return <PlacesApp openApp={openApp} />;
      case 'settings': return <SettingsApp preferences={preferences} updatePreference={updatePreference} resetPreferences={resetPreferences} />;
      case 'contact': return <ContactApp />;
      case 'lab': return <LabApp />;
      case 'device': return <DeviceApp />;
    }
  };

  const wallpaper = wallpaperLibrary.find(item => item.id === preferences.wallpaper) ?? wallpaperLibrary[0];

  return <main className={`desktop theme-${preferences.theme}`}>
    <div className="wallpaper-layer" style={{ backgroundImage: `url("${wallpaper.file}")` }} aria-hidden="true" />
    <div className="wallpaper-vignette" aria-hidden="true" />

    <header className="top-panel">
      <button className="brand-button" type="button" onClick={() => openApp('home')} aria-label="Open PoserionOS home">
        <img src="/brand/poserion-mark.png" alt="" />
        <span>PoserionOS</span>
      </button>
      <span className="panel-divider" />
      <nav className="top-nav" aria-label="Workspace">
        <button type="button" className={launcherOpen ? 'nav-active' : ''} onClick={() => { setLauncherOpen(value => !value); setLauncherQuery(''); }}><LayoutGrid size={15} /> Applications</button>
        <button type="button" onClick={() => openApp('places')}><Folder size={15} /> Places</button>
        <button type="button" onClick={() => openApp('terminal')}><Terminal size={15} /> Terminal</button>
      </nav>
      <div className="top-spacer" />
      <div className="top-status">
        <div className="top-clock"><LocalClock /></div>
        <IconButton label="Settings" onClick={() => openApp('settings')}><Settings size={17} /></IconButton>
      </div>
    </header>

    <aside className="left-rail" aria-label="Application shortcuts">
      <div className="rail-primary">
        {(['home', 'projects', 'places', 'toolkit', 'credentials', 'lab'] as AppId[]).map(id => {
          const Icon = appMeta[id].icon;
          const visible = windows.some(item => item.id === id && !item.minimized);
          return <button key={id} type="button" className={`rail-button ${activeId === id && visible ? 'rail-selected' : ''}`} onClick={() => openApp(id)} title={appMeta[id].title} aria-label={`Open ${appMeta[id].title}`}>
            <Icon size={19} strokeWidth={1.8} /><span>{appMeta[id].short}</span>
          </button>;
        })}
      </div>
      <div className="rail-bottom">
        <button type="button" className="rail-button" onClick={() => openApp('contact')} title="Contact" aria-label="Open contact"><Mail size={18} /><span>Contact</span></button>
        <button type="button" className="rail-button" onClick={() => openApp('settings')} title="Settings" aria-label="Open settings"><Settings size={18} /><span>Settings</span></button>
      </div>
    </aside>

    {preferences.showWidgets && <section className="desktop-widgets" aria-label="Desktop widgets">
      <div className="desktop-widget widget-clock">
        <span className="widget-label"><Clock3 size={13} /> LOCAL TIME</span>
        <LocalClock />
      </div>
      <div className="desktop-widget widget-focus">
        <span className="widget-label"><Activity size={13} /> CURRENT FOCUS</span>
        <strong>Software, security and systems</strong>
        <div className="focus-tags"><span>OSINT</span><span>Computer vision</span><span>Embedded</span></div>
      </div>
    </section>}

    {preferences.showShortcuts && <div className="desktop-shortcuts" aria-label="Desktop files">
      {(['projects', 'about', 'terminal'] as AppId[]).map(id => {
        const Icon = appMeta[id].icon;
        return <button key={id} type="button" className="desktop-shortcut" onClick={() => openApp(id)} title={`Open ${appMeta[id].title}`}>
          <span><Icon size={22} /></span><small>{appMeta[id].short}</small>
        </button>;
      })}
    </div>}

    {windows.filter(item => !item.minimized).map(item => {
      const Icon = appMeta[item.id].icon;
      const style: CSSProperties = { left: item.x, top: item.y, width: item.width, height: item.height, zIndex: item.z };
      return <section
        key={item.id}
        ref={getWindowRef(item.id)}
        className={`app-window ${activeId === item.id ? 'is-active' : ''} ${item.maximized ? 'is-maximized' : ''}`}
        style={style}
        aria-label={appMeta[item.id].title}
        onPointerDown={() => focusWindow(item.id)}
      >
        <header
          className="window-titlebar"
          onPointerDown={event => beginInteraction(event, item.id, 'move')}
          onDoubleClick={event => {
            const target = event.target as HTMLElement;
            if (!target.closest('button')) toggleMaximize(item.id);
          }}
        >
          <div className="window-identity"><span className="window-app-icon"><Icon size={15} /></span><strong>{appMeta[item.id].title}</strong><small>{appMeta[item.id].subtitle}</small></div>
          <div className="window-controls" data-no-drag="true">
            <IconButton label="Minimize" onClick={() => minimizeApp(item.id)}><Minus size={14} /></IconButton>
            <IconButton label={item.maximized ? 'Restore' : 'Maximize'} onClick={() => toggleMaximize(item.id)}>{item.maximized ? <Square size={12} /> : <Maximize2 size={13} />}</IconButton>
            <IconButton label="Close" className="close-control" onClick={() => closeApp(item.id)}><X size={15} /></IconButton>
          </div>
        </header>
        <div className="window-content">{renderApplication(item.id)}</div>
        {!item.maximized && !compact && <div className="resize-grip" onPointerDown={event => beginInteraction(event, item.id, 'resize')} aria-hidden="true" />}
      </section>;
    })}

    {launcherOpen && <>
      <button className="launcher-scrim" type="button" aria-label="Close applications menu" onClick={() => setLauncherOpen(false)} />
      <section className="launcher-menu" aria-label="Applications">
        <div className="launcher-heading"><div><span className="eyebrow">WORKSPACE</span><h2>Applications</h2></div><kbd><Command size={12} /> K</kbd></div>
        <label className="launcher-search"><Search size={16} /><input autoFocus value={launcherQuery} onChange={event => setLauncherQuery(event.target.value)} placeholder="Search applications" /></label>
        <div className="launcher-grid">
          {launcherApps.map(id => {
            const Icon = appMeta[id].icon;
            return <button key={id} type="button" className="launcher-app" onClick={() => openApp(id)}><span><Icon size={19} /></span><strong>{appMeta[id].title}</strong><small>{appMeta[id].subtitle}</small></button>;
          })}
          {launcherApps.length === 0 && <div className="empty-state">No matching application.</div>}
        </div>
        <div className="launcher-footer"><span>Atharv Pose</span><span>Ctrl + K to toggle</span></div>
      </section>
    </>}

    <footer className="dock-wrap" aria-label="Application dock">
      <div className="dock">
        {pinnedApps.map(id => {
          const Icon = appMeta[id].icon;
          const opened = windows.some(item => item.id === id);
          const visible = windows.some(item => item.id === id && !item.minimized);
          return <button key={id} type="button" className={`dock-item ${activeId === id && visible ? 'dock-active' : ''}`} title={appMeta[id].title} aria-label={appMeta[id].title} onClick={() => {
            const existing = windows.find(item => item.id === id);
            if (existing && !existing.minimized && activeId === id) minimizeApp(id);
            else if (existing) restoreWindow(id);
            else openApp(id);
          }}>
            <Icon size={20} strokeWidth={1.8} />{opened && <span className={`dock-indicator ${visible ? 'indicator-active' : ''}`} />}
          </button>;
        })}
        <span className="dock-separator" />
        <button type="button" className="dock-item dock-launcher" title="Applications" aria-label="Applications" onClick={() => { setLauncherOpen(value => !value); setLauncherQuery(''); }}><LayoutGrid size={19} /></button>
      </div>
    </footer>

    {notification && <div className="toast" role="status"><Check size={15} />{notification}</div>}
  </main>;
}

function HomeApp({ openApp }: { openApp: (id: AppId) => void }) {
  return <div className="app-scroll home-app">
    <div className="home-hero">
      <div className="home-copy">
        <span className="eyebrow">WORKSPACE PROFILE</span>
        <h1>Atharv <span>Pose</span></h1>
        <p className="role-line">IT undergraduate · Independent developer · Cybersecurity enthusiast</p>
        <p className="home-description">I build software, security tools and practical experiments. My work moves between OSINT, local-first AI, computer vision, web systems and small hardware projects.</p>
        <div className="home-actions">
          <button type="button" className="button-primary" onClick={() => openApp('projects')}>Explore projects <ArrowRight size={15} /></button>
          <button type="button" className="button-secondary" onClick={() => openApp('about')}>About me</button>
        </div>
      </div>
      <div className="home-mark-panel">
        <img src="/brand/poserion-mark.png" alt="PoserionOS geometric mark" />
        <span>PERSONAL WORKSPACE</span>
        <strong>Research, build, understand.</strong>
      </div>
    </div>
    <div className="home-content-grid">
      <section className="home-card home-featured">
        <SectionHeading eyebrow="SELECTED WORK" title="Projects" />
        <div className="featured-project-list">
          {projects.filter(project => project.featured).slice(0, 3).map((project, index) => <button type="button" key={project.id} className="featured-project" onClick={() => openApp('projects')}>
            <span className="project-index">0{index + 1}</span><span className="featured-project-copy"><strong>{project.name}</strong><small>{project.description}</small></span><ArrowUpRight size={16} />
          </button>)}
        </div>
        <button type="button" className="inline-link" onClick={() => openApp('projects')}>View all selected projects <ChevronRight size={15} /></button>
      </section>
      <section className="home-card home-focus">
        <SectionHeading eyebrow="CURRENT INTERESTS" title="Areas I explore" />
        <ul className="interest-list">
          <li><ShieldCheck size={16} /><span><strong>Cybersecurity and OSINT</strong><small>Open-source research, privacy and system behaviour.</small></span></li>
          <li><Code2 size={16} /><span><strong>Applied software and AI</strong><small>Useful applications, computer vision and local models.</small></span></li>
          <li><Cpu size={16} /><span><strong>Hardware and systems</strong><small>Embedded boards, firmware, hosting and troubleshooting.</small></span></li>
        </ul>
        <button type="button" className="inline-link" onClick={() => openApp('lab')}>Open lab notes <ChevronRight size={15} /></button>
      </section>
    </div>
    <div className="home-footer-note"><span>INDEPENDENT PROJECTS</span><span>AI tools are part of the development workflow, not a substitute for engineering decisions.</span></div>
  </div>;
}

function ProjectsApp({ selectedProjectId, setSelectedProjectId }: { selectedProjectId: string | null; setSelectedProjectId: (id: string | null) => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'All' | ProjectCategory>('All');
  const selectedProject = projects.find(project => project.id === selectedProjectId) ?? null;
  const categories: Array<'All' | ProjectCategory> = ['All', 'Security', 'AI & Data', 'Spatial Computing', 'Systems', 'Web', 'Games'];
  const visibleProjects = projects.filter(project => {
    const matchesCategory = category === 'All' || project.category === category;
    const text = `${project.name} ${project.description} ${project.stack.join(' ')}`.toLowerCase();
    return matchesCategory && text.includes(query.toLowerCase().trim());
  });

  if (selectedProject) return <div className="app-scroll project-detail-app">
    <button type="button" className="back-link" onClick={() => setSelectedProjectId(null)}><ArrowLeft size={15} /> Back to projects</button>
    <div className="detail-heading">
      <div><span className="eyebrow">{selectedProject.category.toUpperCase()} / CASE STUDY</span><h2>{selectedProject.name}</h2><p>{selectedProject.description}</p></div>
      <span className="status-label">{selectedProject.status}</span>
    </div>
    <div className="detail-body-grid">
      <div className="detail-main-column">
        <section className="detail-section"><h3>Overview</h3><p>{selectedProject.overview}</p></section>
        <section className="detail-section"><h3>Approach</h3><ol className="approach-list">{selectedProject.approach.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol></section>
        <section className="detail-section"><h3>Implementation notes</h3><ul className="bullet-notes">{selectedProject.engineeringNotes.map(note => <li key={note}>{note}</li>)}</ul></section>
      </div>
      <aside className="detail-side-column">
        <div className="detail-side-card"><span className="eyebrow">TECHNOLOGY</span><div className="tag-list">{selectedProject.stack.map(item => <span key={item}>{item}</span>)}</div></div>
        <div className="detail-side-card"><span className="eyebrow">PROJECT STATE</span><strong>{selectedProject.status}</strong><p>{selectedProject.note}</p></div>
        <div className="detail-links">
          <a href={selectedProject.github} target="_blank" rel="noreferrer"><GitHubMark size={16} /> Source repository <ArrowUpRight size={14} /></a>
          {selectedProject.live && <a href={selectedProject.live} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Live project <ArrowUpRight size={14} /></a>}
        </div>
      </aside>
    </div>
  </div>;

  return <div className="app-scroll projects-app">
    <SectionHeading eyebrow="PROJECT INDEX" title="Selected projects">
      <span className="result-count">{visibleProjects.length} projects</span>
    </SectionHeading>
    <p className="section-intro">A curated set of repositories with documented functionality and meaningful implementation. Older forks, empty repositories and unfinished placeholders are left out.</p>
    <label className="project-search"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by project, tool or technology" /></label>
    <div className="project-filters" role="group" aria-label="Filter projects by category">
      {categories.map(item => <button type="button" key={item} className={category === item ? 'filter-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
    </div>
    <div className="project-grid">
      {visibleProjects.map(project => <ProjectCard key={project.id} project={project} onOpen={() => setSelectedProjectId(project.id)} />)}
      {visibleProjects.length === 0 && <div className="empty-state">No projects match this search.</div>}
    </div>
    <p className="content-footnote">Project descriptions are based on each repository's documentation. Prototype status is shown where the repository does not describe a production deployment.</p>
  </div>;
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return <article className="project-card">
    <div className="project-card-top"><span className="project-category">{project.category}</span><span className="project-language">{project.language}</span></div>
    <h3>{project.name}</h3>
    <p>{project.description}</p>
    <div className="tag-list compact-tags">{project.stack.slice(0, 4).map(item => <span key={item}>{item}</span>)}{project.stack.length > 4 && <span>+{project.stack.length - 4}</span>}</div>
    <div className="project-card-bottom"><span className="status-text">{project.status}</span><button type="button" onClick={onOpen}>Case study <ArrowUpRight size={14} /></button></div>
  </article>;
}

function AboutApp({ openApp }: { openApp: (id: AppId) => void }) {
  return <div className="app-scroll about-app">
    <SectionHeading eyebrow="PROFILE" title="About Atharv" />
    <div className="about-intro">
      <div className="about-monogram"><img src="/brand/poserion-mark.png" alt="" /></div>
      <div><h3>Atharv Pose</h3><p>Information Technology student at Ratan Tata Maharashtra State Skills University.</p><span className="about-location">Mumbai Metropolitan Region, India</span></div>
    </div>
    <div className="about-columns">
      <section className="info-panel"><h3>How I work</h3><p>I learn by building and testing things. I like projects that require me to understand the whole system, from the interface to data flow, deployment and the environment it runs in.</p><p>I develop my projects independently and use AI tools as part of my workflow for research, iteration and debugging. I still care about understanding the implementation and its trade-offs.</p></section>
      <section className="info-panel"><h3>Education</h3><strong>{education.institution}</strong><p>{education.programme}</p><p>{education.period}</p><small>{education.location}</small></section>
    </div>
    <section className="about-areas"><span className="eyebrow">AREAS OF INTEREST</span><div className="interest-chip-list"><span>Cybersecurity</span><span>OSINT</span><span>Computer vision</span><span>Local-first AI</span><span>Embedded systems</span><span>Linux and servers</span><span>Game modding</span><span>Creative software</span></div></section>
    <div className="about-actions"><button type="button" className="button-primary" onClick={() => openApp('projects')}>Explore my work <ArrowRight size={15} /></button><button type="button" className="button-secondary" onClick={() => openApp('contact')}>Contact</button></div>
  </div>;
}

function ToolkitApp() {
  return <div className="app-scroll toolkit-app">
    <SectionHeading eyebrow="TOOLKIT" title="Technologies and tools" />
    <p className="section-intro">This is a working list of technologies I have used or explored in projects, hosting, troubleshooting and personal experiments. It is not a proficiency ranking.</p>
    <div className="toolkit-grid">
      {skillGroups.map((group, index) => <section className="toolkit-card" key={group.name}>
        <div className="toolkit-card-heading"><span className="toolkit-index">{String(index + 1).padStart(2, '0')}</span><h3>{group.name}</h3></div>
        <p>{group.intro}</p>
        <div className="tag-list">{group.items.map(item => <span key={item}>{item}</span>)}</div>
      </section>)}
    </div>
  </div>;
}

function CredentialsApp() {
  return <div className="app-scroll credentials-app">
    <SectionHeading eyebrow="LEARNING RECORD" title="Credentials and milestones" />
    <p className="section-intro">Certificates listed on my LinkedIn profile. Physical event certificates and award photographs are not hosted here unless a public verification link is available.</p>
    <div className="credential-list">
      {certificates.map((certificate, index) => <article className="credential-card" key={certificate.name}>
        <span className="credential-index">{String(index + 1).padStart(2, '0')}</span>
        <div><h3>{certificate.name}</h3><p>{certificate.issuer}</p><small>{certificate.category}</small></div>
      </article>)}
    </div>
    <SectionHeading eyebrow="EVENTS" title="Hackathons and participation" />
    <div className="milestone-list">
      {milestones.map(item => <article className="milestone-card" key={item.title}><span>{item.date}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div></article>)}
    </div>
    <a className="profile-reference" href="https://www.linkedin.com/in/atharv-pose" target="_blank" rel="noreferrer"><LinkedInMark /> Open LinkedIn profile <ArrowUpRight size={14} /></a>
  </div>;
}

function LinkedInMark() { return <span className="linkedin-mark" aria-hidden="true">in</span>; }

function TerminalApp({ openApp, preferences, setPreferences }: { openApp: (id: AppId) => void; preferences: Preferences; setPreferences: (preferences: Preferences) => void }) {
  type Line = { kind: 'input' | 'output' | 'muted'; text: string };
  const [lines, setLines] = useState<Line[]>([
    { kind: 'muted', text: 'PoserionOS portfolio shell' },
    { kind: 'muted', text: 'This terminal runs portfolio shortcuts only. It does not access the visitor device.' },
    { kind: 'output', text: 'Type help to list the available commands.' }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' }); }, [lines]);

  const execute = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const [command, ...args] = trimmed.toLowerCase().split(/\s+/);
    const output = (text: string) => setLines(current => [...current, { kind: 'input', text: `atharv@poserion:~$ ${trimmed}` }, { kind: 'output', text }]);
    if (command === 'clear') { setLines([]); return; }
    if (command === 'help') output('whoami | projects | skills | socials | theme kali|nord | open <app> | date | clear');
    else if (command === 'whoami') output('Atharv Pose\nB.Tech Information Technology\nIndependent developer, cybersecurity and OSINT enthusiast.');
    else if (command === 'projects' || command === 'ls') output(projects.map(project => `${project.id.padEnd(18)} ${project.name}`).join('\n'));
    else if (command === 'skills') output(skillGroups.map(group => `${group.name}: ${group.items.slice(0, 8).join(', ')}`).join('\n'));
    else if (command === 'socials') output(`GitHub: ${contact.github}\nLinkedIn: ${contact.linkedin}\nEmail: ${contact.email}`);
    else if (command === 'date') output(new Date().toString());
    else if (command === 'theme') {
      const next = args[0] === 'nord' ? 'nord' : args[0] === 'kali' ? 'kali' : null;
      if (!next) output('Usage: theme kali | theme nord');
      else { setPreferences({ ...preferences, theme: next }); output(`Theme changed to ${next}.`); }
    }
    else if (command === 'open') {
      const name = args.join(' ');
      const match = (Object.keys(appMeta) as AppId[]).find(id => id === name || appMeta[id].short.toLowerCase() === name || appMeta[id].title.toLowerCase() === name);
      if (match) { output(`Opening ${appMeta[match].title}.`); openApp(match); }
      else output(`No application named "${name}". Type help to see available commands.`);
    }
    else output(`Command not found: ${command}. Type help for available commands.`);
    setLines(current => current.slice(-90));
  };

  return <div className="terminal-app">
    <div className="terminal-toolbar"><span><span className="terminal-prompt-dot" /> atharv@poserion</span><span>PORTFOLIO SHELL</span></div>
    <div className="terminal-output" onClick={() => document.getElementById('terminal-input')?.focus()}>
      {lines.map((line, index) => <pre key={`${index}-${line.text}`} className={`terminal-line terminal-${line.kind}`}>{line.text}</pre>)}
      <form className="terminal-form" onSubmit={event => { event.preventDefault(); execute(input); setInput(''); }}>
        <span className="terminal-prompt">atharv@poserion:~$</span>
        <input id="terminal-input" value={input} onChange={event => setInput(event.target.value)} spellCheck={false} autoComplete="off" aria-label="Portfolio terminal command" />
      </form>
      <div ref={endRef} />
    </div>
    <div className="terminal-footer"><span>LOCAL PORTFOLIO COMMANDS</span><span>CTRL + ALT + T</span></div>
  </div>;
}

function PlacesApp({ openApp }: { openApp: (id: AppId) => void }) {
  const locations: Array<{ id: AppId; name: string; path: string; description: string; icon: LucideIcon }> = [
    { id: 'home', name: 'Home', path: '/home/atharv', description: 'Workspace overview and recent work.', icon: Home },
    { id: 'projects', name: 'Projects', path: '/home/atharv/Projects', description: 'Selected repositories and case studies.', icon: FolderOpen },
    { id: 'toolkit', name: 'Toolkit', path: '/home/atharv/Toolkit', description: 'Languages, frameworks and tools.', icon: Code2 },
    { id: 'credentials', name: 'Credentials', path: '/home/atharv/Credentials', description: 'Certificates and event milestones.', icon: Award },
    { id: 'lab', name: 'Lab Notes', path: '/home/atharv/Lab', description: 'Hardware, game hosting and creative work.', icon: Cpu },
    { id: 'about', name: 'About', path: '/home/atharv/About', description: 'Profile and education.', icon: UserRound }
  ];
  const [activePlace, setActivePlace] = useState<AppId>('home');
  const active = locations.find(item => item.id === activePlace) ?? locations[0];
  return <div className="places-app">
    <div className="places-pathbar"><span><Folder size={14} /> {active.path}</span><small>LOCAL PORTFOLIO INDEX</small></div>
    <div className="places-layout">
      <aside className="places-sidebar" aria-label="Places navigation">
        <span className="eyebrow">PLACES</span>
        {locations.map(location => {
          const Icon = location.icon;
          return <button key={location.id} type="button" className={activePlace === location.id ? 'place-active' : ''} onClick={() => setActivePlace(location.id)}><Icon size={15} /><span>{location.name}</span></button>;
        })}
        <div className="places-sidebar-footer"><span>LOCATION</span><strong>This browser</strong><small>No server-side settings</small></div>
      </aside>
      <div className="places-main">
        <div className="places-main-heading"><div><span className="eyebrow">DIRECTORY</span><h2>{active.name}</h2></div><small>{activePlace === 'home' ? `${locations.length - 1} locations` : '1 location'}</small></div>
        {activePlace === 'home' ? <div className="places-grid">
          {locations.filter(item => item.id !== 'home').map(location => {
            const Icon = location.icon;
            return <button type="button" className="place-folder-card" key={location.id} onClick={() => setActivePlace(location.id)}>
              <Icon size={25} /><strong>{location.name}</strong><small>{location.description}</small><code>{location.path}</code>
            </button>;
          })}
        </div> : <div className="places-selected">
          <div className="places-file-row"><span className="file-row-icon"><active.icon size={21} /></span><div><strong>{active.name}</strong><small>{active.description}</small></div><button type="button" onClick={() => openApp(activePlace)}>Open <ArrowUpRight size={14} /></button></div>
          <p className="places-note">Select Open to launch this application in its own window.</p>
        </div>}
      </div>
    </div>
  </div>;
}

function SettingsApp({ preferences, updatePreference, resetPreferences }: {
  preferences: Preferences;
  updatePreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  resetPreferences: () => void;
}) {
  const [section, setSection] = useState<'appearance' | 'desktop' | 'about'>('appearance');
  return <div className="settings-app">
    <aside className="settings-sidebar">
      <span className="eyebrow">SETTINGS</span>
      <button type="button" className={section === 'appearance' ? 'settings-nav-active' : ''} onClick={() => setSection('appearance')}><Palette size={16} /> Appearance</button>
      <button type="button" className={section === 'desktop' ? 'settings-nav-active' : ''} onClick={() => setSection('desktop')}><Monitor size={16} /> Desktop</button>
      <button type="button" className={section === 'about' ? 'settings-nav-active' : ''} onClick={() => setSection('about')}><Info size={16} /> About device</button>
      <div className="settings-sidebar-footer"><small>Preferences are stored locally in this browser.</small></div>
    </aside>
    <div className="settings-content">
      {section === 'appearance' && <>
        <SectionHeading eyebrow="PERSONALIZATION" title="Appearance" />
        <div className="settings-section"><div className="settings-section-heading"><div><h3>Color theme</h3><p>Choose the interface palette used by windows and controls.</p></div><Palette size={17} /></div>
          <div className="theme-choice-grid">
            <button type="button" className={`theme-choice theme-choice-kali ${preferences.theme === 'kali' ? 'choice-selected' : ''}`} onClick={() => updatePreference('theme', 'kali')}><span className="theme-swatch"><i /><i /><i /></span><strong>Kali Blue</strong><small>Deep blue surfaces and clear cyan accents</small>{preferences.theme === 'kali' && <Check size={16} />}</button>
            <button type="button" className={`theme-choice theme-choice-nord ${preferences.theme === 'nord' ? 'choice-selected' : ''}`} onClick={() => updatePreference('theme', 'nord')}><span className="theme-swatch"><i /><i /><i /></span><strong>Nord</strong><small>Muted blue-grey and ice accents</small>{preferences.theme === 'nord' && <Check size={16} />}</button>
          </div>
        </div>
        <div className="settings-section"><div className="settings-section-heading"><div><h3>Accent colour</h3><p>Change selection states and active controls.</p></div><Zap size={17} /></div>
          <div className="accent-options">
            <button type="button" className={`accent-choice accent-blue ${preferences.accent === 'blue' ? 'accent-selected' : ''}`} onClick={() => updatePreference('accent', 'blue')}><span />Blue</button>
            <button type="button" className={`accent-choice accent-cyan ${preferences.accent === 'cyan' ? 'accent-selected' : ''}`} onClick={() => updatePreference('accent', 'cyan')}><span />Cyan</button>
            <button type="button" className={`accent-choice accent-violet ${preferences.accent === 'violet' ? 'accent-selected' : ''}`} onClick={() => updatePreference('accent', 'violet')}><span />Violet</button>
          </div>
        </div>
      </>}
      {section === 'desktop' && <>
        <SectionHeading eyebrow="DESKTOP" title="Wallpaper and layout" />
        <div className="settings-section"><div className="settings-section-heading"><div><h3>Wallpaper library</h3><p>Images are bundled with the site. Your selection stays in this browser.</p></div><Laptop size={17} /></div>
          <div className="wallpaper-grid">
            {wallpaperLibrary.map(item => <button type="button" className={`wallpaper-option ${preferences.wallpaper === item.id ? 'wallpaper-selected' : ''}`} key={item.id} onClick={() => updatePreference('wallpaper', item.id)}>
              <img src={item.file} alt="" loading="lazy" /><span className="wallpaper-option-label"><strong>{item.name}</strong><small>{item.description}</small></span>{preferences.wallpaper === item.id && <span className="wallpaper-check"><Check size={14} /></span>}
            </button>)}
          </div>
        </div>
        <div className="settings-section"><div className="settings-section-heading"><div><h3>Desktop elements</h3><p>Keep only the shortcuts and widgets you use.</p></div><PanelLeft size={17} /></div>
          <ToggleRow label="Information widgets" detail="Show the local clock and current focus cards." checked={preferences.showWidgets} onChange={value => updatePreference('showWidgets', value)} />
          <ToggleRow label="Desktop shortcuts" detail="Show quick links for Projects, About and Terminal." checked={preferences.showShortcuts} onChange={value => updatePreference('showShortcuts', value)} />
          <ToggleRow label="Reduce motion" detail="Limit interface transitions and animated feedback." checked={preferences.reduceMotion} onChange={value => updatePreference('reduceMotion', value)} />
        </div>
      </>}
      {section === 'about' && <DeviceApp compact />}
      <div className="settings-footer"><span>Saved in this browser only. No account or server sync.</span><button type="button" className="button-secondary" onClick={resetPreferences}><RotateCcw size={14} /> Reset to defaults</button></div>
    </div>
  </div>;
}

function ToggleRow({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="toggle-row"><span><strong>{label}</strong><small>{detail}</small></span><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} /><i aria-hidden="true" /></label>;
}

function ContactApp() {
  const links = [
    { name: 'Email', value: contact.email, href: `mailto:${contact.email}`, icon: Mail, detail: 'Direct email' },
    { name: 'GitHub', value: 'github.com/Atharv3142M', href: contact.github, icon: GitHubMark, detail: 'Code and project repositories' },
    { name: 'LinkedIn', value: 'linkedin.com/in/atharv-pose', href: contact.linkedin, icon: UserRound, detail: 'Professional profile and certificates' },
    { name: 'Holopin', value: 'holopin.io/@atharv3142m', href: contact.holopin, icon: Award, detail: 'Community badges' }
  ];
  return <div className="app-scroll contact-app">
    <SectionHeading eyebrow="CONTACT" title="Start a conversation" />
    <p className="section-intro">For project discussions, collaboration, technical conversations or opportunities, use one of the links below.</p>
    <div className="contact-list">
      {links.map(item => { const Icon = item.icon; return <a className="contact-link" key={item.name} href={item.href} target={item.name === 'Email' ? undefined : '_blank'} rel={item.name === 'Email' ? undefined : 'noreferrer'}>
        <span className="contact-icon"><Icon size={19} /></span><span className="contact-copy"><strong>{item.name}</strong><small>{item.value}</small><em>{item.detail}</em></span><ArrowUpRight size={16} />
      </a>; })}
    </div>
    <div className="contact-note"><span className="contact-note-icon"><Info size={16} /></span><p>I do not publish a personal photograph. The PoserionOS mark is used as the visual identity for this workspace.</p></div>
  </div>;
}

function LabApp() {
  const cards = [
    { icon: Cpu, label: 'EMBEDDED AND HARDWARE', title: 'ApexZero exploration', text: 'Researching a low-cost portable electronics and security multi-tool. Current interests include ESP32 boards, displays, firmware and practical component selection.', state: 'Early hardware research' },
    { icon: HardDrive, label: 'SYSTEMS AND HOSTING', title: 'Servers and environments', text: 'Setting up Minecraft servers, configuring hosting environments, troubleshooting Windows and Linux systems, and learning how services behave under real use.', state: 'Hands-on experiments' },
    { icon: Gamepad2, label: 'GAMES AND MODDING', title: 'Minecraft and game systems', text: 'Minecraft modding, server configuration and game-related tooling. I enjoy understanding how the pieces fit together, not only playing the game.', state: 'Personal interest' },
    { icon: Clapperboard, label: 'CREATIVE SOFTWARE', title: 'Editing and visual work', text: 'Using video editors, image tools and 3D software for personal projects. FFmpeg is part of the workflow for media processing and automation.', state: 'Creative experiments' }
  ];
  return <div className="app-scroll lab-app">
    <SectionHeading eyebrow="WORKBENCH" title="Lab notes" />
    <p className="section-intro">Not every experiment becomes a public repository. These are the practical areas that influence how I approach technical work.</p>
    <div className="lab-grid">{cards.map(card => { const Icon = card.icon; return <article className="lab-card" key={card.title}><span className="lab-icon"><Icon size={19} /></span><span className="eyebrow">{card.label}</span><h3>{card.title}</h3><p>{card.text}</p><small>{card.state}</small></article>; })}</div>
  </div>;
}

function DeviceApp({ compact = false }: { compact?: boolean }) {
  const info = [
    ['Workspace', 'PoserionOS portfolio'],
    ['Runtime', 'Browser-based interface'],
    ['Preferences', 'Stored in localStorage'],
    ['Network services', 'No portfolio backend'],
    ['Analytics', 'No visitor analytics configured'],
    ['Profile image', 'Not used']
  ];
  return <div className={`app-scroll device-app ${compact ? 'device-app-compact' : ''}`}>
    {!compact && <SectionHeading eyebrow="SYSTEM INFORMATION" title="About this device" />}
    <div className="device-identity"><img src="/brand/poserion-mark.png" alt="" /><div><strong>PoserionOS</strong><span>Personal portfolio environment</span></div></div>
    <div className="device-info-grid">{info.map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
    <div className="device-privacy"><ShieldCheck size={17} /><p>Theme, wallpaper and display preferences are saved on this device. The site does not sync those preferences to a server.</p></div>
    {!compact && <p className="device-note">PoserionOS is an interactive portfolio interface running in a browser. It does not execute shell commands or inspect private device telemetry.</p>}
  </div>;
}

export default App;
