import { randomBytes, scryptSync } from "crypto";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@cloudledger.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = hashPassword(adminPassword);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
    },
    create: {
      email: adminEmail,
      passwordHash,
    },
  });

  console.log(`Seeded admin user: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
