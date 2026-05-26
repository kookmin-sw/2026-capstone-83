import { authClient } from 'shared/api/httpClient';
import type {
  WorkerAvailabilityCreateRequest,
  WorkerAvailabilityRangeParams,
  WorkerAvailabilityResponse,
  WorkerAvailabilityUpdateRequest,
} from '../model/types/workerAvailability.type';

const BASE = '/api/v1/worker/availability';

/** 가용시간 등록 (등록 후 자동 매칭 트리거) */
export const createWorkerAvailability = async (
  data: WorkerAvailabilityCreateRequest,
): Promise<WorkerAvailabilityResponse> => {
  const response = await authClient.post<WorkerAvailabilityResponse>(BASE, data);
  return response.data;
};

/** 가용시간 수정 */
export const updateWorkerAvailability = async (
  id: number,
  data: WorkerAvailabilityUpdateRequest,
): Promise<WorkerAvailabilityResponse> => {
  const response = await authClient.put<WorkerAvailabilityResponse>(`${BASE}/${id}`, data);
  return response.data;
};

/** 가용시간 삭제 */
export const deleteWorkerAvailability = async (id: number): Promise<void> => {
  await authClient.delete(`${BASE}/${id}`);
};

/** 기간 내 가용시간 목록 조회 */
export const fetchWorkerAvailabilityRange = async (
  params: WorkerAvailabilityRangeParams,
): Promise<WorkerAvailabilityResponse[]> => {
  const response = await authClient.get<WorkerAvailabilityResponse[]>(BASE, { params });
  return response.data;
};
