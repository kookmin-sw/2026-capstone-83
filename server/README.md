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
| Deploy | AWS EC2 + GitHub Actions (자동 배포) |

---

## 프로젝트 구조

```
server/
└── src/main/java/com/itda/
    ├── config/           # Security, JWT, CORS, Jackson 설정
    ├── controller/       # REST API 컨트롤러
    ├── service/          # 비즈니스 로직
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

---

## API 명세

Base URL: `http://44.207.95.136:8080/api/v1`

인증이 필요한 API는 요청 헤더에 `Authorization: Bearer {accessToken}`을 포함해야 합니다.

---

### 🔐 인증 (Auth)

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

### 📢 공고 (JobPost)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/job-posts` | 공고 목록 조회 (필터 + 커서 페이지네이션) | ❌ |
| GET | `/job-posts/{id}` | 공고 상세 조회 | ❌ |
| POST | `/job-posts?workplaceId=` | 공고 등록 (multipart/form-data) | ✅ |
| PATCH | `/job-posts/{id}/close` | 공고 마감 처리 | ✅ |
| GET | `/job-posts/employer/{employerId}` | 고용주 본인 공고 목록 | ✅ |
| GET | `/job-posts/employer/{employerId}/calendar?start=&end=` | 캘린더용 날짜 범위 공고 조회 | ✅ |

**공고 목록 쿼리 파라미터**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `cursor` | Long | 마지막으로 받은 공고 ID (첫 요청 시 생략) |
| `size` | int | 한 번에 가져올 개수 (기본값 10) |
| `keyword` | String | 제목 검색어 |
| `jobCategory` | String | 업종 대분류 필터 |
| `location` | String | 근무지 필터 |
| `sortType` | String | 정렬 방식 |

---

### 🏢 사업장 (Workplace)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/workplaces/me` | 내 사업장 목록 조회 (로그인 고용주 기준) | ✅ |
| GET | `/workplaces/{id}` | 사업장 단건 조회 (본인 소유만) | ✅ |
| POST | `/workplaces` | 사업장 등록 | ✅ |
| PUT | `/workplaces/{id}` | 사업장 수정 (부분 수정 — null 필드는 기존 값 유지) | ✅ |
| DELETE | `/workplaces/{id}` | 사업장 삭제 (본인 소유 + 연결 공고 0건일 때만) | ✅ |

**요청 예시 — 사업장 등록 / 수정 (POST · PUT)**
```json
{
  "name": "성수 1현장",
  "companyName": "워크브릿지 건설",
  "businessNumber": "123-45-67890",
  "address": "서울 성동구 성수동 1가 656",
  "companyLogoUrl": "https://.../logo.png"
}
```
> 회사 로고 이미지는 S3 업로드 연동 전까지 `companyLogoUrl`(이미 업로드된 URL)로 전달합니다.

**응답 예시 — 사업장 조회 / 등록 (200 · 201)**
```json
{
  "id": 12,
  "name": "성수 1현장",
  "companyName": "워크브릿지 건설",
  "businessNumber": "123-45-67890",
  "address": "서울 성동구 성수동 1가 656",
  "companyLogoUrl": "https://.../logo.png"
}
```

**삭제 응답 코드**

| 코드 | 설명 |
|------|------|
| 204 | 삭제 성공 (No Content) |
| 403 | 본인 소유 사업장이 아님 |
| 404 | 사업장을 찾을 수 없음 |
| 409 | 연결된 공고가 존재 — 공고를 먼저 정리해야 함 |

> 본인 소유 검증은 모든 단건 API(`GET`/`PUT`/`DELETE /{id}`)에 공통 적용됩니다. 다른 사용자의 사업장을 조회/수정 시도하면 403이 반환됩니다.

---

### 📝 지원 (Application)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | `/job-posts/{id}/apply` | 공고 지원 | ✅ |
| GET | `/job-posts/{id}/applied` | 지원 여부 확인 | ✅ |
| GET | `/worker/applications?status=` | 내 지원 내역 조회 | ✅ |
| GET | `/worker/schedule?fromDate=&toDate=` | 근무 일정 조회 | ✅ |
| POST | `/applications/{id}/accept-offer` | 제안 수락 (OFFERED → PENDING) | ✅ |
| GET | `/job-posts/{id}/applicants` | 지원자 목록 조회 (고용주) | ✅ |
| POST | `/applications/{id}/accept` | 지원자 채용 확정 (고용주) | ✅ |
| POST | `/applications/{id}/reject` | 지원자 거절 (고용주) | ✅ |

**지원 상태 흐름**

```
구직자 지원     고용주 제안
    │               │
  APPLIED        OFFERED
    │               │
    │         구직자 수락
    │               │
    └──────▶ PENDING ◀─────────┐
                │               │
          고용주 최종 확정    고용주 거절
                │               │
              HIRED          REJECTED
```

---

### 📄 이력서 (Resume)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/resume` | 내 이력서 조회 | ✅ |
| PUT | `/resume` | 이력서 등록/수정 | ✅ |
| POST | `/resume/careers` | 경력 추가 | ✅ |
| PUT | `/resume/careers/{id}` | 경력 수정 | ✅ |
| DELETE | `/resume/careers/{id}` | 경력 삭제 | ✅ |
| GET | `/resumes` | 인재 목록 조회 (커서 페이지네이션) | ✅ |

---

### ❤️ 좋아요 (Like)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | `/job-posts/{id}/like` | 공고 좋아요 토글 (구직자) | ✅ |
| POST | `/resumes/{id}/like` | 이력서 좋아요 토글 (고용주) | ✅ |

> 좋아요한 항목은 목록 상단에 노출됩니다.

---

## ERD 및 엔티티 설명

### DB 테이블 목록

`users` · `employers` · `workplaces` · `job_posts` · `applications` · `manager` · `resumes` · `careers` · `job_post_likes` · `resume_likes`

### 주요 관계

```
User (1) ──── (1) Employer (1) ──── (N) Workplace (1) ──── (N) JobPost
User (1) ──── (1) Resume   (1) ──── (N) Career
User (N) ──── (N) JobPost  [via job_post_likes]
User (N) ──── (N) Resume   [via resume_likes]
User (1) ──── (N) Application ───── (N) JobPost
```

### Enum 정의

**ApplicationStatus** - 지원 상태

| 값 | 설명 |
|----|------|
| `APPLIED` | 구직자가 공고에 지원 |
| `OFFERED` | 고용주가 구직자에게 제안 |
| `PENDING` | 구직자가 제안 수락 (고용주 최종 확정 대기) |
| `HIRED` | 채용 확정 |
| `REJECTED` | 거절 |

**UserRole** - 사용자 역할

| 값 | 설명 |
|----|------|
| `APPLICANT` | 구직자 |
| `EMPLOYER` | 고용주 |
| `MANAGER` | 매니저 |

**WageType** - 급여 유형

| 값 | 설명 |
|----|------|
| `HOURLY` | 시급 |
| `DAILY` | 일급 |
| `MONTHLY` | 월급 |

**JobPostStatus** - 공고 상태

| 값 | 설명 |
|----|------|
| `OPEN` | 모집 중 |
| `CLOSED` | 마감 |
| `CANCELLED` | 취소 |

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

## 미구현 / 예정 기능

| 기능 | 상태 |
|------|------|
| S3 이미지 업로드 | 🔲 미구현 |
| Manager Service/Controller | 🔲 미구현 |
| SSE 실시간 알림 (승인/확정 시) | 🔲 미구현 |
| CORS 허용 도메인 EC2 주소 추가 | 🔲 미구현 |
| 사업장(Workplace) CRUD | ✅ 구현 완료 |
