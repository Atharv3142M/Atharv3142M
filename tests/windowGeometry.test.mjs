import test from 'node:test';
import assert from 'node:assert/strict';
import { clampMove, clampResize, clampToViewport } from '../src/windowGeometry.ts';

const viewport = { width: 1440, height: 900 };
const initial = { x: 100, y: 90, width: 760, height: 540 };

test('move follows the requested delta without snapping to a screen edge', () => {
  const moved = clampMove(initial, { x: 137, y: 49 }, viewport);
  assert.deepEqual(moved, { x: 237, y: 139, width: 760, height: 540 });
});

test('move keeps a usable part of the titlebar reachable', () => {
  const moved = clampMove(initial, { x: 5000, y: -5000 }, viewport);
  assert.equal(moved.x, viewport.width - 132);
  assert.equal(moved.y, 52);
});

test('resize enforces minimum dimensions and preserves its origin', () => {
  const resized = clampResize(initial, { x: -1000, y: -1000 }, viewport);
  assert.equal(resized.x, initial.x);
  assert.equal(resized.y, initial.y);
  assert.equal(resized.width, 420);
  assert.equal(resized.height, 280);
});

test('resize respects available viewport dimensions', () => {
  const resized = clampResize(initial, { x: 5000, y: 5000 }, viewport);
  assert.equal(resized.width, viewport.width - initial.x - 12);
  assert.equal(resized.height, viewport.height - initial.y - 92);
});

test('restored geometry is clamped to the current viewport', () => {
  const restored = clampToViewport({ x: 1300, y: 850, width: 900, height: 700 }, viewport);
  assert.ok(restored.x >= 8);
  assert.ok(restored.y >= 52);
  assert.ok(restored.x + restored.width <= viewport.width - 8);
  assert.ok(restored.y + restored.height <= viewport.height - 82);
});
