/** GET /api/v1/worker/availability */
export interface WorkerAvailabilityResponse {
  id: number;
  /** ISO-8601 local datetime (서버 LocalDateTime) */
  startAt: string;
  endAt: string;
  minDurationMinutes: number;
  /** 희망 근무 지역 목록 (시/구 단위, 예: ["서울 강남구", "서울 마포구"]) */
  preferredDistricts: string[];
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
  /** 희망 근무 지역 목록 — 최소 1개 필수 */
  preferredDistricts: string[];
}

/** PUT /api/v1/worker/availability/{id} */
export type WorkerAvailabilityUpdateRequest = WorkerAvailabilityCreateRequest;

export interface WorkerAvailabilityRangeParams {
  fromDate: string;
  toDate: string;
}
