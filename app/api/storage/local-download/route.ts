import { readFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { verifyLocalToken } from "@/lib/storage";

function getLocalPath(s3Key: string) {
  return path.join(process.cwd(), ".local-storage", s3Key);
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const token = url.searchParams.get("token");

  if (!key || !token || !verifyLocalToken(key, token)) {
    return NextResponse.json({ error: "Invalid download token." }, { status: 400 });
  }

  const filePath = getLocalPath(key);
  const data = await readFile(filePath).catch(() => null);

  if (!data) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${path.basename(key)}"`,
    },
  });
}
