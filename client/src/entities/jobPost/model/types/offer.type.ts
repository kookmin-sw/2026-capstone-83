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
}

export interface BulkOfferResponse {
  offeredCount: number;
  skippedCount: number;
}
