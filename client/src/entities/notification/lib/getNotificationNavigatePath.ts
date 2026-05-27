import type { UserType } from 'entities/user/model/types/user.type';
import type { NotificationType } from '../model/types/notification.type';

/**
 * 알림 타입·역할별 이동 경로 (대시보드 영역)
 * relatedId(지원 ID)는 추후 공고/지원 상세 연동 시 활용
 */
export const getNotificationNavigatePath = (
  type: NotificationType,
  role: UserType | null,
): string => {
  if (role === 'APPLICANT') {
    switch (type) {
      case 'OFFER_RECEIVED':
      case 'HIRED':
      case 'REJECTED':
      case 'JOB_POST_DELETED':
      case 'AUTO_MATCHED':
      case 'WORK_COMPLETED':
        return '/dashboard/applications';
      default:
        return '/dashboard';
    }
  }

  // 고용주: 지원·제안·근무 완료 등 → 메인 대시보드(지원자·공고)
  return '/dashboard';
};
