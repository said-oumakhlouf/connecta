import assert from 'node:assert/strict';
import test from 'node:test';
import { reservationTime } from '../lib/reservation-time';

test('reservation countdown uses the saved deadline across reloads and rounds up partial seconds', () => {
  const deadline = '2026-10-09T14:30:00Z';
  assert.deepEqual(reservationTime(deadline, Date.parse('2026-10-09T14:11:17.100Z')), {
    expired: false, label: '18 min 43 s',
  });
  assert.deepEqual(reservationTime(deadline, Date.parse('2026-10-09T14:29:59.999Z')), {
    expired: false, label: '0 min 01 s',
  });
});

test('elapsed deadlines wait for server confirmation and never show negative time', () => {
  const deadline = '2026-10-09T14:30:00Z';
  for (const now of ['2026-10-09T14:30:00Z', '2026-10-09T15:00:00Z']) {
    assert.deepEqual(reservationTime(deadline, Date.parse(now)), {
      expired: true, label: '0 min 00 s',
    });
  }
  for (const missing of [undefined, null, '', 'invalid']) {
    assert.equal(reservationTime(missing, Date.now()), null);
  }
});
