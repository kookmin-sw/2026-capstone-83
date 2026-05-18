import { authClient } from "shared/api/httpClient";
import type {
  Workplace,
  WorkplaceCreatePayload,
  WorkplaceUpdatePayload,
} from "../model/types/workplace.type";
import mockWorkplaceData from "shared/mocks/data/mockWorkplaceData.json";

const appendWorkplaceFormData = (
  formData: FormData,
  data: WorkplaceCreatePayload['data'],
  companyLogoImage?: File
) => {
  formData.append(
    'data',
    new Blob([JSON.stringify(data)], { type: 'application/json' })
  );
  if (companyLogoImage) {
    formData.append('companyLogoImage', companyLogoImage);
  }
};

export const fetchUserWorkplaces = async (): Promise<Workplace[]> => {
  const response = await authClient.get(`/api/v1/workplaces/me`);
  return response.data;
};

export const fetchWorkplaceById = async (id: number): Promise<Workplace> => {
  const response = await authClient.get(`/api/v1/workplaces/${id}`);
  return response.data;
};

/** multipart: data(JSON) + companyLogoImage(선택) */
export const createWorkplace = async ({
  data,
  companyLogoImage,
}: WorkplaceCreatePayload): Promise<Workplace> => {
  const formData = new FormData();
  appendWorkplaceFormData(formData, data, companyLogoImage);
  const response = await authClient.post(`/api/v1/workplaces`, formData);
  return response.data;
};

/** multipart: data(JSON) + companyLogoImage(선택) */
export const updateWorkplace = async ({
  id,
  data,
  companyLogoImage,
}: WorkplaceUpdatePayload): Promise<Workplace> => {
  const formData = new FormData();
  appendWorkplaceFormData(formData, data, companyLogoImage);
  const response = await authClient.put(`/api/v1/workplaces/${id}`, formData);
  return response.data;
};

export const deleteWorkplace = async (id: number): Promise<void> => {
  const response = await authClient.delete(`/api/v1/workplaces/${id}`);
  return response.data;
};

//=========================mock API 함수 ======================================

export const fetchMockWorkplaces = (): Promise<Workplace[]> => {
  return new Promise((resolve) => {
    resolve(mockWorkplaceData as Workplace[]);
  });
};

export const fetchMockWorkplace = (id: number): Promise<Workplace> => {
  return new Promise((resolve, reject) => {
    const workplace = (mockWorkplaceData as Workplace[]).find((w) => w.id === id);
    if (workplace) {
      resolve(workplace);
    } else {
      reject(new Error('Workplace not found'));
    }
  });
};
