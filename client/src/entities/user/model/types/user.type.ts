
export type UserType = 'APPLICANT' | 'EMPLOYER' | 'MANAGER';


export interface User {
  role: UserType;
  name: string;
  gender: 'MALE' | 'FEMALE';
  email: string;
  password: string;
  profileImageUrl?: string;
  location: string;
  birth: string;
  phone: string;
}