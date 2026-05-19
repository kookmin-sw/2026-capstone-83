/** MainLayout 하단 Footer를 숨기는 경로 (무한 스크롤 목록 등) */
export const HIDE_FOOTER_PATHS = ['/jobposts'] as const;

export const shouldHideFooter = (pathname: string): boolean =>
  HIDE_FOOTER_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
