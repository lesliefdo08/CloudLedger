import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "cloudledger_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [salt, savedHash] = passwordHash.split(":");
  if (!salt || !savedHash) {
    return false;
  }

  const hashBuffer = scryptSync(password, salt, 64);
  const savedBuffer = Buffer.from(savedHash, "hex");

  if (hashBuffer.length !== savedBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, savedBuffer);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => null);
    return null;
  }

  return session.user;
}

export async function getCurrentSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function deleteSessionByToken(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}
