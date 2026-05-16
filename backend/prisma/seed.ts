import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PLACEHOLDER_USER_ID } from '../src/card/constants';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL environment variable is not set');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

async function main() {
  await prisma.user.upsert({
    where: { id: PLACEHOLDER_USER_ID },
    update: {},
    create: {
      id: PLACEHOLDER_USER_ID,
      googleId: 'placeholder',
      email: 'placeholder@importrad.local',
      name: 'Placeholder User',
    },
  });
  console.log(`Placeholder user upserted: ${PLACEHOLDER_USER_ID}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
