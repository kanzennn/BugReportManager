/*
  Warnings:

  - You are about to alter the column `trelloCardUrl` on the `BugReport` table. The data in that column could be lost. The data in that column will be cast from `VarChar(512)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Application` MODIFY `trelloToken` TEXT NULL;

-- AlterTable
ALTER TABLE `BugReport` MODIFY `trelloCardUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `locale` VARCHAR(191) NOT NULL DEFAULT 'en';
