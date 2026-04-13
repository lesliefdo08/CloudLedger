import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/storage";

type Params = {
  params: Promise<{ fileId: string }>;
};

export async function GET(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileId } = await params;
  const url = new URL(request.url);
  const version = Number(url.searchParams.get("version") || "0");

  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: { versions: true },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  let s3Key = file.s3Key;

  if (version > 0) {
    const targetVersion = file.versions.find((item) => item.version === version);
    if (!targetVersion) {
      return NextResponse.json({ error: "Version not found." }, { status: 404 });
    }
    s3Key = targetVersion.s3Key;
  }

  const downloadUrl = await getDownloadUrl(s3Key);
  return NextResponse.redirect(downloadUrl);
}
