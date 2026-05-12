# 잇다 (Itda) - 일용직 구인구직 플랫폼

일용직 구인구직을 연결하는 웹 서비스입니다. 구인자(Employer)와 구직자(Applicant)를 위한 역할 기반 대시보드를 제공합니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | React 19, TypeScript 6 |
| Build | Vite 8 |
| Styling | Styled Components 6 |
| 상태 관리 | Zustand 5 |
| 서버 상태 | TanStack React Query 5 |
| HTTP 클라이언트 | Axios |
| 라우팅 | React Router DOM 7 |
| 폼 관리 | React Hook Form 7 |
| 아이콘 | Lucide React |
| Mock | MSW (Mock Service Worker) 2 |
| Lint | ESLint 9 + TypeScript ESLint |

---

## 프로젝트 구조 (Feature-Sliced Design)

```
src/
├── app/                    # 앱 초기화, 프로바이더, 라우터
│   ├── App.tsx
│   ├── AppThemeProvider.tsx
│   ├── Routers.tsx
│   ├── queryClient.ts
│   └── layouts/            # MainLayout, AuthLayout, DashboardLayout
│
├── pages/                  # 페이지 컴포넌트
│   ├── MainPage.tsx
│   ├── auth/               # 로그인, 회원가입
│   ├── JobPost/            # 공고 목록, 상세, 작성
│   ├── Resume/             # 이력서 목록, 상세, 작성
│   ├── Applicant/          # 지원자 목록
│   └── dashboard/          # 대시보드 (employer / applicant / common)
│
├── widgets/                # 조합형 UI 블록
│   ├── header/             # 헤더 네비게이션
│   ├── sidebar/            # 대시보드 사이드바
│   ├── jobPost/            # 공고 상세, 폼
│   ├── resume/             # 이력서 폼
│   ├── workplace/          # 사업장 목록
│   └── footer/             # 푸터
│
├── features/               # 사용자 인터랙션 단위
│   ├── auth/               # 로그인/회원가입 폼
│   ├── jobPost/            # 공고 필터, 생성
│   ├── workplace/          # 사업장 CRUD, 필터
│   ├── apply/              # 지원하기 버튼
│   ├── search-address/     # 주소 검색 (다음 우편번호)
│   └── control-Image/      # 이미지 업로드
│
├── entities/               # 비즈니스 엔티티 (API, 타입, 훅)
│   ├── auth/               # 인증 (JWT + 토큰 갱신)
│   ├── jobPost/            # 채용 공고
│   ├── resume/             # 이력서
│   ├── workplace/          # 사업장
│   ├── application/        # 지원 내역
│   ├── user/               # 사용자
│   └── schedule/           # 일정 (예정)
│
└── shared/                 # 공통 모듈
    ├── api/                # httpClient, authClient (인터셉터 포함)
    ├── ui/                 # 공용 컴포넌트
    │   ├── Badge/
    │   ├── Button/
    │   ├── Empty/
    │   ├── Error/
    │   ├── Input/
    │   ├── Layout/
    │   ├── Loading/
    │   ├── Modal/
    │   ├── NaverMap/
    │   ├── ProgressBar/
    │   ├── StickyBar/
    │   ├── Title/
    │   └── Toast/
    ├── lib/                # 유틸 (D-Day 계산, FormData 변환, 문자열 변환)
    ├── theme/              # 디자인 토큰 (색상, 타이포, 간격)
    ├── styles/             # 공통 스타일 헬퍼
    ├── types/              # 전역 타입 선언
    ├── mocks/              # MSW 핸들러 및 목 데이터
    └── assets/             # 로고, 아이콘 SVG
```

---

## 주요 기능

### 공통
- JWT 기반 인증 (Access Token 자동 갱신)
- 역할 기반 라우팅 (구인자 / 구직자)
- 반응형 레이아웃 (모바일 / 태블릿 / 데스크톱)

### 구인자 (Employer)
- 채용 공고 작성 및 관리
- 사업장 등록 / 수정 / 삭제
- 지원자 목록 확인 (인재풀)
- 일정 관리 (캘린더)

### 구직자 (Applicant)
- 이력서 작성 및 관리
- 채용 공고 검색 및 상세 조회
- 공고 지원
- 지원 내역 확인

### 외부 연동
- 네이버 지도 API (사업장 위치 표시)
- 다음 우편번호 서비스 (주소 검색)

---

## 라우팅

| 경로 | 페이지 | 레이아웃 |
|------|--------|----------|
| `/` | 메인 | Main |
| `/login` | 로그인 | Auth |
| `/signup` | 회원가입 | Auth |
| `/jobposts` | 공고 목록 | Main |
| `/jobpost/:id` | 공고 상세 | Main |
| `/jobpost/create` | 공고 작성 | Main |
| `/resumes` | 이력서 목록 | Main |
| `/resume/:id` | 이력서 상세 | Main |
| `/resume/edit` | 이력서 작성/수정 | Main |
| `/applicants` | 지원자 목록 | Main |
| `/dashboard` | 대시보드 홈 | Dashboard |
| `/dashboard/workplace` | 사업장 관리 | Dashboard |
| `/dashboard/talent` | 인재풀 | Dashboard |
| `/dashboard/resume` | 이력서 관리 | Dashboard |
| `/dashboard/applications` | 지원 내역 | Dashboard |
| `/dashboard/calendar` | 일정 관리 | Dashboard |
| `/dashboard/settings` | 설정 | Dashboard |

---

## 시작하기

### 사전 요구사항

- Node.js 18+
- npm 9+

### 설치

```bash
# 의존성 설치
npm install
```

### 환경 변수 설정

`.env.example`을 참고하여 `.env.local` 파일을 생성합니다.

```env
VITE_API_BASE_URL=         # 백엔드 API 주소
VITE_TIMEOUT=              # 요청 타임아웃 (ms, 기본값: 30000)
VITE_USE_MSW=              # MSW 사용 여부 (true/false)
VITE_NAVER_MAP_CLIENT_ID=  # 네이버 지도 클라이언트 ID
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 프리뷰 (빌드 결과 확인)

```bash
npm run preview
```

### 린트

```bash
npm run lint
```

---

## 디자인 시스템

### 색상 팔레트

| 토큰 | 값 | 용도 |
|------|-----|------|
| `primary` | `#4DB190` | 주요 액션, 브랜드 |
| `secondary` | `#E2F1EC` | 보조 배경 |
| `tertiary` | `#02542D` | 강조 텍스트 |
| `highlight` | `#00C8B3` | 뱃지, 하이라이트 |
| `accent` | `#F0C23B` | 포인트 컬러 |
| `error` | `#CC0000` | 에러, 필수 표시 |

### 반응형 브레이크포인트

| 이름 | 조건 |
|------|------|
| Mobile | `max-width: 480px` |
| Tablet (Small) | `max-width: 768px` |
| Tablet (Large) | `max-width: 1024px` |

---

## 개발 컨벤션

- **아키텍처**: Feature-Sliced Design (FSD) 엄격 준수
- **스타일링**: `styled-components` 사용, `theme.ts` 토큰 활용
- **공통 컴포넌트**: `src/shared/ui` 내 컴포넌트 우선 활용
- **상태 관리**: 서버 상태는 React Query, 클라이언트 상태는 Zustand
- **API 호출**: 인증 필요 시 `authClient`, 공개 API는 `httpClient` 사용
- **Mock**: MSW를 활용한 API 모킹으로 백엔드 독립 개발 가능
