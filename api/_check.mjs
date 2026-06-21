import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user1 = await prisma.user.findUnique({ where: { id: 1 } });
  console.log('User 1:', user1 ? `${user1.email} role:${user1.role}` : 'NOT FOUND');

  const users = await prisma.user.findMany({ take: 3 });
  console.log('Users:', users.map(u => ({ id: u.id, email: u.email, role: u.role })));

  const count = await prisma.property.count({ where: { scrapedFrom: 'tayara' } });
  console.log('Properties with scrapedFrom=tayara:', count);

  if (count > 0) {
    const sample = await prisma.property.findFirst({ where: { scrapedFrom: 'tayara' } });
    console.log('Sample:', JSON.stringify(sample, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
  } else {
    const total = await prisma.property.count();
    console.log('Total properties in DB:', total);
    if (total > 0) {
      const anyProp = await prisma.property.findFirst();
      console.log('Any property:', JSON.stringify(anyProp, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
    }
  }

  await prisma.$disconnect();
}
main().catch(e => console.error(e));
