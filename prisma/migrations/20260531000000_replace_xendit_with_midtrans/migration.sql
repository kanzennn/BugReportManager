-- Drop Xendit-specific unique indexes
DROP INDEX `User_xenditCustomerId_key` ON `User`;
DROP INDEX `User_xenditSubscriptionId_key` ON `User`;

-- Remove Xendit columns and add Midtrans column
ALTER TABLE `User`
  DROP COLUMN `xenditCustomerId`,
  DROP COLUMN `xenditSubscriptionId`,
  ADD COLUMN `midtransSubscriptionId` VARCHAR(191) NULL;

-- Add unique constraint for midtransSubscriptionId
CREATE UNIQUE INDEX `User_midtransSubscriptionId_key` ON `User`(`midtransSubscriptionId`);
