/** GET /api/v1/job-posts/{id}/offer-targets */
export interface OfferTarget {
  userId: number;
  name: string;
  liked: boolean;
  longTerm: boolean;
  offered: boolean;
}

/** POST /api/v1/job-posts/{id}/bulk-offer */
export interface BulkOfferRequest {
  userIds: number[];
  /** true: 공고 생성 후·서버 자동 일괄 등 즉시 채용 오퍼 / false: 대시보드에서 수동 일괄 제안 */
  instantHire?: boolean;
}

export interface BulkOfferResponse {
  offeredCount: number;
  skippedCount: number;
}
