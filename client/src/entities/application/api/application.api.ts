import { authClient } from "shared/api/httpClient";
import type { CursorParams } from "shared/api/types";
import type { ApplicantListCursor, ApplicantResponse, ApplicationListCursor } from "../model/types/application.type";
import mockApplicantData from "shared/mocks/data/mockApplicantData.json";


// 공고 지원 (구직자, auth)
export const applyJopPost = async (id: number) => {
  const response = await authClient.post(`/api/v1/job-posts/${id}/apply`);
  return response.data;
}


// 지원자 승인
export const acceptApplicant = async (id: number) => {
  const response = await authClient.post(`/api/v1/applications/${id}/accept`);
  return response.data;
}

// 지원자 거절
export const rejectApplicant = async (id: number) => {
  const response = await authClient.post(`/api/v1/applications/${id}/reject`);
  return response.data;
}


//지원자 목록 조회 (커서 페이지네이션)
export const fetchApplicants = async (id: number, params?: CursorParams): Promise<ApplicantListCursor> => {
  const response = await authClient.get<ApplicantListCursor>(`/api/v1/job-posts/${id}/applicants`, {
    params,
  });
  return response.data;
}


// 근무자 목록 조회
export const fetchWorkers = async (id: number): Promise<ApplicantResponse[]> => {
  const response = await authClient.get<ApplicantResponse[]>(`/api/v1/job-posts/${id}/workers`);
  return response.data;
}

//근무 완료 처리
export const completeWork = async (id: number) => {
  const response = await authClient.post(`/api/v1/applications/${id}/complete`);
  return response.data;
}

//지원 내역 조회 (커서 페이지네이션)
export const fetchApplications = async (params?: CursorParams): Promise<ApplicationListCursor> => {
  const response = await authClient.get<ApplicationListCursor>(`/api/v1/worker/applications`, {
    params,
  });
  return response.data;
}

// 채용 제안 수락
export const acceptOffer = async (id: number) => {
  const response = await authClient.post(`/api/v1/applications/${id}/accept-offer`);
  return response.data;
}

// 지원 여부 확인
export const checkApplied = async (jobPostId: number): Promise<{ applied: boolean }> => {
  const response = await authClient.get<{ applied: boolean }>(`/api/v1/job-posts/${jobPostId}/applied`);
  return response.data;
}

// 내 지원 내역 (status 필터)
export const fetchApplicationsByStatus = async (status?: string) => {
  const response = await authClient.get(`/api/v1/worker/applications/filter`, {
    params: status ? { status } : undefined,
  });
  return response.data;
}

// 근무 일정 조회 (구직자)
export const fetchWorkerSchedule = async (fromDate: string, toDate: string) => {
  const response = await authClient.get(`/api/v1/worker/schedule`, {
    params: { fromDate, toDate },
  });
  return response.data;
}


//=========================mock API 함수 ======================================

// 지원자 목록 mock 조회
export const fetchMockApplicants = (_jobPostId: number): Promise<ApplicantResponse[]> => {
  return new Promise((resolve) => {
    resolve(mockApplicantData as ApplicantResponse[]);
  });
};


