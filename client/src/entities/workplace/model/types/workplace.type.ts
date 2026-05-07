

export interface Workplace {
  id: number;
  name: string;
  companyName: string;
  businessNumber: string;
  address: string;
  companyLogoUrl: string;
}

export interface WorkplaceCreate {
  name: string;
  companyName: string;
  businessNumber: string;
  address: string;
  companyLogoUrl: string;
}