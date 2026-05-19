/** Lambda image-resizer 출력 variant (lambda/image-resizer/index.mjs 와 동기화) */
export type S3ImageVariant = 'thumb' | 'detail-lg';

const UPLOAD_FOLDERS = ['logos', 'profiles', 'job-posts'] as const;

/**
 * S3 원본 URL(uploads/...)을 리사이즈 URL(resized/{folder}/{variant}/...)로 변환.
 * 외부 URL·mock URL·이미 resized 인 경우 원본 그대로 반환.
 */
export function toResizedS3Url(
  url: string | null | undefined,
  variant: S3ImageVariant,
): string | undefined {
  if (!url?.trim()) return undefined;
  if (url.includes('/resized/')) return url;
  if (!url.includes('/uploads/')) return url;

  let resolvedVariant = variant;
  for (const folder of UPLOAD_FOLDERS) {
    const uploadSegment = `/uploads/${folder}/`;
    if (!url.includes(uploadSegment)) continue;

    // profiles 는 Lambda 에서 thumb 만 생성
    if (folder === 'profiles' && variant === 'detail-lg') {
      resolvedVariant = 'thumb';
    }

    return url.replace(uploadSegment, `/resized/${folder}/${resolvedVariant}/`);
  }

  return url;
}

/** Lambda 리사이즈 대상 S3 업로드 URL 여부 */
export function isS3UploadUrl(url: string | null | undefined): boolean {
  return Boolean(url?.includes('/uploads/'));
}
