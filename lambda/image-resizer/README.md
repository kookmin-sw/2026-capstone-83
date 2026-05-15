# 이미지 리사이징 Lambda

S3에 이미지가 업로드되면 자동으로 리사이징하는 Lambda 함수.

## 리사이징 규격

| 원본 경로 | 리사이즈 경로 | 크기 | 용도 |
|---|---|---|---|
| `uploads/profiles/` | `resized/profiles/` | 320x360 (cover) | 이력서 프로필 |
| `uploads/logos/` | `resized/logos/` | 600x400 (inside) | 회사 로고 |

- `uploads/job-posts/`는 리사이징 대상이 아님 (원본 그대로 사용)
- `withoutEnlargement: true` — 원본이 더 작으면 확대하지 않음
- JPEG 80% 품질로 변환

## 배포 방법

### 1. 로컬에서 빌드 (Lambda용 zip)

```bash
cd lambda/image-resizer
npm install --platform=linux --arch=x64
zip -r function.zip index.mjs node_modules
```

> sharp는 네이티브 바이너리이므로 반드시 `--platform=linux`로 설치해야 Lambda에서 동작합니다.

### 2. AWS Lambda 설정

- 런타임: Node.js 20.x
- 핸들러: `index.handler`
- 메모리: 256MB
- 타임아웃: 30초
- IAM 권한: S3 GetObject + PutObject (같은 버킷)

### 3. S3 이벤트 트리거 설정

- 버킷: `pj-kmucd2-3-itda-s3`
- 이벤트 유형: `s3:ObjectCreated:*`
- Prefix 필터: `uploads/` (profiles/ 와 logos/ 모두 포함)
- **주의**: `resized/` 폴더에는 트리거를 걸지 않음 (무한 루프 방지)

## 서버 코드 변경 사항

S3Service.upload()에서:
- 프로필: `profiles/` → `uploads/profiles/`
- 로고: `logos/` → `uploads/logos/`
- 공고 이미지: `job-posts/` → 그대로 유지 (리사이징 안 함)

프론트에서 이미지 표시 시:
- 원본 URL의 `uploads/`를 `resized/`로 교체하면 리사이즈된 이미지 사용 가능
- 리사이즈 완료 전에는 원본 URL을 fallback으로 사용
