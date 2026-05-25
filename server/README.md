# itda 서버 (Back-end)

> 단기·일용직 구인구직 매칭 플랫폼 **itda**의 Spring Boot 백엔드 서버입니다.

---

## 📋 목차

- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [환경 변수 설정](#환경-변수-설정)
- [로컬 실행 방법](#로컬-실행-방법)
- [배포 구조](#배포-구조)
- [API 명세](#api-명세)
- [ERD 및 엔티티 설명](#erd-및-엔티티-설명)
- [인증 방식](#인증-방식)
- [공고 추천 알고리즘](#공고-추천-알고리즘)

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| Language | Java 17 |
| Framework | Spring Boot 3.5 |
| Build Tool | Gradle |
| ORM | Spring Data JPA (Hibernate) |
| Database | AWS RDS MySQL 8 |
| Auth | JWT (jjwt 0.12.6) + 카카오 OAuth2 |
| Security | Spring Security (Stateless) |
| Storage | AWS S3 (`pj-kmucd2-3-itda-s3`, us-east-1) |
| 실시간 알림 | SSE (Server-Sent Events) |
| Deploy | AWS EC2 + GitHub Actions (자동 배포) |

---

## 프로젝트 구조

```
server/
└── src/main/java/com/itda/
    ├── config/           # Security, JWT, CORS, S3, Jackson 설정
    ├── controller/       # REST API 컨트롤러
    ├── service/          # 비즈니스 로직
    │   └── event/        # Spring 이벤트 리스너 (추천 로그)
    ├── repository/       # Spring Data JPA Repository
    ├── entity/           # JPA 엔티티 (DB 테이블 매핑)
    ├── dto/
    │   ├── request/      # 요청 DTO
    │   └── response/     # 응답 DTO
    ├── enums/            # 상태값 Enum 정의
    ├── converter/        # JPA AttributeConverter (List ↔ JSON)
    └── exception/        # 전역 예외 처리
```

---

## 환경 변수 설정

`application.yml`은 환경 변수를 참조합니다. EC2 서버의 경우 `/etc/environment` 또는 `start.sh`에서 주입합니다.

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `DB_URL` | MySQL JDBC URL | `jdbc:mysql://호스트:3306/recruitment` |
| `DB_USERNAME` | DB 사용자명 | `admin` |
| `DB_PASSWORD` | DB 비밀번호 | - |
| `KAKAO_CLIENT_ID` | 카카오 앱 REST API 키 | - |
| `KAKAO_CLIENT_SECRET` | 카카오 앱 시크릿 키 | - |
| `KAKAO_REDIRECT_URI` | 카카오 리다이렉트 URI | `http://localhost:5173/oauth/kakao/callback` |
| `JWT_SECRET` | JWT 서명용 시크릿 키 (256bit 이상) | - |

---

## 로컬 실행 방법

```bash
# 1. 저장소 클론
git clone https://github.com/kookmin-sw/2026-capstone-83.git
cd 2026-capstone-83/server

# 2. 환경 변수 설정 (IntelliJ Run Configuration 또는 export 사용)
export DB_URL=jdbc:mysql://localhost:3306/recruitment
export DB_USERNAME=root
export DB_PASSWORD=yourpassword
export JWT_SECRET=your-256-bit-secret-key-here

# 3. 빌드 및 실행
./gradlew bootRun
```

서버는 기본적으로 `http://localhost:8080`에서 실행됩니다.

---

## 배포 구조

```
GitHub main 브랜치 push
    └─▶ GitHub Actions (.github/workflows)
            └─▶ EC2 서버 (44.207.95.136)
                    ├── ~/deploy.sh  # 빌드 + 재시작
                    └── ~/start.sh   # 재시작 (빌드 없이)
```

```bash
# 코드 변경 후 배포
bash ~/deploy.sh

# 서버 재시작만 (빌드 없이)
bash ~/start.sh

# 로그 확인
tail -f /home/ec2-user/app.log
```

> **운영 환경 타임존 주의**
>
> JVM 타임존은 `ItdaApplication.main()` 에서 `Asia/Seoul(KST)` 로 강제 설정되므로
> 코드 레벨에서는 별도 JVM 옵션 없이도 동작한다.
> 단, EC2 OS 타임존도 `Asia/Seoul` 로 맞춰두어야 스케줄러 cron 표현식과
> OS 시각이 일치한다.
>
> ```bash
> # EC2 OS 타임존 확인 및 설정
> timedatectl
> sudo timedatectl set-timezone Asia/Seoul
> ```
>
> `DB_URL` 환경변수에는 `?serverTimezone=Asia/Seoul` 이 포함되어 있어야 한다
> (현재 운영 환경에 설정됨). `application.yml` 에 중복 기재하지 말 것.

---

## API 명세

Base URL: `http://44.207.95.136:8080/api/v1`

인증이 필요한 API는 요청 헤더에 `Authorization: Bearer {accessToken}`을 포함해야 합니다.

---

### 인증 (Auth)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | `/signup` | 일반 회원가입 | ❌ |
| POST | `/login` | 일반 로그인 | ❌ |
| POST | `/refresh` | Access Token 재발급 | ❌ (쿠키) |
| POST | `/logout` | 로그아웃 (쿠키 삭제) | ❌ |
| POST | `/auth/kakao?code=` | 카카오 소셜 로그인 | ❌ |

**로그인 응답 예시**
```json
{
  "accessToken": "eyJhbGci...",
  "role": "APPLICANT"
}
```
> Refresh Token은 `HttpOnly` 쿠키로 자동 저장됩니다.

---

### 공고 (JobPost)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/job-posts` | 공고 목록 조회 (필터 + 커서 페이지네이션) | ❌ |
| GET | `/job-posts/{id}` | 공고 상세 조회 | ❌ |
| POST | `/job-posts?workplaceId=` | 공고 등록 (multipart/form-data) | ✅ EMPLOYER |
| PATCH | `/job-posts/{id}/close` | 공고 마감 처리 | ✅ EMPLOYER |
| GET | `/job-posts/employer` | 내 공고 목록 | ✅ EMPLOYER |
| GET | `/job-posts/employer/calendar` | 캘린더용 날짜 범위 공고 조회 | ✅ EMPLOYER |

**공고 목록 쿼리 파라미터**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `cursor` | Long | 마지막으로 받은 공고 ID (첫 요청 시 생략) |
| `size` | int | 한 번에 가져올 개수 (기본값 10) |
| `keyword` | String | 제목 검색어 |
| `jobCategory` | String | 업종 대분류 필터 |
| `location` | String | 근무지 필터 |
| `sortType` | String | 정렬 방식 (`WAGE` / `WORK_DATE` / `RECOMMENDED`) |

---

### 사업장 (Workplace)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | `/workplaces` | 사업장 등록 | ✅ EMPLOYER |
| GET | `/workplaces/me` | 내 사업장 목록 조회 | ✅ EMPLOYER |
| GET | `/workplaces/{id}` | 사업장 단건 조회 (본인 소유만) | ✅ EMPLOYER |
| PUT | `/workplaces/{id}` | 사업장 수정 (null 필드는 기존 값 유지) | ✅ EMPLOYER |
| DELETE | `/workplaces/{id}` | 사업장 삭제 (연결 공고 0건일 때만) | ✅ EMPLOYER |

**삭제 응답 코드**

| 코드 | 설명 |
|------|------|
| 204 | 삭제 성공 |
| 403 | 본인 소유 사업장이 아님 |
| 404 | 사업장을 찾을 수 없음 |
| 409 | 연결된 공고가 존재 — 공고를 먼저 정리해야 함 |

---

### 지원 (Application)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | `/job-posts/{id}/apply` | 공고 지원 | ✅ APPLICANT |
| GET | `/job-posts/{id}/applied` | 지원 여부 확인 | ✅ APPLICANT |
| GET | `/worker/applications` | 내 지원 내역 (커서 페이지네이션) | ✅ APPLICANT |
| GET | `/worker/applications/filter?status=` | 내 지원 내역 (상태 필터) | ✅ APPLICANT |
| GET | `/worker/schedule?fromDate=&toDate=` | 근무 일정 조회 | ✅ APPLICANT |
| POST | `/applications/{id}/accept-offer` | 고용주 제안 수락 | ✅ APPLICANT |
| GET | `/job-posts/{id}/applicants` | 지원자 목록 조회 | ✅ EMPLOYER |
| GET | `/job-posts/{id}/workers` | 근무자 목록 조회 | ✅ EMPLOYER |
| POST | `/applications/{id}/accept` | 지원자 채용 확정 | ✅ EMPLOYER |
| POST | `/applications/{id}/reject` | 지원자 거절 | ✅ EMPLOYER |
| POST | `/applications/{id}/complete` | 근무 완료 처리 | ✅ EMPLOYER |

**지원 상태 흐름**

```
구직자 지원       고용주 제안
    │                 │
  APPLIED          OFFERED
    │                 │
    │           구직자 수락
    │                 │
    └────────▶ PENDING ◀──────┐
                   │           │
           고용주 최종 확정  고용주 거절
                   │           │
                HIRED       REJECTED
                   │
           고용주 근무 완료 처리
                   │
              COMPLETED
```

---

### 이력서 (Resume)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/resume` | 내 이력서 조회 | ✅ APPLICANT |
| PUT | `/resume` | 이력서 등록/수정 | ✅ APPLICANT |
| POST | `/resume/careers` | 경력 추가 | ✅ APPLICANT |
| PUT | `/resume/careers/{id}` | 경력 수정 | ✅ APPLICANT |
| DELETE | `/resume/careers/{id}` | 경력 삭제 | ✅ APPLICANT |
| POST | `/resume/certificates` | 자격/인증 추가 | ✅ APPLICANT |
| DELETE | `/resume/certificates/{id}` | 자격/인증 삭제 | ✅ APPLICANT |
| GET | `/resumes` | 인재 목록 조회 (커서 페이지네이션) | ✅ EMPLOYER |
| GET | `/resume/{resumeId}` | 이력서 상세 조회 (고용주용) | ✅ EMPLOYER |

---

### 좋아요 (Like)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | `/job-posts/{id}/like` | 공고 좋아요 토글 | ✅ APPLICANT |
| POST | `/resumes/{id}/like` | 이력서 좋아요 토글 | ✅ EMPLOYER |

---

### 리뷰 (Review)

근무 완료(`COMPLETED`) 상태의 application에 한해 작성 가능합니다.

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | `/applications/{id}/reviews/employee` | 구직자 → 사업장 리뷰 작성 | ✅ APPLICANT |
| POST | `/applications/{id}/reviews/employer` | 고용주 → 구직자 리뷰 작성 | ✅ EMPLOYER |
| GET | `/workplaces/{id}/reviews` | 사업장 리뷰 목록 | ❌ |
| GET | `/users/{id}/reviews` | 구직자 리뷰 목록 | ❌ |
| GET | `/applications/{id}/reviews` | application별 리뷰 조회 (양방향) | ❌ |
| GET | `/reviews/my` | 내가 작성한 리뷰 목록 | ✅ |
| GET | `/reviews/tags?target=` | 방향별 태그 목록 조회 | ❌ |

**리뷰 작성 요청 예시**
```json
{
  "tags": ["GOOD_PAY", "KIND_EMPLOYER"],
  "content": "급여도 정확하고 분위기도 좋았어요!"
}
```
> `tags`와 `content` 중 최소 하나는 필수입니다.

---

### 알림 (Notification)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/notifications/subscribe?token=` | SSE 실시간 구독 | ✅ (쿼리 파라미터) |
| GET | `/notifications` | 전체 알림 목록 (최근 50개) | ✅ |
| GET | `/notifications/unread` | 미읽은 알림 목록 | ✅ |
| GET | `/notifications/unread-count` | 미읽은 알림 개수 | ✅ |
| PATCH | `/notifications/{id}/read` | 알림 읽음 처리 | ✅ |
| PATCH | `/notifications/read-all` | 전체 읽음 처리 | ✅ |

---

### 공고 템플릿 (Template)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/templates` | 템플릿 목록 조회 | ✅ EMPLOYER |
| GET | `/templates/{id}` | 템플릿 상세 조회 | ✅ EMPLOYER |
| POST | `/templates` | 템플릿 생성 | ✅ EMPLOYER |
| PUT | `/templates/{id}` | 템플릿 수정 | ✅ EMPLOYER |
| DELETE | `/templates/{id}` | 템플릿 삭제 | ✅ EMPLOYER |

---

### 캘린더 (Calendar)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/calendar/employer` | 고용주 캘린더 일정 조회 | ✅ EMPLOYER |

---

### 신고 (Report)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | `/reports` | 신고 접수 | ✅ |

---

### 매니저 (Manager)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/manager/users` | 유저 목록 조회 | ✅ MANAGER |
| GET | `/manager/users/{id}` | 유저 상세 조회 | ✅ MANAGER |
| PATCH | `/manager/users/{id}/suspend` | 유저 정지 | ✅ MANAGER |
| PATCH | `/manager/users/{id}/activate` | 유저 정지 해제 | ✅ MANAGER |
| GET | `/manager/reports` | 신고 목록 조회 | ✅ MANAGER |
| GET | `/manager/reports/{id}` | 신고 상세 조회 | ✅ MANAGER |
| PATCH | `/manager/reports/{id}/status` | 신고 상태 처리 | ✅ MANAGER |
| GET | `/manager/metrics/recommendation/daily` | 추천 알고리즘 일별 지표 | ✅ MANAGER |
| GET | `/manager/metrics/recommendation/summary` | 추천 알고리즘 요약 지표 | ✅ MANAGER |

---

## ERD 및 엔티티 설명

### DB 테이블 목록

`users` · `employers` · `workplaces` · `job_posts` · `applications` · `manager` · `resumes` · `careers` · `certificates` · `job_post_likes` · `resume_likes` · `reviews` · `notifications` · `reports` · `job_post_templates` · `job_post_click_logs` · `job_post_impression_logs`

### 주요 관계

```
User (1) ──── (1) Employer (1) ──── (N) Workplace (1) ──── (N) JobPost
User (1) ──── (1) Resume   (1) ──── (N) Career
                           (1) ──── (N) Certificate
User (N) ──── (N) JobPost  [via job_post_likes]
User (N) ──── (N) Resume   [via resume_likes]
User (1) ──── (N) Application ───── (1) JobPost
Application (1) ──── (N) Review
```

### Enum 정의

**ApplicationStatus** — 지원 상태

| 값 | 설명 |
|----|------|
| `APPLIED` | 구직자가 공고에 지원 |
| `OFFERED` | 고용주가 구직자에게 제안 |
| `PENDING` | 구직자가 제안 수락 (고용주 최종 확정 대기) |
| `HIRED` | 채용 확정 |
| `REJECTED` | 거절 |
| `COMPLETED` | 근무 완료 |

**UserRole** — 사용자 역할

| 값 | 설명 |
|----|------|
| `APPLICANT` | 구직자 |
| `EMPLOYER` | 고용주 |
| `MANAGER` | 매니저 |

**WageType** — 급여 유형

| 값 | 설명 |
|----|------|
| `HOURLY` | 시급 |
| `DAILY` | 일급 |
| `MONTHLY` | 월급 |

**ReviewTag** — 리뷰 태그

| 방향 | 태그 | 라벨 |
|------|------|------|
| 구직자→사업장 | `GOOD_PAY` | 급여가 정확했어요 |
| 구직자→사업장 | `GOOD_ATMOSPHERE` | 분위기가 좋았어요 |
| 구직자→사업장 | `CLEAR_DESCRIPTION` | 업무 설명이 명확했어요 |
| 구직자→사업장 | `KIND_EMPLOYER` | 사장님이 친절했어요 |
| 구직자→사업장 | `EASY_WORK` | 업무 강도가 적당했어요 |
| 구직자→사업장 | `GOOD_LOCATION` | 교통이 편리했어요 |
| 고용주→구직자 | `PUNCTUAL` | 시간을 잘 지켜요 |
| 고용주→구직자 | `HARD_WORKING` | 성실하게 일해요 |
| 고용주→구직자 | `QUICK_LEARNER` | 습득이 빨라요 |
| 고용주→구직자 | `GOOD_MANNER` | 매너가 좋아요 |
| 고용주→구직자 | `RESPONSIBLE` | 책임감이 강해요 |
| 고용주→구직자 | `WANT_REHIRE` | 다시 함께 일하고 싶어요 |

---

## 인증 방식

### JWT 기반 인증

- **Access Token**: 응답 body에 포함 (유효기간 1시간), 요청 시 `Authorization: Bearer {token}` 헤더 사용
- **Refresh Token**: `HttpOnly` 쿠키로 저장 (유효기간 7일), `/api/v1/refresh` 호출 시 자동 갱신

### 카카오 OAuth2

1. 프론트에서 카카오 인가 코드 획득
2. `POST /api/v1/auth/kakao?code={인가코드}` 호출
3. 서버에서 카카오 토큰 교환 → 사용자 정보 조회 → JWT 발급

---

## 공고 추천 알고리즘

`sortType=RECOMMENDED` 선택 시 아래 가중치 기반으로 공고 점수를 계산합니다.

| 항목 | 점수 |
|------|------|
| 지역 일치 — 도/시 | +10 |
| 지역 일치 — 시군구 | +20 |
| 지역 일치 — 동 | +30 |
| 최빈 카테고리 일치 | +20 |
| 근무 일정 미충돌 | +15 |
| 시급 상위 25% | +15 |
| 시급 50~75 백분위 | +10 |
| 시급 25~50 백분위 | +5 |
| 최신 공고 (7일 이내 / 24h 이내 등록) | +10 |
| 좋아요한 사업장 | +5 |
| 과거 HIRED 사업장 | +5 |
| 이미 지원한 공고 | -10 |

> 가중치는 `application.yml`의 `ranking.weights` 항목에서 조정 가능합니다.
