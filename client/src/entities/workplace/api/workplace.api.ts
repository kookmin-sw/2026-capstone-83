import { authClient } from "shared/api/httpClient";
import type { Workplace } from "../model/types/workplace.type";
import mockWorkplaceData from "shared/mocks/data/mockWorkplaceData.json";


export const fetchUserWorkplaces = async (): Promise<Workplace[]> => {
  const response = await authClient.get(`/api/v1/workplaces/me`);
  return response.data;
};

export const fetchWorkplaceById = async (id: number): Promise<Workplace> => {
  const response = await authClient.get(`/api/v1/workplaces/${id}`);
  return response.data;
}

export const createWorkplace = async (workplace: Workplace): Promise<Workplace> => {
  const response = await authClient.post(`/api/v1/workplaces`, workplace);
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
