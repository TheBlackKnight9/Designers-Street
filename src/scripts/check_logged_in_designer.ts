import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { designerHouse: true },
  });
  console.log("Users & owned designer houses:");
  users.forEach((u) => {
    console.log(`User: ${u.id} (${u.email}, role: ${u.role}) -> DesignerHouse: ${u.designerHouse?.id} (${u.designerHouse?.name})`);
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
