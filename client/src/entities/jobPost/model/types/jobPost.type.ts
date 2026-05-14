
export type WageType = 'HOURLY' | 'DAILY' | 'MONTHLY';
export type PostStatus = 'OPEN' | 'CLOSED' | 'ALMOST_CLOSED' | 'CANCELLED';
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
  postStatus: PostStatus; // 공고 상태
  applyStatus: ApplyStatus; // 지원 상태
  deadline: string; // 마감일
  liked: boolean; // 공고 좋아요 여부
}

export interface JobPostDetail extends JobPost {
  companyLogoUrl?: string; // 회사 로고 이미지 URL
  description?: string; // 공고 상세 정보
  descriptionUrl?: string; // 상세 정보 이미지 URL
  createdAt: string; // 생성일
  updatedAt: string; // 수정일
  requirements?: string[]; // 지원 자격
  benefits?: string[]; // 우대사항
  tasks: string[]; // 업무 내용
  items?: string[]; // 준비물
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
  'workEnd'
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
  requirements?: string[];
  benefits?: string[];
  tasks: string[];
  items?: string[];
}


export interface JobPostCreateResponse {
  newPost: JobPostDetail;
}


export interface JobPostUpdate {
  id: number;
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
  requirements?: string[];
  benefits?: string[];
  tasks: string[];
  items?: string[];
}





//공고 목록 조회 할 때, 페이지네이션 어떻게 할 지 생각해주세요!
// 일단 무한 스크롤 생각하고 있는데, offset 방식이 좋을지 cursor 방식이 좋을지 고민입니다.

//1. offset 방식: pageNumber, pageSize -> offset 계산 -> limit size
// 전통적인 방식이고, 직관적이나, 실시간으로 데이터 추가/삭제가 많은 경우 페이지 번호가 꼬일 수 있음
//2. cursor 방식: lastId -> 다음 요청 시 lastId보다 큰 데이터 가져오기 -> limit size
// 실시간 데이터에 강점이 있지만, 구현이 복잡할 수 있음



// 공고 목록 조회 요청 파라미터
export interface GetJobPostsParams {
  size?: number;             // 한 페이지에 가져올 개수 (기본값 설정 가능)
  page?: number;             // [오프셋용] 페이지 번호 (0부터 시작)
  cursor?: number | string;  // [커서용] 마지막으로 확인한 ID

  // 검색 필터링 옵션
  keyword?: string;          // 검색어
  jobCategory?: string;    // 업종 대분류
  jobSubcategory?: string; // 업종 소분류
  location?: string;    // 지역 필터
  workDate?: string;       // 근무 날짜 필터 (예: "2024-07-01")
  sortType?: 'WAGE' | 'LOCATION' | 'WORK_DATE'; // 정렬 기준 필터
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
export interface JobPostListCursor {
  jobPosts: JobPost[]; // 공고 목록
  nextCursor: number | string | null; // 다음 요청 시 사용할 기준 ID (더 이상 없으면 null)
  hasNext: boolean;                   // 다음 페이지가 있는지 여부
}

