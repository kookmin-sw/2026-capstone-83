/** 공고 템플릿 응답 */
export interface JobPostTemplateResponse {
  id: number;
  templateName: string;
  title: string;
  jobCategory?: string;
  jobSubcategory?: string;
  wage?: number;
  wageType?: string;
  workStart?: string;
  workEnd?: string;
  totalSlots?: number;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  tasks?: string[];
  items?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/** 공고 템플릿 생성/수정 요청 */
export interface JobPostTemplateRequest {
  templateName: string;
  title?: string;
  jobCategory?: string;
  jobSubcategory?: string;
  wage?: number;
  wageType?: string;
  workStart?: string;
  workEnd?: string;
  totalSlots?: number;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  tasks?: string[];
  items?: string[];
}
