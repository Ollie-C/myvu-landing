import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  isScoreDistribution,
  scorePlacement,
  ordinal,
} from './scorePlacement.ts';

const chart = {
  totalCount: 1000,
  buckets: [
    { score: 9, count: 419 },
    { score: 8.3, count: 41 },
    { score: 7, count: 540 },
  ],
};

test('uses real counts for a tied score range', () => {
  assert.equal(isScoreDistribution(chart), true);
  assert.deepEqual(scorePlacement(8.3, chart), {
    first: 420,
    last: 460,
    total: 1000,
  });
});

test('handles gaps, boundaries and empty charts without inventing a range', () => {
  assert.deepEqual(scorePlacement(8.4, chart), {
    first: 420,
    last: 420,
    total: 1000,
  });
  assert.deepEqual(scorePlacement(10, chart), {
    first: 1,
    last: 1,
    total: 1000,
  });
  assert.deepEqual(scorePlacement(0, chart), {
    first: 1001,
    last: 1001,
    total: 1000,
  });
  assert.equal(scorePlacement(8.3, { totalCount: 0, buckets: [] }), null);
  assert.equal(scorePlacement(NaN, chart), null);
});

test('rejects partial, duplicate, or invalid upstream data', () => {
  for (const invalid of [
    null,
    {},
    { totalCount: 4, buckets: [{ score: 8.3, count: 1 }] },
    { totalCount: 1, buckets: [{ score: 11, count: 1 }] },
    { totalCount: 1, buckets: [{ score: 8.33, count: 1 }] },
    {
      totalCount: 2,
      buckets: [
        { score: 8.3, count: 1 },
        { score: 8.3, count: 1 },
      ],
    },
  ]) {
    assert.equal(isScoreDistribution(invalid), false);
  }
  assert.equal(isScoreDistribution({ totalCount: 0, buckets: [] }), true);
});

test('formats rank ordinals including teen exceptions', () => {
  assert.deepEqual([1, 2, 3, 11, 12, 13, 21, 420, 1001].map(ordinal), [
    '1st',
    '2nd',
    '3rd',
    '11th',
    '12th',
    '13th',
    '21st',
    '420th',
    '1,001st',
  ]);
});
