/** 제안 수락 후 PENDING — 구직자는 accept-approval 대신 고용주 확정 대기 (initiatedBy 우회) */
const offerFlowKey = (applicationId: number) => `pending-offer-flow:${applicationId}`;

export const markPendingAfterOfferAccept = (applicationId: number) => {
  sessionStorage.setItem(offerFlowKey(applicationId), '1');
};

export const isPendingAfterOfferAccept = (applicationId: number) =>
  sessionStorage.getItem(offerFlowKey(applicationId)) === '1';

export const clearPendingFlowFlag = (applicationId: number) => {
  sessionStorage.removeItem(offerFlowKey(applicationId));
};
