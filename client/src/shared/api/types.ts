/** 커서 기반 페이지네이션 공통 요청 파라미터 */
export interface CursorParams {
  cursor?: number | string;
  size?: number;
}

/** 커서 기반 페이지네이션 공통 응답 */
export interface CursorResponse<T> {
  jobPosts: T[];
  nextCursor: number | null;
  hasNext: boolean;
}
