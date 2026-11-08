import type { WallpaperId } from './data';

export type Theme = 'kali' | 'nord';
export type Accent = 'blue' | 'cyan' | 'violet';
export type Preferences = {
  theme: Theme;
  wallpaper: WallpaperId;
  accent: Accent;
  showWidgets: boolean;
  showShortcuts: boolean;
  reduceMotion: boolean;
};

export const PREFERENCE_KEY = 'poserionos.preferences.v1';
export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'kali',
  wallpaper: 'railway',
  accent: 'blue',
  showWidgets: true,
  showShortcuts: true,
  reduceMotion: false
};

const validWallpapers: WallpaperId[] = ['railway', 'amber', 'japan', 'ghost', 'last-light'];

export function parsePreferences(raw: string | null): Preferences {
  if (!raw) return { ...DEFAULT_PREFERENCES };
  try {
    const saved = JSON.parse(raw) as Partial<Preferences>;
    const theme: Theme = saved.theme === 'nord' ? 'nord' : 'kali';
    const wallpaper: WallpaperId = validWallpapers.includes(saved.wallpaper as WallpaperId) ? saved.wallpaper as WallpaperId : 'railway';
    const accent: Accent = saved.accent === 'cyan' || saved.accent === 'violet' ? saved.accent : 'blue';
    return {
      theme,
      wallpaper,
      accent,
      showWidgets: typeof saved.showWidgets === 'boolean' ? saved.showWidgets : true,
      showShortcuts: typeof saved.showShortcuts === 'boolean' ? saved.showShortcuts : true,
      reduceMotion: typeof saved.reduceMotion === 'boolean' ? saved.reduceMotion : false
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function serializePreferences(preferences: Preferences): string {
  return JSON.stringify(preferences);
}
