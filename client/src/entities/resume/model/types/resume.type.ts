import type { User } from "entities/user/model/types/user.type";


export type EducationLevel =
  | 'ELEMENTARY'    // 초등학교
  | 'MIDDLE'        // 중학교
  | 'HIGH'          // 고등학교
  | 'COLLEGE_2_3'   // 대학(2,3년제)
  | 'UNIVERSITY_4'; // 대학(4년제)

// 2. 학적 상태 타입
export type SchoolStatus =
  | 'GRADUATED'       // 졸업
  | 'ENROLLED'        // 재학중
  | 'LEAVE_OF_ABSENCE' // 휴학중
  | 'DROPOUT';        // 중퇴


export interface AcademicBackground {
  educationLevel: EducationLevel | null;
  schoolStatus: SchoolStatus | null;
  major?: string;

}

export interface CareerItem {
  task: string;
  years?: number;
  months?: number;
}

export interface Career {
  academicBackground?: AcademicBackground;
  matchCount: number; // 앱 매칭 횟수
  careers?: CareerItem[];
}

export interface Resume extends User {
  career: Career;
}

