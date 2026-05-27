import type { InitiatedBy } from '../model/types/application.type';

/** 고용주 제안 → 구직자 수락 후 PENDING (고용주 최종 확정 대기) */
export const isPendingOfferFlow = (initiatedBy: InitiatedBy) => initiatedBy === 'EMPLOYER';

/** 구직자 지원 → 고용주 승인 후 PENDING (구직자 최종 수락 대기) */
export const isPendingApplicationFlow = (initiatedBy: InitiatedBy) => initiatedBy === 'APPLICANT';

export const canEmployerConfirmPending = (initiatedBy: InitiatedBy) => isPendingOfferFlow(initiatedBy);

export const canWorkerAcceptPending = (initiatedBy: InitiatedBy) => isPendingApplicationFlow(initiatedBy);
