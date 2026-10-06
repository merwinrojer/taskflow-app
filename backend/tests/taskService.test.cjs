const assert = require('node:assert/strict');
const test = require('node:test');
const {smartPriorityScore} = require('../dist/services/taskService');

process.env.TZ = 'America/New_York';
const now = new Date(2026, 9, 6, 12, 0);

test('smart priority score combines priority and deadline urgency', () => {
  assert.equal(smartPriorityScore('High', new Date(2026, 9, 6, 23), now), 60);
  assert.equal(smartPriorityScore('Medium', new Date(2026, 9, 7, 9), now), 40);
  assert.equal(smartPriorityScore('Low', new Date(2026, 9, 13, 9), now), 20);
  assert.equal(smartPriorityScore('High', new Date(2026, 9, 5, 9), now), 30);
  assert.equal(smartPriorityScore('Low', null, now), 10);
});

test('smart priority uses calendar days through a daylight-saving boundary', () => {
  const beforeTransition = new Date(2026, 2, 7, 12, 0);
  const tomorrow = new Date(2026, 2, 8, 10, 0);
  assert.equal(smartPriorityScore('Low', tomorrow, beforeTransition), 30);
});
