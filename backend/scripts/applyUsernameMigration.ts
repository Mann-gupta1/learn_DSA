import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Applying username migration...');
  
  // Add username column (nullable first)
  await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;`;
  
  // Set default username for existing users
  await prisma.$executeRaw`
    UPDATE "User" 
    SET "username" = LOWER(SPLIT_PART("email", '@', 1)) || '_' || SUBSTRING("id", 1, 8) 
    WHERE "username" IS NULL;
  `;
  
  // Make username required
  await prisma.$executeRaw`ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;`;
  
  // Create unique index
  await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");`;
  
  console.log('Migration applied successfully!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

