import { authClient } from "shared/api/httpClient"
import type { Career, CareerRequest, ResumeRequest, ResumeResponse } from "../model/types/resume.type";
import mockResumeData from "shared/mocks/data/mockResumeData.json";


// 이력서 상세 조회, id 조회로 할 필요
// 목록 조회 필요 
export const fetchResume = async (): Promise<ResumeResponse> => {
  const response = await authClient.get(`/api/v1/resume`);
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