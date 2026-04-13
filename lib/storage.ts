import { createHash } from "crypto";

import { buildS3Key, getDownloadSignedUrl, getUploadSignedUrl } from "@/lib/aws";

export type StorageProvider = "aws" | "supabase";

export function getStorageProvider(): StorageProvider {
  return process.env.STORAGE_PROVIDER === "aws" ? "aws" : "supabase";
}

export function buildStorageKey(studentId: string, fileName: string) {
  if (getStorageProvider() === "aws") {
    return buildS3Key(studentId, fileName);
  }

  return `${studentId}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
}

function signLocalToken(value: string) {
  const secret = process.env.LOCAL_STORAGE_SECRET || "local-dev-secret";
  return createHash("sha256").update(`${value}.${secret}`).digest("hex");
}

export function createLocalUploadUrl(s3Key: string) {
  const token = signLocalToken(s3Key);
  return `/api/storage/local-upload?key=${encodeURIComponent(s3Key)}&token=${token}`;
}

export function createLocalDownloadUrl(s3Key: string) {
  const token = signLocalToken(s3Key);
  return `/api/storage/local-download?key=${encodeURIComponent(s3Key)}&token=${token}`;
}

export function verifyLocalToken(s3Key: string, token: string) {
  return token === signLocalToken(s3Key);
}

export async function getUploadUrl(s3Key: string, contentType: string) {
  if (getStorageProvider() === "aws") {
    return getUploadSignedUrl(s3Key, contentType);
  }

  return createLocalUploadUrl(s3Key);
}

export async function getDownloadUrl(s3Key: string) {
  if (getStorageProvider() === "aws") {
    return getDownloadSignedUrl(s3Key);
  }

  return createLocalDownloadUrl(s3Key);
}

