import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.companyConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      companyName: "OMT Elektro",
      primaryColor: "#1e3a5f",
      emailRecipient: "kontor@example.com",
    },
  });
  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
