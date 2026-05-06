
export type ApplicationStatus = 'APPLIED' | 'HIRED' | 'REJECTED' | 'OFFERED' | 'PENDING';

export interface ApplicationResponse {
  applicationId: number;
  jobPostId: number;
  title: string;
  company: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface ApplicantResponse {
  userId: number;
  name: string;
  profileImageUrl: string;
  gender: number;
  age: number;
  address: string;
  matchCount: number;
  status: ApplicationStatus;
  appliedAt: string;

}