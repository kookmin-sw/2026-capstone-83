import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3 = new S3Client({ region: 'us-east-1' });

// 폴더별 리사이징 규격
const RESIZE_CONFIG = {
  'uploads/profiles/': { width: 320, height: 360, fit: 'cover' },   // 이력서 프로필 (Retina 2x)
  'uploads/logos/':    { width: 600, height: 400, fit: 'inside' },   // 회사 로고 (Retina 2x)
};

export const handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

  console.log(`Processing: ${bucket}/${key}`);

  // 리사이징 대상 폴더인지 확인
  const matchedPrefix = Object.keys(RESIZE_CONFIG).find(prefix => key.startsWith(prefix));
  if (!matchedPrefix) {
    console.log(`Skipping: ${key} (not a resize target)`);
    return { statusCode: 200, body: 'Skipped' };
  }

  const config = RESIZE_CONFIG[matchedPrefix];

  try {
    // S3에서 원본 이미지 가져오기
    const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3.send(getCommand);
    const inputBuffer = Buffer.from(await response.Body.transformToByteArray());

    // sharp로 리사이징
    const resizedBuffer = await sharp(inputBuffer)
      .resize(config.width, config.height, { fit: config.fit, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    // 리사이즈된 이미지 저장 경로: uploads/ → resized/
    const resizedKey = key.replace('uploads/', 'resized/');

    const putCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: resizedKey,
      Body: resizedBuffer,
      ContentType: 'image/jpeg',
    });
    await s3.send(putCommand);

    console.log(`Resized: ${resizedKey} (${config.width}x${config.height})`);

    return {
      statusCode: 200,
      body: JSON.stringify({ original: key, resized: resizedKey }),
    };
  } catch (error) {
    console.error(`Error processing ${key}:`, error);
    throw error;
  }
};
