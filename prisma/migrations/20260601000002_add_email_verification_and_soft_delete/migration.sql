-- AlterTable: add email verification fields and soft delete fields
ALTER TABLE `User` ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `User` ADD COLUMN `emailVerifyToken` VARCHAR(191) NULL;
ALTER TABLE `User` ADD COLUMN `emailVerifyTokenExpiresAt` DATETIME(3) NULL;
ALTER TABLE `User` ADD COLUMN `deletedAt` DATETIME(3) NULL;
ALTER TABLE `User` ADD COLUMN `deleteToken` VARCHAR(191) NULL;
ALTER TABLE `User` ADD COLUMN `deleteTokenExpiresAt` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_emailVerifyToken_key` ON `User`(`emailVerifyToken`);

-- CreateIndex
CREATE UNIQUE INDEX `User_deleteToken_key` ON `User`(`deleteToken`);
