import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const requiredEnv = ["AWS_REGION", "AWS_S3_BUCKET", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"] as const;

function hasAwsConfig() {
  return requiredEnv.every((name) => Boolean(process.env[name]));
}

function getS3Client() {
  if (!hasAwsConfig()) {
    throw new Error("Missing AWS S3 environment variables.");
  }

  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

function getBucketName() {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    throw new Error("AWS_S3_BUCKET is not set.");
  }
  return bucket;
}

function cleanFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function buildS3Key(studentId: string, fileName: string) {
  return `${studentId}/${Date.now()}-${cleanFileName(fileName)}`;
}

export async function getUploadSignedUrl(s3Key: string, contentType: string) {
  const client = getS3Client();
  const bucket = getBucketName();

  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      ContentType: contentType,
    }),
    { expiresIn: 60 * 5 },
  );
}

export async function getDownloadSignedUrl(s3Key: string) {
  const client = getS3Client();
  const bucket = getBucketName();

  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: s3Key,
    }),
    { expiresIn: 60 * 5 },
  );
}
