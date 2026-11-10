export type ScoreDistribution = {
  totalCount: number;
  buckets: Array<{ score: number; count: number }>;
};

export function isScoreDistribution(
  value: unknown,
): value is ScoreDistribution {
  if (!value || typeof value !== 'object') return false;
  const data = value as ScoreDistribution;
  if (
    !Number.isSafeInteger(data.totalCount) ||
    data.totalCount < 0 ||
    !Array.isArray(data.buckets) ||
    data.buckets.length > 101
  )
    return false;
  const seen = new Set<number>();
  let total = 0;
  for (const entry of data.buckets) {
    if (
      !entry ||
      !Number.isFinite(entry.score) ||
      entry.score < 0 ||
      entry.score > 10 ||
      !Number.isSafeInteger(entry.count) ||
      entry.count <= 0
    )
      return false;
    const bucket = Math.round(entry.score * 10);
    if (Math.abs(entry.score * 10 - bucket) > 1e-8 || seen.has(bucket))
      return false;
    seen.add(bucket);
    total += entry.count;
  }
  return total === data.totalCount;
}

// A hypothetical score's position against the chart, grouped at its visible precision.
// This compares scores; it does not alter or recalculate the community's consensus.
export function scorePlacement(value: number, data: ScoreDistribution) {
  if (!Number.isFinite(value) || value < 0 || value > 10 || !data.totalCount)
    return null;
  const bucket = Math.round(value * 10);
  const above = data.buckets.reduce(
    (sum, entry) =>
      sum + (Math.round(entry.score * 10) > bucket ? entry.count : 0),
    0,
  );
  const tied =
    data.buckets.find((entry) => Math.round(entry.score * 10) === bucket)
      ?.count || 0;
  const first = above + 1;
  return { first, last: Math.max(first, above + tied), total: data.totalCount };
}

export function ordinal(value: number) {
  const mod100 = value % 100;
  const suffix =
    mod100 >= 11 && mod100 <= 13
      ? 'th'
      : ['th', 'st', 'nd', 'rd'][value % 10] || 'th';
  return `${value.toLocaleString('en-US')}${suffix}`;
}
