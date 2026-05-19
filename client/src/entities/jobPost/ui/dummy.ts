import type { JobPost } from '../model/types/jobPost.type';

export const dummyJobPost: JobPost = {
  id: 1,
  title: '성수동 카페 주말 단기 알바 (홀서빙)',
  company: '스타커피 성수점',
  companyLogoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=StarCoffee',
  location: '서울 성동구 성수동2가',
  wage: 12000,
  wageType: 'HOURLY',
  totalSlots: 5,
  filledSlots: 3,
  workDate: '2026-06-14',
  workStart: '10:00',
  workEnd: '18:00',
  status: 'OPEN',
  applyStatus: 'APPLYING',
  deadline: '2026-06-12',
  liked: false,
};

export const dummyJobPostNoLogo: JobPost = {
  ...dummyJobPost,
  id: 2,
  companyLogoUrl: undefined,
  title: '물류센터 야간 분류·적재 (단기)',
  company: '로켓물류',
};
