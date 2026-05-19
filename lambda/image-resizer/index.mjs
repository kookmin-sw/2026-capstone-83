import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3 = new S3Client({ region: 'us-east-1' });

/**
 * 폴더별 리사이징 규격
 * variants 배열 안에 필요한 사이즈를 원하는 만큼 추가 가능
 *
 * fit 옵션:
 *   cover  — 비율 유지하며 꽉 채움 (넘치는 부분 잘림) → 프로필처럼 고정 비율 필요할 때
 *   inside — 비율 유지하며 지정 크기 안에 맞춤 (여백 없음) → 로고/공고 이미지처럼 원본 비율 유지할 때
 */
const RESIZE_CONFIG = {
  'uploads/logos/': [
    { suffix: 'detail-lg', width: 1280, height: 853, fit: 'inside' },
    { suffix: 'thumb',     width: 96,   height: 96,  fit: 'cover'  },
  ],
  'uploads/job-posts/': [
    { suffix: 'detail-lg', width: 1280, height: 853, fit: 'inside' },
    { suffix: 'thumb',     width: 96,   height: 96,  fit: 'cover'  },
  ],
  'uploads/profiles/': [
    { suffix: 'thumb',     width: 96,   height: 96,  fit: 'cover'  },
  ],
};

export const handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key    = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' ')
  );

  console.log(`Processing: ${bucket}/${key}`);

  // 리사이징 대상 폴더인지 확인
  const matchedPrefix = Object.keys(RESIZE_CONFIG)
    .find(prefix => key.startsWith(prefix));

  if (!matchedPrefix) {
    console.log(`Skipping: ${key} (not a resize target)`);
    return { statusCode: 200, body: 'Skipped' };
  }

  const variants = RESIZE_CONFIG[matchedPrefix];

  // S3에서 원본 이미지 한 번만 가져오기
  const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response   = await s3.send(getCommand);
  const inputBuffer = Buffer.from(await response.Body.transformToByteArray());

  // 파일명 추출 (경로에서 prefix 제거)
  // ex) uploads/logos/uuid_logo.jpg → uuid_logo.jpg
  const fileName = key.slice(matchedPrefix.length);

  // 모든 variant를 병렬로 처리
  const results = await Promise.allSettled(
    variants.map(variant => resizeAndUpload({
      bucket,
      inputBuffer,
      matchedPrefix,
      fileName,
      variant,
    }))
  );

  // 실패한 variant 로깅
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.error(
        `Failed variant [${variants[i].suffix}] for ${key}:`,
        result.reason
      );
    }
  });

  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  console.log(`Done: ${key} → ${succeeded}/${variants.length} variants`);

  return {
    statusCode: 200,
    body: JSON.stringify({
      original: key,
      variants: results.map((r, i) => ({
        suffix: variants[i].suffix,
        status: r.status,
        key:    r.value ?? null,
      })),
    }),
  };
};

/**
 * 단일 variant 리사이징 + S3 업로드
 *
 * 출력 경로 규칙:
 *   uploads/{folder}/{fileName}
 *     → resized/{folder}/{suffix}/{fileName}
 *
 * 예시:
 *   uploads/logos/uuid_logo.jpg + suffix=detail-lg
 *     → resized/logos/detail-lg/uuid_logo.jpg
 */
async function resizeAndUpload({ bucket, inputBuffer, matchedPrefix, fileName, variant }) {
  const { suffix, width, height, fit } = variant;

  // uploads/ → resized/ 교체 후 suffix 폴더 삽입
  // matchedPrefix: "uploads/logos/"  →  "resized/logos/"
  const resizedPrefix = matchedPrefix.replace('uploads/', 'resized/');
  const resizedKey    = `${resizedPrefix}${suffix}/${fileName}`;

  const resizedBuffer = await sharp(inputBuffer)
    .resize(width, height, { fit, withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  await s3.send(new PutObjectCommand({
    Bucket:      bucket,
    Key:         resizedKey,
    Body:        resizedBuffer,
    ContentType: 'image/jpeg',
  }));

  console.log(`Resized → ${resizedKey} (${width}×${height}, fit:${fit})`);
  return resizedKey;
}