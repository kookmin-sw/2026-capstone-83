import { authClient } from "shared/api/httpClient";
import type { ScheduleRequest, ScheduleResponse } from "../model/types/schedule.type";
import mockScheduleData from "shared/mocks/data/mockScheduleData.json";

// 고용주 캘린더 공고 조회
export const fetchSchedules = async (_workplaceId: number, data: ScheduleRequest): Promise<ScheduleResponse> => {
  const response = await authClient.get<ScheduleResponse>(`/api/v1/calendar/employer`, {
    params: data,
  });
  return response.data;
};

//=========================mock API 함수 ======================================

export const fetchMockSchedules = (): Promise<ScheduleResponse> => {
  return new Promise((resolve) => {
    resolve(mockScheduleData as ScheduleResponse);
  });
};
