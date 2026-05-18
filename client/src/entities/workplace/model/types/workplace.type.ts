

export interface Workplace {
  id: number;
  name: string;
  companyName: string;
  businessNumber: string;
  address: string;
  companyLogoUrl: string;
}


/** 작업장 등록·수정 폼 필드 (로고는 파일로 별도 전송) */
export interface WorkplaceFormData {
  name: string;
  companyName: string;
  businessNumber: string;
  address: string;
}

/** @deprecated WorkplaceFormData 사용 */
export type WorkplaceCreate = WorkplaceFormData;

export interface WorkplaceCreatePayload {
  data: WorkplaceFormData;
  companyLogoImage?: File;
}

export interface WorkplaceUpdatePayload {
  id: number;
  data: WorkplaceFormData;
  companyLogoImage?: File;
}