import { NextResponse } from "next/server";

import { createSession, setSessionCookie, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.toString().trim().toLowerCase();
  const password = body?.password?.toString();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const session = await createSession(user.id);
  await setSessionCookie(session.token, session.expiresAt);

  return NextResponse.json({ ok: true });
}
