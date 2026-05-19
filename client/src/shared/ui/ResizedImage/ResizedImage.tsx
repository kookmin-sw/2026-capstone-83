import { useEffect, useMemo, useState, type ImgHTMLAttributes } from 'react';
import styled from 'styled-components';
import { toResizedS3Url, type S3ImageVariant } from 'shared/lib/s3ImageUrl';

export type { S3ImageVariant };

const DEFAULT_FALLBACK = 'https://picsum.photos/400/300';

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  variant: S3ImageVariant;
  fallbackSrc?: string;
  fit?: 'cover' | 'contain' | 'fill' | 'none';
}

const StyledImg = styled.img<{ $fit?: Props['fit'] }>`
  ${({ $fit }) => $fit && `object-fit: ${$fit};`}
`;

/**
 * S3 업로드 이미지를 Lambda 리사이즈 URL로 표시.
 * 로드 실패 시 원본 → fallback 순으로 대체.
 */
const ResizedImage = ({
  src,
  variant,
  fallbackSrc = DEFAULT_FALLBACK,
  fit,
  alt = '',
  ...rest
}: Props) => {
  const originalSrc = src?.trim() ?? '';

  const preferredSrc = useMemo(() => {
    if (!originalSrc) return fallbackSrc;
    const resized = toResizedS3Url(originalSrc, variant);
    return resized ?? originalSrc;
  }, [originalSrc, variant, fallbackSrc]);

  const [currentSrc, setCurrentSrc] = useState(preferredSrc);

  useEffect(() => {
    setCurrentSrc(preferredSrc);
  }, [preferredSrc]);

  const handleError = () => {
    if (originalSrc && currentSrc !== originalSrc) {
      setCurrentSrc(originalSrc);
      return;
    }
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <StyledImg
      src={currentSrc}
      alt={alt}
      onError={handleError}
      $fit={fit}
      {...rest}
    />
  );
};

export default ResizedImage;
