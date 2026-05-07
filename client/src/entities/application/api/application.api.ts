import { authClient } from "shared/api/httpClient";


// 공고 지원 (구직자, auth)
export const applyJopPost = async (id: number) => {
  const response = await authClient.post(`/api/v1/job-posts/${id}/apply`);
  return response.data;
}


// 지원자 승인
export const acceptApplicant = async (id: number) => {
  const response = await authClient.patch(`/api/v1/applications/${id}/accept`);
  return response.data;
}

// 지원자 거절
export const rejectApplicant = async (id: number) => {
  const response = await authClient.patch(`/api/v1/applications/${id}/reject`);
  return response.data;
}


//지원자 목록 조회
export const fetchApplicants = async (id: number) => {
  const response = await authClient.get(`/api/v1/job-posts/${id}/applicants`);
  return response.data;
}


// 근무자 목록 조회
export const fetchWorkers = async (id: number) => {
  const response = await authClient.get(`/api/v1/job-posts/${id}/workers`);
  return response.data;
}

//근무 완료 처리
export const completeWork = async (id: number) => {
  const response = await authClient.post(`/api/v1/applications/${id}/complete`);
  return response.data;
}

//지원 내역 조회
export const fetchApplications = async () => {
  const response = await authClient.get(`/api/v1/worker/applications`);
  return response.data;
}

// 채용 제안 수락
export const acceptOffer = async (id: number) => {
  const response = await authClient.post(`/api/v1/applications/${id}/accept-offer`);
  return response.data;
}


