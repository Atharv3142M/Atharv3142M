import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { projects, wallpaperLibrary } from '../src/data.ts';
import { DEFAULT_PREFERENCES } from '../src/preferences.ts';

test('the portfolio project list contains only complete case-study entries', () => {
  assert.ok(projects.length >= 8);
  assert.equal(new Set(projects.map(project => project.id)).size, projects.length);
  for (const project of projects) {
    assert.ok(project.name.trim().length > 2);
    assert.ok(project.description.trim().length > 30);
    assert.ok(project.overview.trim().length > 60);
    assert.ok(project.approach.length >= 2);
    assert.ok(project.engineeringNotes.length >= 2);
    assert.ok(project.stack.length >= 3);
  }
});

test('project links are direct repository or demo URLs with no tracking query', () => {
  for (const project of projects) {
    assert.match(project.github, /^https:\/\/github\.com\//);
    assert.equal(project.github.toLowerCase().includes('source=chatgpt'), false);
    if (project.live) assert.equal(project.live.toLowerCase().includes('source=chatgpt'), false);
  }
});

test('Railway Crossing remains the default and every supplied wallpaper is bundled', () => {
  assert.equal(DEFAULT_PREFERENCES.wallpaper, 'railway');
  assert.equal(wallpaperLibrary.length, 5);
  for (const wallpaper of wallpaperLibrary) {
    assert.ok(existsSync(new URL(`../public${wallpaper.file}`, import.meta.url)));
  }
});

test('only selected, documented projects are shown', () => {
  const ids = new Set(projects.map(project => project.id));
  assert.ok(ids.has('graphyte'));
  assert.ok(ids.has('poseye'));
  assert.ok(ids.has('poai'));
  assert.ok(ids.has('croptellect'));
  assert.ok(ids.has('capstone-mis'));
  assert.ok(!ids.has('empty-placeholder'));
  assert.ok(!ids.has('ai-hygiene-extension'));
});
