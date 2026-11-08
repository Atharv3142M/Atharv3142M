import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PREFERENCES, parsePreferences, serializePreferences } from '../src/preferences.ts';

test('first visit receives Kali Blue and the Railway Crossing wallpaper', () => {
  assert.deepEqual(parsePreferences(null), DEFAULT_PREFERENCES);
});

test('valid user preferences are restored from a saved JSON value', () => {
  const saved = {
    theme: 'nord',
    wallpaper: 'japan',
    accent: 'violet',
    showWidgets: false,
    showShortcuts: true,
    reduceMotion: true
  };
  assert.deepEqual(parsePreferences(JSON.stringify(saved)), saved);
});

test('invalid values fall back to safe defaults without dropping valid choices', () => {
  const saved = { theme: 'unknown', wallpaper: 'missing-wallpaper', accent: 'orange', showWidgets: false };
  assert.deepEqual(parsePreferences(JSON.stringify(saved)), {
    ...DEFAULT_PREFERENCES,
    showWidgets: false
  });
});

test('malformed storage data does not break startup', () => {
  assert.deepEqual(parsePreferences('{not-json'), DEFAULT_PREFERENCES);
});

test('preference serialization round-trips', () => {
  const settings = { ...DEFAULT_PREFERENCES, theme: 'nord', wallpaper: 'ghost' };
  assert.deepEqual(parsePreferences(serializePreferences(settings)), settings);
});
