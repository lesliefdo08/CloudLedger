import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { verifyLocalToken } from "@/lib/storage";

function getLocalPath(s3Key: string) {
  return path.join(process.cwd(), ".local-storage", s3Key);
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const token = url.searchParams.get("token");

  if (!key || !token || !verifyLocalToken(key, token)) {
    return NextResponse.json({ error: "Invalid upload token." }, { status: 400 });
  }

  const fileBuffer = Buffer.from(await request.arrayBuffer());
  const filePath = getLocalPath(key);

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, fileBuffer);

  return new NextResponse(null, { status: 200 });
}
