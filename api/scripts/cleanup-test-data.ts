import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.property.deleteMany({
    where: { scrapedFrom: 'realestateonline.gr' },
  });
  console.log(`Deleted ${result.count} test properties`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
