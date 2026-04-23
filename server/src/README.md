# WorkBridge (itda) 백엔드

> 고용주와 지원자를 연결하는 구인구직 플랫폼 백엔드 서버

---

## 기술 스택

- **Language**: Java 25
- **Framework**: Spring Boot 3.5
- **Database**: MySQL 8 (AWS RDS)
- **ORM**: Spring Data JPA (Hibernate)
- **Build**: Gradle
- **Storage**: AWS S3 (공고 상세 JSON)
- **Auth**: OAuth2.0 (카카오, 네이버) — 추후 적용 예정

---

## 프로젝트 구조

```
src/main/java/com/itda
├── config          # Security, Jackson 설정
├── controller      # API 엔드포인트
├── entity          # JPA 엔티티
├── enums           # Enum 타입
├── exception       # 예외 처리
├── repository      # DB 접근
└── service         # 비즈니스 로직
```

---

## 권한 (Role)

| 권한 | 설명 |
|------|------|
| `APPLICANT` | 공고 조회 및 지원 |
| `EMPLOYER` | 공고 등록, 채용/거절, 사업장 관리 |
| `MANAGER` | 고용주 위임 — 특정 사업장 관리 |

---

## DB 테이블 구조

| 테이블 | 설명 |
|--------|------|
| `users` | 유저 공통 테이블 (고용주/지원자/매니저) |
| `employers` | 고용주 프로필 |
| `workplaces` | 사업장 (업체 단위, 회사명/주소/사업자번호 포함) |
| `job_posts` | 공고 (핵심 필드 DB 저장, 상세 내용은 S3) |
| `applications` | 지원 및 고용 제안 |
| `managers` | 매니저 - 사업장 권한 매핑 |

---

## API 목록

### 공고 `/api/job-posts`

| 메서드 | URL | 설명 |
|--------|-----|------|
| `GET` | `/api/job-posts` | 모집중인 공고 전체 조회 |
| `GET` | `/api/job-posts/sort/wage` | 급여 높은 순 조회 |
| `GET` | `/api/job-posts/sort/deadline` | 마감 임박순 조회 |
| `GET` | `/api/job-posts/search?keyword=` | 키워드 검색 |
| `GET` | `/api/job-posts/{id}` | 공고 상세 조회 |
| `GET` | `/api/job-posts/employer/{employerId}` | 고용주 공고 목록 |
| `GET` | `/api/job-posts/employer/{employerId}/calendar?start=&end=` | 캘린더 날짜 범위 조회 |
| `POST` | `/api/job-posts?workplaceId=` | 공고 등록 |
| `PATCH` | `/api/job-posts/{id}/close` | 공고 마감 처리 |

### 지원 `/api/applications`

| 메서드 | URL | 설명 |
|--------|-----|------|
| `POST` | `/api/applications/apply?jobPostId=&applicantUserId=` | 지원자 → 공고 지원 |
| `POST` | `/api/applications/offer?jobPostId=&applicantUserId=` | 고용주 → 지원자 제안 |
| `PATCH` | `/api/applications/{id}/hire` | 채용 확정 |
| `PATCH` | `/api/applications/{id}/reject` | 거절 |
| `GET` | `/api/applications/job-post/{jobPostId}` | 공고별 지원자 목록 |
| `GET` | `/api/applications/applicant/{applicantUserId}` | 내 지원 목록 |

### 인증 `/api/auth` (테스트용, 추후 삭제 예정)

| 메서드 | URL | 설명 |
|--------|-----|------|
| `POST` | `/api/auth/register` | 테스트용 회원가입 |
| `POST` | `/api/auth/login` | 테스트용 로그인 |

---

## 지원 상태 흐름

```
지원자가 지원할 때
APPLIED → HIRED or REJECTED

고용주가 먼저 제안할 때
OFFERED → PENDING → HIRED or REJECTED
```

---

## 에러 응답 형식

```json
{
  "status": 404,
  "message": "공고를 찾을 수 없습니다."
}
```

| status | 설명 |
|--------|------|
| `200` | 성공 |
| `404` | 리소스 없음 |
| `409` | 중복 요청 |
| `500` | 서버 오류 |

---

## 로컬 실행 방법

### 1. 환경변수 설정
IntelliJ `Run > Edit Configurations > Environment variables`에 아래 값 추가:

```
DB_URL=jdbc:mysql://{RDS엔드포인트}:3306/recruitment?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
DB_USERNAME={DB유저명}
DB_PASSWORD={DB비밀번호}
```

### 2. 실행
```bash
./gradlew bootRun
```

---

## 추후 작업 예정

- OAuth2.0 카카오/네이버 로그인 연동
- JWT 토큰 발급 및 인증 적용
- AWS EC2 배포
- DTO 작성 (프론트 연동 시)
- S3 공고 상세 JSON 연동
