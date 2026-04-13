import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const firstName = body?.firstName?.toString().trim();
  const lastName = body?.lastName?.toString().trim();
  const email = body?.email?.toString().trim().toLowerCase() || null;
  const department = body?.department?.toString().trim() || null;

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "First name and last name are required." }, { status: 400 });
  }

  const student = await prisma.student.create({
    data: {
      firstName,
      lastName,
      email,
      department,
    },
  });

  return NextResponse.json(student);
}
