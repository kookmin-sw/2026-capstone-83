import type { JobPost } from '../model/types/jobPost.type';

/** YYYY-MM-DD / YYYY/MM/DD 등 날짜 문자열을 로컬 자정 기준 Date로 파싱 */
const parseDeadlineDate = (deadline: string): Date | null => {
  const normalized = deadline.trim().replace(/\//g, '-');
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
};

/** 마감일이 오늘(포함) 이후인지 — 서버 OPEN이어도 deadline 지난 공고 제외용 */
export const isActiveDeadline = (deadline: string): boolean => {
  const deadlineDate = parseDeadlineDate(deadline);
  if (!deadlineDate) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  return deadlineDate >= today;
};

export const filterActiveDeadlineJobPosts = <T extends Pick<JobPost, 'deadline'>>(posts: T[]): T[] =>
  posts.filter((post) => isActiveDeadline(post.deadline));
