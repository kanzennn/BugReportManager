ALTER TABLE `User`
  ADD COLUMN `resetToken` VARCHAR(191) NULL,
  ADD COLUMN `resetTokenExpiresAt` DATETIME(3) NULL;

CREATE UNIQUE INDEX `User_resetToken_key` ON `User`(`resetToken`);
