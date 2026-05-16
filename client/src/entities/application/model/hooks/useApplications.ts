import { useQuery } from '@tanstack/react-query';
import { fetchApplications, fetchMockApplications } from 'entities/application/api/application.api';
import { fetchJobPost } from 'entities/jobPost/api/jobPost.api';
import type { ApplicationWithJobPost } from '../types/application.type';
import { USE_MOCK } from 'shared/config/env';

/**
 * 구직자 지원 목록 조회 훅
 * 실제 API: 지원 내역 조회 → 각 jobPostId로 공고 상세 조회 → 병합
 * mock 모드: mock 데이터도 함께 반환
 */
export const useApplications = () => {
  return useQuery<ApplicationWithJobPost[]>({
    queryKey: ['applications'],
    queryFn: async () => {
      // 실제 API에서 지원 내역 조회
      const applications = await fetchApplications()
        .then((res) => res.contents)
        .catch(() => []);

      // 각 지원 내역의 jobPostId로 공고 상세 조회 후 병합
      const realWithJobPost: ApplicationWithJobPost[] = await Promise.all(
        applications.map(async (app) => {
          try {
            const jobPost = await fetchJobPost(app.jobPostId);
            return {
              ...jobPost,
              applicationId: app.applicationId,
              applicationStatus: app.status,
              appliedAt: app.appliedAt,
            };
          } catch {
            // 공고 조회 실패 시 최소 정보로 구성
            return {
              id: app.jobPostId,
              title: app.title,
              company: app.company,
              location: '',
              wage: 0,
              wageType: 'DAILY' as const,
              totalSlots: 0,
              filledSlots: 0,
              workDate: '',
              workStart: '',
              workEnd: '',
              status: 'OPEN' as const,
              applyStatus: 'NONE' as const,
              deadline: '',
              liked: false,
              applicationId: app.applicationId,
              applicationStatus: app.status,
              appliedAt: app.appliedAt,
            };
          }
        })
      );

      if (USE_MOCK) {
        const mock = await fetchMockApplications();
        return [...mock, ...realWithJobPost];
      }

      return realWithJobPost;
    },
  });
};
