import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity, ArrowUpRight, Award, Check, ChevronDown, ChevronRight, Clock3,
  Code2, Command, Cpu, ExternalLink, Folder, FolderOpen, Github, Globe2,
  Grid2X2, HardDrive, Info, Laptop, Layers, Linkedin, Mail, Maximize2, Minus,
  Moon, Palette, Power, Search, Settings, Shield, Sparkles, Sun, Terminal,
  UserRound, Volume2, Wifi, X, Zap, Gamepad2, Clapperboard, type LucideIcon
} from 'lucide-react';
import {
  certificates, contact, education, projects, skillGroups,
  type Project
} from './data';

type Theme = 'kali' | 'nord';
type Wallpaper = 'railway' | 'nord-dusk' | 'kali-grid';
type AppId = 'welcome' | 'projects' | 'about' | 'skills' | 'certificates' | 'terminal' | 'settings' | 'contact' | 'files' | 'lab';
type WindowRecord = { id: AppId; x: number; y: number; w: number; h: number; z: number; minimized: boolean; maximized: boolean };
type DragState = { id: AppId; mode: 'move' | 'resize'; startX: number; startY: number; x: number; y: number; w: number; h: number };

const appMeta: Record<AppId, { title: string; icon: LucideIcon; short: string; subtitle: string }> = {
  welcome: { title: 'Welcome', icon: Laptop, short: 'Home', subtitle: 'PoserionOS workspace' },
  projects: { title: 'Projects', icon: FolderOpen, short: 'Projects', subtitle: 'Selected work and experiments' },
  about: { title: 'About Atharv', icon: UserRound, short: 'About', subtitle: 'Profile and background' },
  skills: { title: 'Toolkit', icon: Layers, short: 'Toolkit', subtitle: 'Tools, technologies and interests' },
  certificates: { title: 'Certificates & achievements', icon: Award, short: 'Credentials', subtitle: 'Learning and milestones' },
  terminal: { title: 'Terminal', icon: Terminal, short: 'Terminal', subtitle: 'A small portfolio shell' },
  settings: { title: 'Appearance', icon: Settings, short: 'Settings', subtitle: 'Personalize the workspace' },
  contact: { title: 'Contact', icon: Mail, short: 'Contact', subtitle: 'Open a conversation' },
  files: { title: 'Places', icon: Folder, short: 'Places', subtitle: 'A quick index of this workspace' },
  lab: { title: 'Lab notes', icon: Cpu, short: 'Lab', subtitle: 'Interests beyond the code editor' }
};

const appOrder: AppId[] = ['welcome', 'projects', 'about', 'skills', 'certificates', 'terminal', 'lab', 'files', 'settings', 'contact'];
const defaultSizes: Record<AppId, { w: number; h: number; x: number; y: number }> = {
  welcome: { w: 610, h: 385, x: 74, y: 78 },
  projects: { w: 940, h: 650, x: 90, y: 70 },
  about: { w: 760, h: 560, x: 130, y: 85 },
  skills: { w: 820, h: 590, x: 140, y: 86 },
  certificates: { w: 740, h: 560, x: 150, y: 90 },
  terminal: { w: 680, h: 470, x: 95, y: 102 },
  settings: { w: 720, h: 540, x: 160, y: 80 },
  contact: { w: 580, h: 450, x: 170, y: 110 },
  files: { w: 700, h: 500, x: 105, y: 100 },
  lab: { w: 720, h: 540, x: 135, y: 90 }
};

function readPreference<T extends string>(key: string, fallback: T, allowed: T[]): T {
  try {
    const saved = window.localStorage.getItem(key) as T | null;
    return saved && allowed.includes(saved) ? saved : fallback;
  } catch {
    return fallback;
  }
}

function ClockDisplay() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return <div className="panel-clock" aria-label="Local date and time">
    <span>{now.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })}</span>
    <strong>{now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</strong>
  </div>;
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => readPreference('poserion-theme', 'kali', ['kali', 'nord']));
  const [wallpaper, setWallpaper] = useState<Wallpaper>(() => readPreference('poserion-wallpaper', 'railway', ['railway', 'nord-dusk', 'kali-grid']));
  const [windows, setWindows] = useState<WindowRecord[]>([
    { id: 'welcome', ...defaultSizes.welcome, z: 10, minimized: false, maximized: false }
  ]);
  const [activeId, setActiveId] = useState<AppId>('welcome');
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [launcherQuery, setLauncherQuery] = useState('');
  const [notification, setNotification] = useState('');
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const dragRef = useRef<DragState | null>(null);
  const zRef = useRef(20);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('poserion-theme', theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem('poserion-wallpaper', wallpaper);
  }, [wallpaper]);

  const notify = useCallback((message: string) => {
    setNotification(message);
    window.setTimeout(() => setNotification(''), 2600);
  }, []);

  const openApp = useCallback((id: AppId) => {
    setWindows(current => {
      const existing = current.find(windowItem => windowItem.id === id);
      if (existing) {
        return current.map(windowItem => windowItem.id === id
          ? { ...windowItem, minimized: false, z: ++zRef.current }
          : windowItem);
      }
      const size = defaultSizes[id];
      return [...current, { id, ...size, z: ++zRef.current, minimized: false, maximized: false }];
    });
    setActiveId(id);
    setLauncherOpen(false);
  }, []);

  const closeApp = useCallback((id: AppId) => {
    setWindows(current => current.filter(windowItem => windowItem.id !== id));
    setActiveId(current => current === id ? 'welcome' : current);
  }, []);

  const minimizeApp = useCallback((id: AppId) => {
    setWindows(current => current.map(windowItem => windowItem.id === id ? { ...windowItem, minimized: true } : windowItem));
    setActiveId(current => current === id ? 'welcome' : current);
  }, []);

  const maximizeApp = useCallback((id: AppId) => {
    setWindows(current => current.map(windowItem => windowItem.id === id ? { ...windowItem, maximized: !windowItem.maximized, z: ++zRef.current } : windowItem));
    setActiveId(id);
  }, []);

  const focusApp = useCallback((id: AppId) => {
    setWindows(current => current.map(windowItem => windowItem.id === id ? { ...windowItem, z: ++zRef.current } : windowItem));
    setActiveId(id);
  }, []);

  const beginDrag = (event: ReactPointerEvent, id: AppId, mode: 'move' | 'resize') => {
    if (event.button !== 0 || (event.target as HTMLElement).closest('button')) return;
    const item = windows.find(windowItem => windowItem.id === id);
    if (!item || item.maximized) return;
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    dragRef.current = { id, mode, startX: event.clientX, startY: event.clientY, x: item.x, y: item.y, w: item.w, h: item.h };
    focusApp(id);
  };

  const moveDrag = (event: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    setWindows(current => current.map(item => {
      if (item.id !== drag.id) return item;
      if (drag.mode === 'move') {
        const x = Math.max(-item.w + 150, Math.min(window.innerWidth - 110, drag.x + dx));
        const y = Math.max(44, Math.min(window.innerHeight - 120, drag.y + dy));
        return { ...item, x, y };
      }
      return { ...item, w: Math.max(360, Math.min(window.innerWidth - item.x - 18, drag.w + dx)), h: Math.max(280, Math.min(window.innerHeight - item.y - 82, drag.h + dy)) };
    }));
  };

  const endDrag = () => { dragRef.current = null; };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && ['INPUT', 'TEXTAREA'].includes(target.tagName);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); setLauncherOpen(value => !value); setLauncherQuery('');
      }
      if (event.key === 'Escape') setLauncherOpen(false);
      if (!typing && event.altKey && /^[1-9]$/.test(event.key)) {
        const index = Number(event.key) - 1;
        const id = appOrder[index];
        if (id) openApp(id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openApp]);

  const launcherApps = useMemo(() => appOrder.filter(id => {
    const searchable = `${appMeta[id].title} ${appMeta[id].subtitle}`.toLowerCase();
    return searchable.includes(launcherQuery.toLowerCase());
  }), [launcherQuery]);

  const renderWindowContent = (id: AppId) => {
    switch (id) {
      case 'welcome': return <WelcomeApp openApp={openApp} />;
      case 'projects': return <ProjectsApp />;
      case 'about': return <AboutApp />;
      case 'skills': return <SkillsApp />;
      case 'certificates': return <CertificatesApp />;
      case 'terminal': return <TerminalApp openApp={openApp} setTheme={setTheme} notify={notify} />;
      case 'settings': return <SettingsApp theme={theme} setTheme={setTheme} wallpaper={wallpaper} setWallpaper={setWallpaper} />;
      case 'contact': return <ContactApp />;
      case 'files': return <FilesApp openApp={openApp} />;
      case 'lab': return <LabApp />;
    }
  };

  return <main className={`desktop theme-${theme} wallpaper-${wallpaper}`}>
    <div className="wallpaper-image" aria-hidden="true" />
    <div className="wallpaper-shade" aria-hidden="true" />
    <header className="top-panel">
      <button className="brand-button" onClick={() => setLauncherOpen(value => !value)} aria-label="Open application launcher">
        <img src="/brand/poserionos-mark.svg" alt="" />
        <span>PoserionOS</span>
        <span className="version-tag">4.0</span>
      </button>
      <div className="panel-divider" />
      <nav className="panel-nav" aria-label="Desktop actions">
        <button onClick={() => setLauncherOpen(value => !value)}><Grid2X2 size={15} /> <span>Applications</span></button>
        <button onClick={() => openApp('files')}><Folder size={15} /> <span>Places</span></button>
        <button onClick={() => openApp('terminal')}><Terminal size={15} /> <span>Terminal</span></button>
      </nav>
      <div className="panel-spacer" />
      <div className="panel-status">
        <button className="icon-button panel-theme-button" onClick={() => setTheme(value => value === 'kali' ? 'nord' : 'kali')} aria-label="Switch theme" title={`Switch to ${theme === 'kali' ? 'Nord' : 'Kali Blue'}`}>
          {theme === 'kali' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <button className="icon-button" onClick={() => openApp('settings')} aria-label="Appearance settings" title="Appearance settings"><Palette size={16} /></button>
        <div className="panel-system-icons" aria-label="Decorative desktop status icons"><Wifi size={15} /><Volume2 size={15} /></div>
        <ClockDisplay />
        <button className="power-button" onClick={() => openApp('about')} aria-label="About PoserionOS" title="About PoserionOS"><Power size={15} /></button>
      </div>
    </header>

    <aside className="desktop-shortcuts" aria-label="Desktop shortcuts">
      {(['projects', 'about', 'terminal', 'certificates'] as AppId[]).map(id => {
        const Icon = appMeta[id].icon;
        return <button className="desktop-shortcut" key={id} onClick={() => focusOrOpen(id, openApp, focusApp, windows)} title={`Open ${appMeta[id].title}`}>
          <span className="shortcut-icon"><Icon size={22} /></span>
          <span>{appMeta[id].short}</span>
        </button>;
      })}
    </aside>

    <section className="desktop-widgets" aria-label="Workspace information">
      <div className="widget widget-clock">
        <span className="widget-eyebrow"><Clock3 size={13} /> LOCAL TIME</span>
        <strong>{currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</strong>
        <span>{currentTime.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </div>
      <div className="widget widget-focus">
        <span className="widget-eyebrow"><Activity size={13} /> CURRENT FOCUS</span>
        <strong>Research. Build. Iterate.</strong>
        <div className="focus-tags"><span>OSINT</span><span>Computer vision</span><span>Hardware</span></div>
      </div>
    </section>

    <AnimatePresence>
      {windows.filter(item => !item.minimized).map(item => {
        const MetaIcon = appMeta[item.id].icon;
        return <motion.section
          key={item.id}
          className={`app-window ${activeId === item.id ? 'is-active' : ''} ${item.maximized ? 'is-maximized' : ''}`}
          style={{ left: item.x, top: item.y, width: item.w, height: item.h, zIndex: item.z }}
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 6 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          onPointerDown={() => focusApp(item.id)}
        >
          <div className="window-titlebar" onPointerDown={event => beginDrag(event, item.id, 'move')} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
            <div className="window-app-identity"><MetaIcon size={15} /><span>{appMeta[item.id].title}</span></div>
            <span className="window-subtitle">{appMeta[item.id].subtitle}</span>
            <div className="window-controls">
              <button onClick={() => minimizeApp(item.id)} aria-label="Minimize"><Minus size={14} /></button>
              <button onClick={() => maximizeApp(item.id)} aria-label={item.maximized ? 'Restore' : 'Maximize'}><Maximize2 size={12} /></button>
              <button className="close-window" onClick={() => closeApp(item.id)} aria-label="Close"><X size={14} /></button>
            </div>
          </div>
          <div className="window-content">{renderWindowContent(item.id)}</div>
          {!item.maximized && <div className="resize-grip" onPointerDown={event => beginDrag(event, item.id, 'resize')} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} aria-label="Resize window" />}
        </motion.section>;
      })}
    </AnimatePresence>

    <AnimatePresence>
      {launcherOpen && <>
        <motion.button className="launcher-backdrop" aria-label="Close launcher" onClick={() => setLauncherOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        <motion.section className="launcher-menu" initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}>
          <div className="launcher-heading"><div><span className="launcher-label">POSERIONOS</span><strong>Applications</strong></div><span className="launcher-shortcut"><Command size={12} /> K</span></div>
          <label className="launcher-search"><Search size={16} /><input value={launcherQuery} onChange={event => setLauncherQuery(event.target.value)} placeholder="Search applications..." autoFocus /></label>
          <div className="launcher-grid">
            {launcherApps.length ? launcherApps.map(id => {
              const Icon = appMeta[id].icon;
              return <button key={id} onClick={() => openApp(id)} className="launcher-app"><span><Icon size={20} /></span><strong>{appMeta[id].title}</strong><small>{appMeta[id].subtitle}</small></button>;
            }) : <p className="empty-state">No application found.</p>}
          </div>
          <div className="launcher-footer"><span>Atharv Pose</span><button onClick={() => openApp('settings')}><Settings size={14} /> Settings</button></div>
        </motion.section>
      </>}
    </AnimatePresence>

    <footer className="dock-wrap" aria-label="Application dock">
      <div className="dock">
        {(['welcome', 'projects', 'terminal', 'about', 'skills', 'certificates', 'settings', 'contact'] as AppId[]).map((id, index) => {
          const Icon = appMeta[id].icon;
          const isOpen = windows.some(item => item.id === id);
          const isVisible = windows.some(item => item.id === id && !item.minimized);
          return <div className="dock-slot" key={id}>
            {index === 2 || index === 6 ? <span className="dock-divider" /> : null}
            <button className={`dock-icon ${activeId === id && isVisible ? 'dock-selected' : ''}`} onClick={() => {
              const item = windows.find(win => win.id === id);
              if (item && !item.minimized && activeId === id) minimizeApp(id);
              else openApp(id);
            }} aria-label={`Open ${appMeta[id].title}`} title={appMeta[id].title}>
              <Icon size={21} strokeWidth={1.7} />
              {isOpen && <span className={`dock-dot ${isVisible ? 'visible' : ''}`} />}
            </button>
          </div>;
        })}
        <span className="dock-divider" />
        <button className="dock-icon dock-launcher" onClick={() => setLauncherOpen(value => !value)} aria-label="Open applications"><Grid2X2 size={20} /></button>
      </div>
      <span className="dock-caption">POSERIONOS WORKSPACE</span>
    </footer>

    <AnimatePresence>
      {notification && <motion.div className="toast" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><Check size={15} />{notification}</motion.div>}
    </AnimatePresence>

    <div className="mobile-hint"><span>PoserionOS</span><button onClick={() => setLauncherOpen(true)}><Grid2X2 size={17} /> Apps</button></div>
  </main>;
}

function focusOrOpen(id: AppId, openApp: (id: AppId) => void, focusApp: (id: AppId) => void, windows: WindowRecord[]) {
  if (windows.some(item => item.id === id && !item.minimized)) focusApp(id);
  else openApp(id);
}

function WindowSection({ title, eyebrow, children, action }: { title: string; eyebrow?: string; children: ReactNode; action?: ReactNode }) {
  return <section className="content-section">
    <div className="section-heading"><div>{eyebrow && <span className="section-eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{action}</div>
    {children}
  </section>;
}

function WelcomeApp({ openApp }: { openApp: (id: AppId) => void }) {
  return <div className="welcome-content">
    <div className="welcome-copy">
      <div className="welcome-overline"><span className="status-pip" /> PORTFOLIO WORKSPACE <span className="welcome-version">VERSION 4.0</span></div>
      <h1>Hi, I'm <span>Atharv Pose.</span></h1>
      <p className="welcome-role">IT undergraduate · Developer · Cybersecurity enthusiast</p>
      <p className="welcome-description">I build practical software, investigate how systems work and experiment across code, hardware and creative technology.</p>
      <div className="terminal-inline"><span>atharv@poserion:~$</span> whoami <i /></div>
      <div className="welcome-actions">
        <button className="primary-action" onClick={() => openApp('projects')}><FolderOpen size={15} /> Explore projects <ArrowUpRight size={14} /></button>
        <button className="secondary-action" onClick={() => openApp('about')}><UserRound size={15} /> About me</button>
      </div>
    </div>
    <div className="welcome-side">
      <div className="profile-mark"><img src="/brand/poserionos-mark.svg" alt="PoserionOS mark" /></div>
      <span className="side-label">CURRENTLY EXPLORING</span>
      <div className="interest-list"><span>Open-source intelligence</span><span>Computer vision</span><span>Embedded systems</span></div>
      <button className="text-link" onClick={() => openApp('terminal')}>Open terminal <ChevronRight size={14} /></button>
    </div>
  </div>;
}

function ProjectsApp() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const categories = ['All', 'Security', 'AI & Data', 'Spatial Computing', 'Systems', 'Web', 'Experiments'];
  const visible = projects.filter(project => {
    const matchesCategory = category === 'All' || project.category === category;
    const text = `${project.name} ${project.description} ${project.stack.join(' ')}`.toLowerCase();
    return matchesCategory && text.includes(query.toLowerCase());
  });
  return <div className="projects-app app-scroll">
    <WindowSection title="Selected work" eyebrow="PROJECT INDEX" action={<span className="result-count">{visible.length} PROJECTS</span>}>
      <p className="section-intro">Independent builds and experiments across security, AI, spatial computing and software. AI tools assist parts of the workflow; the project direction, decisions and integration are mine.</p>
      <label className="project-search"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search projects, tools or topics" /></label>
      <div className="filter-row">{categories.map(item => <button key={item} className={category === item ? 'filter-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="project-grid">
        {visible.map(project => <ProjectCard key={project.id} project={project} expanded={expanded === project.id} onToggle={() => setExpanded(expanded === project.id ? null : project.id)} />)}
      </div>
      {!visible.length && <div className="empty-state">No projects match that search. Try another term or category.</div>}
    </WindowSection>
  </div>;
}

function ProjectCard({ project, expanded, onToggle }: { project: Project; expanded: boolean; onToggle: () => void }) {
  const iconByCategory: Record<Project['category'], LucideIcon> = { Security: Shield, 'AI & Data': Sparkles, 'Spatial Computing': Globe2, Systems: Cpu, Web: Code2, Experiments: Zap };
  const Icon = iconByCategory[project.category];
  return <article className={`project-card ${expanded ? 'project-expanded' : ''}`}>
    <div className="project-topline"><span className="project-icon"><Icon size={18} /></span><span className={`project-status status-${project.status.toLowerCase()}`}>{project.status}</span></div>
    <div className="project-category">{project.category.toUpperCase()}</div>
    <h3>{project.name}</h3>
    <p>{project.description}</p>
    <div className="stack-tags">{project.stack.slice(0, expanded ? 10 : 4).map(item => <span key={item}>{item}</span>)}</div>
    {expanded && project.note && <p className="project-note">{project.note}</p>}
    <div className="project-actions">
      <a href={project.github} target="_blank" rel="noreferrer">Source code <ExternalLink size={13} /></a>
      {project.live && <a href={project.live} target="_blank" rel="noreferrer">Live demo <ArrowUpRight size={13} /></a>}
      <button onClick={onToggle}>{expanded ? 'Less' : 'Details'} <ChevronDown size={13} className={expanded ? 'rotate-chevron' : ''} /></button>
    </div>
  </article>;
}

function AboutApp() {
  return <div className="app-scroll about-app">
    <WindowSection title="A little context" eyebrow="WHOAMI">
      <div className="about-lead"><div className="about-monogram">AP</div><div><h3>Atharv Pose</h3><p>Developer in progress. Systems curious by default.</p><span className="subtle-line">Mumbai Metropolitan Region, India</span></div></div>
      <p className="body-copy">I'm an Information Technology undergraduate at Ratan Tata Maharashtra State Skills University. I learn best by building things, debugging them and understanding what happens below the surface.</p>
      <p className="body-copy">My work moves between software engineering, cybersecurity and OSINT, AI-assisted tools, computer vision, hardware experiments and creative applications. I enjoy practical problems more than technology for its own sake.</p>
      <div className="quote-panel"><span>WORKING PRINCIPLE</span><strong>Use the tool. Understand the system. Improve the result.</strong></div>
    </WindowSection>
    <WindowSection title="Education" eyebrow="BACKGROUND">
      <div className="timeline-card"><span className="timeline-point" /><div><strong>{education.program}</strong><p>{education.institution}</p><span>{education.period} · {education.location}</span></div></div>
    </WindowSection>
    <WindowSection title="Outside the code editor" eyebrow="INTERESTS">
      <div className="interest-cards">
        <InterestCard icon={Shield} title="Security & OSINT" text="Learning how systems expose information, how digital footprints connect, and how to research responsibly." />
        <InterestCard icon={Gamepad2} title="Games & modding" text="Gaming, Minecraft server hosting, configuration and modding. I enjoy the systems behind the experience." />
        <InterestCard icon={Cpu} title="Hardware" text="Microcontrollers, low-cost electronics, firmware research and building practical devices." />
        <InterestCard icon={Clapperboard} title="Creative tools" text="Video editing, visual effects, image work and 3D tools as another form of problem solving." />
      </div>
    </WindowSection>
  </div>;
}

function InterestCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return <article className="interest-card"><Icon size={18} /><strong>{title}</strong><p>{text}</p></article>;
}

function SkillsApp() {
  return <div className="app-scroll skills-app">
    <WindowSection title="Tools I work with" eyebrow="TOOLKIT">
      <p className="section-intro">A practical snapshot of technologies used across projects, experiments and personal setups. This is not a proficiency ranking.</p>
      <div className="skill-groups">
        {skillGroups.map((group, index) => <section key={group.name} className="skill-group"><div className="skill-group-heading"><span className="skill-index">0{index + 1}</span><h3>{group.name}</h3><span className="skill-count">{group.items.length} ITEMS</span></div><div className="skill-pills">{group.items.map(item => <span key={item}>{item}</span>)}</div></section>)}
      </div>
      <div className="learning-note"><Info size={16} /><p>Some entries are used in active projects, while others come from personal experiments or current learning. The project cards show where specific tools are used.</p></div>
    </WindowSection>
  </div>;
}

function CertificatesApp() {
  return <div className="app-scroll credentials-app">
    <WindowSection title="Learning record" eyebrow="CERTIFICATES">
      <p className="section-intro">Selected courses and verified certificates listed on my LinkedIn profile. Credential details and issuer records should be checked at the source.</p>
      <div className="certificate-list">{certificates.map((certificate, index) => <article className="certificate-row" key={certificate.name}><span className="certificate-index">{String(index + 1).padStart(2, '0')}</span><div><strong>{certificate.name}</strong><span>{certificate.issuer}</span></div><Award size={17} /></article>)}</div>
      <a className="external-credential" href={`${contact.linkedin}/details/certifications/`} target="_blank" rel="noreferrer">View LinkedIn certifications <ArrowUpRight size={14} /></a>
    </WindowSection>
    <WindowSection title="Events & milestones" eyebrow="PARTICIPATION">
      <div className="milestone-card"><span className="milestone-label">1ST PRIZE</span><div><strong>RTMSSU Foundation Day Week Hackathon 2026</strong><p>Hackathon recognition. Physical award documentation is not embedded in this site yet.</p></div></div>
      <div className="milestone-card"><span className="milestone-label">PARTICIPANT</span><div><strong>AMD Slingshot Campus Ideathon 2026</strong><p>Campus ideation event.</p></div></div>
      <div className="milestone-card"><span className="milestone-label">PARTICIPANT</span><div><strong>Bharatiya Antariksh Hackathon 2026</strong><p>Space and technology focused hackathon.</p></div></div>
    </WindowSection>
  </div>;
}

function TerminalApp({ openApp, setTheme, notify }: { openApp: (id: AppId) => void; setTheme: (theme: Theme) => void; notify: (message: string) => void }) {
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<Array<{ type: 'command' | 'output' | 'error'; text: string }>>([
    { type: 'output', text: 'PoserionOS shell 4.0. Type help to see available commands.' },
    { type: 'output', text: 'This is a portfolio interface, not a real system terminal.' }
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);

  const execute = (raw: string) => {
    const command = raw.trim();
    if (!command) return;
    const [base, arg] = command.toLowerCase().split(/\s+/, 2);
    const out = (text: string, type: 'output' | 'error' = 'output') => setLines(current => [...current, { type, text }]);
    setLines(current => [...current, { type: 'command', text: command }]);
    switch (base) {
      case 'help': out('whoami  about  projects  skills  certificates  contact  open <app>  theme <kali|nord>  clear'); break;
      case 'whoami': out('Atharv Pose | B.Tech IT undergraduate | Developer | Cybersecurity and OSINT enthusiast'); break;
      case 'about': openApp('about'); out('Opening profile...'); break;
      case 'projects': openApp('projects'); out(`${projects.length} selected projects indexed. Opening project explorer...`); break;
      case 'skills': openApp('skills'); out('Opening toolkit...'); break;
      case 'certificates': case 'certs': openApp('certificates'); out('Opening learning record...'); break;
      case 'contact': openApp('contact'); out('Opening contact panel...'); break;
      case 'open': {
        const map: Record<string, AppId> = { welcome: 'welcome', home: 'welcome', projects: 'projects', about: 'about', skills: 'skills', certificates: 'certificates', certs: 'certificates', settings: 'settings', contact: 'contact', files: 'files', lab: 'lab' };
        if (arg && map[arg]) { openApp(map[arg]); out(`Opening ${map[arg]}...`); }
        else out('Available apps: welcome, projects, about, skills, certificates, settings, contact, files, lab', 'error');
        break;
      }
      case 'theme':
        if (arg === 'kali' || arg === 'nord') { setTheme(arg); out(`Theme changed to ${arg}.`); notify(`${arg === 'kali' ? 'Kali Blue' : 'Nord'} theme applied`); }
        else out('Usage: theme kali | theme nord', 'error');
        break;
      case 'clear': setLines([]); return;
      case 'sudo': out('This portfolio shell does not provide system access.', 'error'); break;
      case 'ls': out('about/  projects/  toolkit/  certificates/  contact/  lab-notes/'); break;
      case 'pwd': out('/home/atharv/portfolio'); break;
      case 'date': out(new Date().toString()); break;
      case 'exit': out('There is no underlying shell session to exit.'); break;
      default: out(`Command not found: ${base}. Type help for available commands.`, 'error');
    }
  };

  return <div className="terminal-app">
    <div className="terminal-toolbar"><span className="terminal-leds"><i /><i /><i /></span><span>atharv@poserion: ~</span><span className="terminal-toolbar-right">PORTFOLIO SHELL</span></div>
    <div className="terminal-screen" onClick={() => document.getElementById('terminal-command')?.focus()}>
      <div className="terminal-ascii"> <span>┌──────────────────────────────────────────┐</span>{'\n'} <span>│ POSERIONOS 4.0  /  ATHARV POSE           │</span>{'\n'} <span>└──────────────────────────────────────────┘</span></div>
      {lines.map((line, index) => <div className={`terminal-line terminal-${line.type}`} key={`${index}-${line.text}`}>{line.type === 'command' ? <><b>atharv@poserion:~$</b> {line.text}</> : line.text}</div>)}
      <div className="terminal-input-line"><b>atharv@poserion:~$</b><form onSubmit={event => { event.preventDefault(); execute(input); setInput(''); }}><input id="terminal-command" value={input} onChange={event => setInput(event.target.value)} spellCheck={false} autoComplete="off" aria-label="Terminal command" placeholder="type help" /></form><span className="terminal-cursor" /></div>
      <div ref={endRef} />
    </div>
    <div className="terminal-footer"><span>LOCAL INTERFACE</span><span>CTRL + K TO OPEN APPS</span></div>
  </div>;
}

function SettingsApp({ theme, setTheme, wallpaper, setWallpaper }: { theme: Theme; setTheme: (theme: Theme) => void; wallpaper: Wallpaper; setWallpaper: (wallpaper: Wallpaper) => void }) {
  return <div className="app-scroll settings-app">
    <WindowSection title="Appearance" eyebrow="PERSONALIZATION">
      <div className="settings-block"><div className="settings-block-heading"><div><strong>Color scheme</strong><span>Switch between the two workspace palettes.</span></div><Palette size={18} /></div>
        <div className="theme-options">
          <button className={`theme-choice kali-choice ${theme === 'kali' ? 'theme-choice-active' : ''}`} onClick={() => setTheme('kali')}><span className="theme-swatch"><i /><i /><i /></span><strong>Kali Blue</strong><small>Deep navy with electric blue accents</small>{theme === 'kali' && <Check size={15} />}</button>
          <button className={`theme-choice nord-choice ${theme === 'nord' ? 'theme-choice-active' : ''}`} onClick={() => setTheme('nord')}><span className="theme-swatch"><i /><i /><i /></span><strong>Nord</strong><small>Muted blue-grey and ice accents</small>{theme === 'nord' && <Check size={15} />}</button>
        </div>
      </div>
      <div className="settings-block"><div className="settings-block-heading"><div><strong>Desktop wallpaper</strong><span>Your selected image is the default background.</span></div><Laptop size={18} /></div>
        <div className="wallpaper-options">
          <button className={`wallpaper-choice railway-preview ${wallpaper === 'railway' ? 'wallpaper-choice-active' : ''}`} onClick={() => setWallpaper('railway')}><span /><strong>Railway Crossing</strong><small>Selected image</small>{wallpaper === 'railway' && <Check size={14} />}</button>
          <button className={`wallpaper-choice nord-preview ${wallpaper === 'nord-dusk' ? 'wallpaper-choice-active' : ''}`} onClick={() => setWallpaper('nord-dusk')}><span /><strong>Nord Dusk</strong><small>Built-in gradient</small>{wallpaper === 'nord-dusk' && <Check size={14} />}</button>
          <button className={`wallpaper-choice kali-preview ${wallpaper === 'kali-grid' ? 'wallpaper-choice-active' : ''}`} onClick={() => setWallpaper('kali-grid')}><span /><strong>Kali Grid</strong><small>Built-in gradient</small>{wallpaper === 'kali-grid' && <Check size={14} />}</button>
        </div>
      </div>
      <p className="settings-footnote"><Info size={14} /> Appearance preferences are saved in this browser only.</p>
    </WindowSection>
  </div>;
}

function ContactApp() {
  const links = [
    { title: 'Email', value: contact.email, href: `mailto:${contact.email}`, icon: Mail, note: 'Best for direct enquiries' },
    { title: 'GitHub', value: 'github.com/Atharv3142M', href: contact.github, icon: Github, note: 'Code, experiments and repositories' },
    { title: 'LinkedIn', value: 'linkedin.com/in/atharv-pose', href: contact.linkedin, icon: Linkedin, note: 'Professional profile and credentials' },
    { title: 'Holopin', value: 'holopin.io/@atharv3142m', href: contact.holopin, icon: Award, note: 'Open-source and community badges' }
  ];
  return <div className="app-scroll contact-app">
    <WindowSection title="Start a conversation" eyebrow="CONTACT">
      <p className="section-intro">Have a project idea, a useful technical resource or an interesting problem to solve? Reach out through one of these channels.</p>
      <div className="contact-list">{links.map(link => { const Icon = link.icon; return <a className="contact-link-card" key={link.title} href={link.href} target={link.title === 'Email' ? undefined : '_blank'} rel={link.title === 'Email' ? undefined : 'noreferrer'}><span className="contact-link-icon"><Icon size={19} /></span><span className="contact-link-text"><strong>{link.title}</strong><span>{link.value}</span><small>{link.note}</small></span><ArrowUpRight size={16} /></a>; })}</div>
      <div className="availability-note"><span className="status-pip" /><div><strong>Open to meaningful collaboration</strong><p>Especially around software, security, open-source projects and practical experiments.</p></div></div>
    </WindowSection>
  </div>;
}

function FilesApp({ openApp }: { openApp: (id: AppId) => void }) {
  const places: Array<{ id: AppId; name: string; path: string; icon: LucideIcon; description: string }> = [
    { id: 'projects', name: 'Projects', path: '/home/atharv/Projects', icon: FolderOpen, description: `${projects.length} selected repositories and experiments` },
    { id: 'about', name: 'About', path: '/home/atharv/About', icon: UserRound, description: 'Profile, education and interests' },
    { id: 'skills', name: 'Toolkit', path: '/home/atharv/Toolkit', icon: Layers, description: 'Technologies and tools' },
    { id: 'certificates', name: 'Credentials', path: '/home/atharv/Credentials', icon: Award, description: 'Certificates and milestones' },
    { id: 'lab', name: 'Lab Notes', path: '/home/atharv/Lab', icon: Cpu, description: 'Hardware, games and creative work' }
  ];
  return <div className="files-app">
    <div className="file-toolbar"><span><Folder size={14} /> /home/atharv</span><span>LOCAL PORTFOLIO INDEX</span></div>
    <div className="file-layout"><aside className="file-sidebar"><span>PLACES</span>{['Home', 'Projects', 'Toolkit', 'Credentials', 'Lab Notes'].map(item => <div key={item}><Folder size={14} />{item}</div>)}</aside><div className="file-main"><div className="file-main-heading"><span>Home</span><small>5 locations</small></div><div className="file-grid">{places.map(place => { const Icon = place.icon; return <button key={place.id} onDoubleClick={() => openApp(place.id)} onClick={() => openApp(place.id)}><Icon size={27} /><strong>{place.name}</strong><small>{place.description}</small><code>{place.path}</code></button>; })}</div></div></div>
  </div>;
}

function LabApp() {
  return <div className="app-scroll lab-app">
    <WindowSection title="Experiments outside the browser" eyebrow="LAB NOTES">
      <p className="section-intro">The workbench is not limited to web applications. These are personal areas of exploration that inform how I approach technology.</p>
      <div className="lab-grid">
        <article className="lab-card"><div className="lab-icon"><Cpu size={20} /></div><span>EMBEDDED & HARDWARE</span><h3>Small boards, practical devices</h3><p>Exploring ESP32-based projects, microcontrollers, component selection, firmware and low-cost electronics. Poserion ZERO is the current multi-tool concept.</p></article>
        <article className="lab-card"><div className="lab-icon"><HardDrive size={20} /></div><span>SERVERS & SYSTEMS</span><h3>Learning by hosting</h3><p>Personal experience setting up and maintaining game servers, configuring software, troubleshooting environments and working with Windows and Linux systems.</p></article>
        <article className="lab-card"><div className="lab-icon"><Gamepad2 size={20} /></div><span>GAMES & MODDING</span><h3>Understanding game systems</h3><p>Minecraft server hosting, modding and configuration. Gaming is both a hobby and a way to explore how communities and interactive systems are built.</p></article>
        <article className="lab-card"><div className="lab-icon"><Sparkles size={20} /></div><span>CREATIVE TECHNOLOGY</span><h3>Editing, motion and visuals</h3><p>Exploring video editing, visual effects, image editing and 3D tools. Creative workflows complement the engineering side of building usable experiences.</p></article>
      </div>
      <div className="lab-footer"><span>PERSONAL WORKBENCH</span><span>BUILD SMALL. LEARN OFTEN.</span></div>
    </WindowSection>
  </div>;
}

export default App;
