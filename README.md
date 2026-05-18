# 잇다 (ITDA) — 단기·일용직 구인구직 매칭 플랫폼

> 2026 국민대학교 캡스톤디자인 83조

🔗 **프로젝트 자세한 설명** → https://kookmin-sw.github.io/2026-capstone-83/

🌐 **서비스 URL** → http://44.207.95.136/

구인자와 구직자를 빠르게 연결하는 단기·일용직 전문 매칭 플랫폼입니다.
데이터 기반 개인화 추천으로 구직자에게 최적의 공고를, 고용주에게 적합한 인재를 제안합니다.

---

## 주요 기능

### 구직자 (Applicant)
- 공고 검색 및 다중 태그 필터링 (업종/지역/요일/시간대/급여)
- **데이터 기반 개인화 추천** — 지원 이력, 경력, 지역, 좋아요 기반 맞춤 공고 추천
- 원클릭 지원 및 지원 내역 관리
- 이력서 작성 (학력/경력/자격증)
- 근무 일정 캘린더
- 실시간 알림 (지원 결과, 제안 수신 등)
- 근무 완료 후 사업장 리뷰 작성

### 고용주 (Employer)
- 사업장 등록 및 관리
- 공고 등록 (이미지 업로드, S3 연동)
- **공고 템플릿** — 반복 정보를 저장해두고 빠르게 공고 생성
- 지원자 관리 (승인/거절/근무완료 처리)
- 인재풀 열람 및 좋아요
- 캘린더 기반 일정 관리
- 근무 완료 후 구직자 리뷰 작성

### 매니저 (Manager)
- 유저 관리 (정지/해제)
- 신고 접수 및 처리
- 추천 알고리즘 성과 대시보드 (CTR / CVR / NDCG@10)

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | React 19, TypeScript, Vite 8, Styled Components, Zustand, TanStack Query |
| **Backend** | Java 17, Spring Boot 3.5, Spring Security, Spring Data JPA |
| **Database** | AWS RDS MySQL 8 |
| **Storage** | AWS S3 (이미지 업로드 + Lambda 리사이징) |
| **Auth** | JWT (Access + Refresh httpOnly Cookie) + 카카오 OAuth2 |
| **Realtime** | SSE (Server-Sent Events) |
| **Deploy** | AWS EC2 (서버), AWS S3 (프론트 정적 호스팅) |
| **CI/CD** | GitHub Actions |

---

## 프로젝트 구조

```
2026-capstone-83/
├── client/          # React 프론트엔드 (Feature-Sliced Design)
├── server/          # Spring Boot 백엔드
├── lambda/          # AWS Lambda (이미지 리사이징)
├── docs/            # 프로젝트 소개 페이지
└── README.md        # 이 파일
```

---

## 추천 알고리즘

구직자 개인화 추천 (`sortType=RECOMMENDED`) 시 아래 시그널을 종합해 점수를 매깁니다.

| 시그널 | 최대 점수 | 설명 |
|--------|----------|------|
| 지역 근접 | 30 | 주소 단계별 매칭 (도→시군구→동) |
| 업종 일치 | 20 | 지원/경력 이력 최빈 카테고리 |
| 일정 가용 | 15 | 기존 HIRED 일정과 미충돌 |
| 급여 수준 | 15 | 동일 카테고리 시급 백분위 |
| 마감 임박/신선도 | 10 | D-7 이내 또는 등록 24h 이내 |
| 좋아요 사업장 | 5 | 공고/이력서 좋아요 역추적 |
| HIRED 사업장 | 5 | 재고용 가능성 |
| 이미 지원한 공고 | -10 | 중복 노출 감점 |

가중치는 `server/src/main/resources/application.yml`에서 조정 가능합니다.

---

## 팀원

| 이름 | 역할 |
|------|------|
| 방현식 | Backend |
| 이재익 | Backend |
| 이진백 | Backend |
| 정호진 | Frontend |
| 김세현 | Design / PM |

---

## 라이선스

이 프로젝트는 국민대학교 캡스톤디자인 과목의 일환으로 제작되었습니다.
