import type { ApplicationStatus } from 'entities/application/model/types/application.type';
import type { CursorParams, CursorResponse } from 'shared/api/types';
import type { CertificateType } from 'shared/types/certificate';

export type WageType = 'HOURLY' | 'DAILY' | 'MONTHLY';
export type PostStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';
export type ApplyStatus = 'NONE' | 'APPLYING' | 'SELECTED' | 'HIRED' | 'REJECTED';

export interface JobPost {
  id: number;
  title: string;
  company: string;
  location: string; // 근무지
  wage: number; // 급여
  wageType: WageType; // 급여 유형
  totalSlots: number; // 총 모집 인원 수
  filledSlots: number; // 현재 모집 인원 수
  workDate: string; // 근무 날짜
  workStart: string; // 근무 시작 시간
  workEnd: string; // 근무 종료 시간
  status: PostStatus; // 공고 상태
  applyStatus: ApplyStatus; // 카드용 요약 (목록 API)
  applicationStatus?: ApplicationStatus; // 지원 API status (있으면 뱃지에 우선)
  deadline: string; // 마감일
  liked: boolean; // 공고 좋아요 여부
  companyLogoUrl?: string; // 사업장 로고 (목록 API)
  /** 급구 옵션 (마감 하루 전 급여 인상) */
  urgentEnabled?: boolean | null;
  /** 급구 인상액 (원, 스케줄러 적용 전 기준) */
  urgentWageIncrease?: number | null;
}

export interface JobPostDetail extends JobPost {
  description?: string; // 공고 상세 정보
  descriptionUrl?: string; // 상세 정보 이미지 URL
  s3ContentUrl?: string;
  jobCategory?: string;
  jobSubcategory?: string;
  createdAt: string; // 생성일
  updatedAt: string; // 수정일
  requirements?: string[]; // 지원 자격
  benefits?: string[]; // 우대사항
  tasks: string[]; // 업무 내용
  items?: string[]; // 준비물
  ageRequirements?: string[];
  /** 급구 인상액 (원) */
  urgentWageIncrease?: number | null;
  /** 자동 채용 제안 여부 */
  autoOfferEnabled?: boolean | null;
}

export type JobPostOverviewProps = Pick<
  JobPostDetail,
  'id' |
  'title' |
  'company' |
  'createdAt' |
  'wage' |
  'wageType' |
  'deadline' |
  'totalSlots' |
  'filledSlots' |
  'companyLogoUrl' |
  'workDate' |
  'workStart' |
  'workEnd' |
  'urgentEnabled' |
  'urgentWageIncrease'
>;

export type JobPostWorkContentProps = Pick<
  JobPostDetail,
  'requirements' |
  'benefits' |
  'tasks' |
  'items'
>;

export type JobPostDescriptionProps = Pick<
  JobPostDetail,
  'description' |
  'descriptionUrl'
>;


//공고 생성 요청 타입
// 회사 이미지와 상세 정보 이미지는 일단 File 타입으로 정의, 
// 프론트에서 s3 업로드 후 URL로 변환해서 백엔드에 전달할 지, 아니면 백엔드에서 직접 s3 업로드할 지 논의 필요
export interface JobPostCreate {
  workplaceId?: number;
  title: string;
  company: string;
  companyLogoImage?: File | null;
  location: string;
  wage: number;
  wageType: WageType;
  totalSlots: number;
  filledSlots: number;
  workDate: string;
  workStart: string;
  workEnd: string;
  deadline: string;
  description?: string;
  descriptionImage?: File | null;
  /** 지원 조건 텍스트 (쉼표 구분) — 전송 시 requirements로 병합 */
  requirementsText?: string;
  /** 필수 자격/인증 — 전송 시 requirements에 CertificateType 문자열로 포함 */
  certRequirements?: CertificateType[];
  /** 폼 입력(쉼표 구분) — 전송 시 string[]로 변환 */
  benefits?: string;
  tasks?: string;
  items?: string;
  /** 급구 옵션 */
  urgentEnabled?: boolean;
  /** 급구 시급/급여 인상액 (원) */
  urgentWageIncrease?: number;
  /** 등록 시 우선 대상 자동 일괄 제안 */
  autoOfferEnabled?: boolean;
}

/** 폼 제출 후 API/multipart 전송용 (List 필드 변환 완료) */
export type JobPostCreateSubmit = Omit<
  JobPostCreate,
  'requirementsText' | 'certRequirements' | 'benefits' | 'tasks' | 'items'
> & {
  requirements?: string[];
  benefits?: string[];
  tasks?: string[];
  items?: string[];
  urgentEnabled?: boolean;
  urgentWageIncrease?: number;
  autoOfferEnabled?: boolean;
};

export interface JobPostCreateResponse {
  newPost: JobPostDetail;
}


/** PUT /api/v1/job-posts/{id} — data 파트 (null 필드는 서버에서 기존 값 유지) */
export interface JobPostUpdateRequest {
  title?: string;
  jobCategory?: string;
  jobSubcategory?: string;
  wage?: number;
  wageType?: WageType;
  workDate?: string;
  workStart?: string;
  workEnd?: string;
  totalSlots?: number;
  deadline?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  tasks?: string[];
  items?: string[];
  ageRequirements?: string[];
  urgentEnabled?: boolean | null;
  urgentWageIncrease?: number | null;
  autoOfferEnabled?: boolean | null;
}

export interface JobPostUpdatePayload {
  data: JobPostUpdateRequest;
  descriptionImage?: File | null;
}


//공고 목록 조회 할 때, 페이지네이션 어떻게 할 지 생각해주세요!
// 일단 무한 스크롤 생각하고 있는데, offset 방식이 좋을지 cursor 방식이 좋을지 고민입니다.

//1. offset 방식: pageNumber, pageSize -> offset 계산 -> limit size
// 전통적인 방식이고, 직관적이나, 실시간으로 데이터 추가/삭제가 많은 경우 페이지 번호가 꼬일 수 있음
//2. cursor 방식: lastId -> 다음 요청 시 lastId보다 큰 데이터 가져오기 -> limit size
// 실시간 데이터에 강점이 있지만, 구현이 복잡할 수 있음



// 근무 시간대 태그
export type TimeTag =
  | 'MORNING'
  | 'MORNING_AFTERNOON'
  | 'AFTERNOON'
  | 'AFTERNOON_EVENING'
  | 'EVENING'
  | 'EVENING_DAWN'
  | 'DAWN'
  | 'DAWN_MORNING';

// 공고 목록 조회 요청 파라미터
export interface GetJobPostsParams extends CursorParams {
  // 검색
  keyword?: string;

  // 업종 (다중)
  jobCategories?: string[];

  // 위치 (다중)
  locations?: string[];

  // 근무 일자 (범위)
  workDateFrom?: string;
  workDateTo?: string;

  // 선호 요일 (다중) — MON, TUE, ..., SUN
  weekdays?: string[];

  // 근무 시간 (범위, HH:mm)
  timeFrom?: string;
  timeTo?: string;

  // 근무 시간대 태그 (다중)
  timeTags?: TimeTag[];

  // 필수 조건: 연령/성별/학력 (다중)
  ageRequirements?: string[];

  // 필수 조건: 자격/인증 (다중)
  certRequirements?: CertificateType[];

  // 최소 급여
  minWage?: number;

  // 급여 유형 필터
  wageType?: WageType;

  // 우대 조건 (다중)
  benefits?: string[];

  // 정렬: RECOMMENDED(추천순) | WAGE(급여순) | WORK_DATE(근무일순) | DEADLINE(마감임박순)
  sortType?: 'RECOMMENDED' | 'WAGE' | 'WORK_DATE' | 'DEADLINE';

  // legacy 하위호환 (단일 값)
  jobCategory?: string;
  jobSubcategory?: string;
  location?: string;
  workDate?: string;
}

// 목록 조회 응답
// offset 응답
export interface JobPostListOffset {
  jobPosts: JobPost[]; // 공고 목록
  totalElements: number; // 전체 공고 개수
  totalPages: number;    // 전체 페이지 수
  pageNumber: number;    // 현재 페이지 번호 - > offset 계산에 활용
  pageSize: number;      // 한 페이지당 가져온 개수 -> limit size
  isLast: boolean;       // 마지막 페이지 여부 
}

//커서 응답
export type JobPostListCursor = CursorResponse<JobPost>;

/** 제안 가능 공고 목록 (고용주 OPEN + 구직자 미연결) */
export interface GetOfferableJobPostsParams extends CursorParams {
  applicantUserId: number;
}

