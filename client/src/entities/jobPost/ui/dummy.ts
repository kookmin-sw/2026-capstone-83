import type { JobPost } from "../model/types/jobPost.type";

export const dummyJobPost: JobPost = {
  id: 1,
  title: '알바생 구합니다',
  company: 'ABC Corp',
  location: '서울시 강남구',
  wage: 10000,
  wageType: 'DAILY',
  totalSlots: 5,
  filledSlots: 2,
  workDate: '2026-07-01',
  workStart: '09:00',
  workEnd: '18:00',
  postStatus: 'OPEN',
  applyStatus: 'APPLYING',
  deadline: '2026-06-30',
  liked: false
}