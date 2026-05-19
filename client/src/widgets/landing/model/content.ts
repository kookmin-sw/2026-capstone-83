import jobpostlistImg from 'shared/assets/jobpostlist.png';
import calendarImg from 'shared/assets/calendar.png';
import timetableImg from 'shared/assets/timetable.png';
import postTemplateImg from 'shared/assets/postTemplate.png';
import applicantsImg from 'shared/assets/applicants.png';
import type { LucideIcon } from 'lucide-react';
import { Calendar, CheckCircle, FileText, MapPin, Search, Users } from 'lucide-react';

export const GITHUB_REPO_URL = 'https://github.com/kookmin-sw/2026-capstone-83';

export type CoreFeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const CORE_FEATURES: CoreFeatureItem[] = [
  {
    icon: Search,
    title: '일용직 특화 공고 탐색',
    description:
      '단기·일용직 공고만 필터링하여 한곳에서 탐색. 날짜·지역·직종별 검색과 무한스크롤로 빠르게 원하는 일자리를 찾을 수 있습니다.',
  },
  {
    icon: CheckCircle,
    title: '원클릭 지원',
    description:
      '급전이 필요한 구직자를 위해 최소한의 단계로 빠르게 지원. 이력서 등록 후 원클릭으로 즉시 지원이 완료됩니다.',
  },
  {
    icon: Calendar,
    title: '캘린더 기반 인력 관리',
    description:
      '고용주 전용 캘린더 대시보드로 일별 필요 인력과 배치 현황을 시각적으로 파악하고, 공고 등록부터 지원자 확정까지 한 화면에서 관리합니다.',
  },
  {
    icon: Users,
    title: '역할 기반 맞춤 서비스',
    description:
      '구직자와 고용주 역할을 구분하여 각각 최적화된 대시보드와 기능을 제공. 카카오 소셜 로그인과 JWT 인증으로 간편하고 안전합니다.',
  },
  {
    icon: MapPin,
    title: '사업장 & 네이버 지도',
    description:
      '사업장 등록 시 주소 검색과 네이버 지도 연동으로 근무지 위치를 직관적으로 제공. 구직자가 거리 기반으로 일자리를 판단할 수 있습니다.',
  },
  {
    icon: FileText,
    title: '이력서 & 지원자 관리',
    description:
      '구직자는 이력서를 간편하게 작성·관리하고, 고용주는 지원자 목록을 확인하며 수락·거절 상태를 실시간으로 관리합니다.',
  },
];

export type ShowcaseImage = {
  src: string;
  alt: string;
};

export type FeatureShowcaseItem = {
  id: string;
  title: string;
  bullets: string[];
  images: ShowcaseImage[];
  reverse?: boolean;
  duo?: boolean;
};

export const FEATURE_SHOWCASES: FeatureShowcaseItem[] = [
  {
    id: 'jobpost-search',
    title: '일용직 특화 공고 탐색',
    bullets: [
      '내부 추천 알고리즘, 필터링, 무한 스크롤로 빠르게 공고를 탐색합니다.',
      '공고 검색 및 다중 태그 필터링 — 업종, 지역, 요일, 시간대, 급여',
      '데이터 기반 개인화 추천 — 지원 이력, 경력, 지역, 좋아요 기반 맞춤 공고',
    ],
    images: [
      {
        src: jobpostlistImg,
        alt: '공고 목록 화면 — 추천, 필터, 무한 스크롤',
      },
    ],
  },
  {
    id: 'calendar',
    title: '캘린더 기반 인력·스케줄 관리',
    bullets: [
      '캘린더 대시보드로 필요 인력과 공고를 한눈에 관리합니다.',
      '고용주는 일별·월별 일정과 모집 현황을 시각적으로 파악합니다.',
      '구직자는 채용 확정된 작업을 시간표 형태로 확인합니다.',
    ],
    images: [
      { src: calendarImg, alt: '캘린더 대시보드 화면' },
      { src: timetableImg, alt: '구직자 근무 시간표 화면' },
    ],
    reverse: true,
    duo: true,
  },
  {
    id: 'template',
    title: '공고 템플릿 자동화',
    bullets: [
      '반복되는 공고 정보를 템플릿으로 저장해 두고 빠르게 재사용합니다.',
      '사업장·근무 조건 등 자주 쓰는 항목을 미리 채워 등록 시간을 줄입니다.',
    ],
    images: [
      {
        src: postTemplateImg,
        alt: '공고 템플릿 선택 및 작성 화면',
      },
    ],
  },
  {
    id: 'applicants',
    title: '인력 관리',
    bullets: [
      '지원자 관리 — 승인, 거절, 근무 완료 처리를 한 화면에서 진행합니다.',
      '공고별 지원 현황과 채용 상태를 실시간으로 확인합니다.',
      '근무 완료 후 구직자에 대한 리뷰를 작성할 수 있습니다.',
    ],
    images: [
      {
        src: applicantsImg,
        alt: '지원자 목록 및 채용 관리 화면',
      },
    ],
    reverse: true,
  },
];
