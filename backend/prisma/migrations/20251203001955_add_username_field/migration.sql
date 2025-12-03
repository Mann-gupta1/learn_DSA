-- AlterTable
-- Add username column (nullable first to handle existing users)
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Set default username for existing users (using email prefix or id)
UPDATE "User" SET "username" = LOWER(SPLIT_PART("email", '@', 1)) || '_' || SUBSTRING("id", 1, 8) WHERE "username" IS NULL;

-- Make username required and unique
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
