import { authClient } from "shared/api/httpClient";
import type { ScheduleRequest, ScheduleResponse } from "../model/types/schedule.type";
import mockScheduleData from "shared/mocks/data/mockScheduleData.json";

// 고용주 캘린더 — 해당 월 전체 작업장 일정 (작업장 필터는 클라이언트)
export const fetchSchedules = async (data: ScheduleRequest): Promise<ScheduleResponse> => {
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
