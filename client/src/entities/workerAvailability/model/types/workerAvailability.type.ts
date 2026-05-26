/** GET /api/v1/worker/availability */
export interface WorkerAvailabilityResponse {
  id: number;
  /** ISO-8601 local datetime (서버 LocalDateTime) */
  startAt: string;
  endAt: string;
  minDurationMinutes: number;
  crossesMidnight: boolean;
  createdAt: string;
  updatedAt: string;
}

/** POST /api/v1/worker/availability */
export interface WorkerAvailabilityCreateRequest {
  startAt: string;
  endAt: string;
  /** null/미입력 시 서버에서 0(제한 없음) */
  minDurationMinutes?: number;
}

/** PUT /api/v1/worker/availability/{id} */
export type WorkerAvailabilityUpdateRequest = WorkerAvailabilityCreateRequest;

export interface WorkerAvailabilityRangeParams {
  fromDate: string;
  toDate: string;
}
