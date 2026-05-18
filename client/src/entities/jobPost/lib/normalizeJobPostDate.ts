/** API 날짜(YYYY-MM-DD, YYYY/MM/DD) → input[type=date]용 YYYY-MM-DD */
export const normalizeJobPostDate = (value: string): string => {
  const normalized = value.trim().replace(/\//g, '-');
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return normalized;
  const [, y, m, d] = match;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};

/** HH:mm:ss → HH:mm */
export const normalizeJobPostTime = (value: string): string => value.slice(0, 5);
