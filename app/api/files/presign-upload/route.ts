import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildStorageKey, getStorageProvider, getUploadUrl } from "@/lib/storage";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const studentId = body?.studentId?.toString();
  const fileName = body?.fileName?.toString();
  const mimeType = body?.mimeType?.toString() || "application/octet-stream";

  if (!studentId || !fileName) {
    return NextResponse.json({ error: "studentId and fileName are required." }, { status: 400 });
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const s3Key = buildStorageKey(studentId, fileName);
  const uploadUrl = await getUploadUrl(s3Key, mimeType);

  return NextResponse.json({
    provider: getStorageProvider(),
    uploadUrl,
    s3Key,
  });
}
