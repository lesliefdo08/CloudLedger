import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const studentId = body?.studentId?.toString();
  const fileId = body?.fileId?.toString() || null;
  const title = body?.title?.toString().trim();
  const originalName = body?.originalName?.toString();
  const mimeType = body?.mimeType?.toString() || "application/octet-stream";
  const s3Key = body?.s3Key?.toString();

  if (!studentId || !originalName || !s3Key) {
    return NextResponse.json({ error: "studentId, originalName and s3Key are required." }, { status: 400 });
  }

  if (fileId) {
    const existingFile = await prisma.file.findUnique({
      where: { id: fileId },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    });

    if (!existingFile) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    const nextVersion = (existingFile.versions[0]?.version ?? 0) + 1;

    const updatedFile = await prisma.$transaction(async (tx) => {
      const file = await tx.file.update({
        where: { id: fileId },
        data: {
          originalName,
          mimeType,
          s3Key,
          title: title || existingFile.title,
        },
      });

      await tx.fileVersion.create({
        data: {
          fileId,
          version: nextVersion,
          s3Key,
          originalName,
          mimeType,
        },
      });

      return file;
    });

    return NextResponse.json(updatedFile);
  }

  if (!title) {
    return NextResponse.json({ error: "title is required for a new file." }, { status: 400 });
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const createdFile = await prisma.$transaction(async (tx) => {
    const file = await tx.file.create({
      data: {
        studentId,
        title,
        originalName,
        mimeType,
        s3Key,
      },
    });

    await tx.fileVersion.create({
      data: {
        fileId: file.id,
        version: 1,
        s3Key,
        originalName,
        mimeType,
      },
    });

    return file;
  });

  return NextResponse.json(createdFile);
}
