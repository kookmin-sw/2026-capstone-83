import { authClient, httpClient } from "shared/api/httpClient"
import { useAuthStore } from "entities/auth/model/store/authStore";
import type { Career, CareerRequest, GetResumesParams, ResumeListCursor, ResumeRequest, ResumeResponse } from "../model/types/resume.type";
import mockResumeData from "shared/mocks/data/mockResumeData.json";


// 이력서 상세 조회, id 조회로 할 필요
// 목록 조회 필요 
export const fetchResume = async (): Promise<ResumeResponse> => {
  const response = await authClient.get(`/api/v1/resume`);
  return response.data;
}

// 인재 목록 조회 (로그인 시 authClient로 liked 포함 조회)
export const fetchResumes = async (params?: GetResumesParams): Promise<ResumeListCursor> => {
  const client = useAuthStore.getState().accessToken ? authClient : httpClient;
  const response = await client.get<ResumeListCursor>('/api/v1/resumes', { params });
  return response.data;
}

export const updateResume = async (data: ResumeRequest) => {
  const response = await authClient.put(`/api/v1/resume`, data);
  return response.data;
}


export const createCareer = async (data: CareerRequest) => {
  const response = await authClient.post(`/api/v1/resume/careers`, data);
  return response.data;
}

export const updateCareer = async (data: Career) => {
  const { id, ...rest } = data;
  const response = await authClient.put(`/api/v1/resume/careers/${id}`, rest);
  return response.data;

}

export const deleteCareer = async (id: number) => {
  const response = await authClient.delete(`/api/v1/resume/careers/${id}`);
  return response.data;
}


//이력서 좋아요 토글
export const likeResume = async (id: number) => {
  const response = await authClient.post(`/api/v1/resumes/${id}/like`);
  return response.data;
}

import type { CertificateType } from 'shared/types/certificate';

// 자격/인증 추가
export const createCertificate = async (data: { type: CertificateType }) => {
  const response = await authClient.post(`/api/v1/resume/certificates`, data);
  return response.data;
}

// 자격/인증 삭제
export const deleteCertificate = async (id: number) => {
  const response = await authClient.delete(`/api/v1/resume/certificates/${id}`);
  return response.data;
}


//=========================mock API 함수 ======================================

export const fetchMockResumes = (): Promise<ResumeResponse[]> => {
  return new Promise((resolve) => {
    resolve(mockResumeData as ResumeResponse[]);
  });
};

export const fetchMockResume = (id: number): Promise<ResumeResponse> => {
  return new Promise((resolve, reject) => {
    const resume = (mockResumeData as ResumeResponse[]).find((r) => r.id === id);
    if (resume) {
      resolve(resume);
    } else {
      reject(new Error('Resume not found'));
    }
  });
}; 