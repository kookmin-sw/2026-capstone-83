// src/shared/lib/date/index.ts 로 내보내기?
export const calculateDDay = (deadline: string): string => {
  const targetDate = new Date(deadline).getTime();
  const currentDate = new Date().getTime();
  const diff = targetDate - currentDate;

  // 밀리초를 일 단위로 변환
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return '마감';
  if (days === 0) return 'D-Day';
  return `D-${days}`;
};