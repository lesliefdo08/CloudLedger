import { NextResponse } from "next/server";

import { clearSessionCookie, deleteSessionByToken, getCurrentSessionToken } from "@/lib/auth";

export async function POST() {
  const token = await getCurrentSessionToken();
  if (token) {
    await deleteSessionByToken(token);
  }

  await clearSessionCookie();

  return NextResponse.json({ ok: true });
}
