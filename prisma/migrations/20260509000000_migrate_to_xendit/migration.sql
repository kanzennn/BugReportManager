-- Rename stripe fields to xendit equivalents on User
ALTER TABLE `User` DROP INDEX `User_stripeCustomerId_key`;
ALTER TABLE `User` CHANGE `stripeCustomerId` `xenditCustomerId` VARCHAR(191) NULL;
ALTER TABLE `User` ADD UNIQUE INDEX `User_xenditCustomerId_key`(`xenditCustomerId`);

ALTER TABLE `User` DROP INDEX `User_stripeSubscriptionId_key`;
ALTER TABLE `User` CHANGE `stripeSubscriptionId` `xenditSubscriptionId` VARCHAR(191) NULL;
ALTER TABLE `User` ADD UNIQUE INDEX `User_xenditSubscriptionId_key`(`xenditSubscriptionId`);

-- Rename stripePaymentId to paymentId on Transaction
ALTER TABLE `Transaction` DROP INDEX `Transaction_stripePaymentId_key`;
ALTER TABLE `Transaction` CHANGE `stripePaymentId` `paymentId` VARCHAR(191) NULL;
ALTER TABLE `Transaction` ADD UNIQUE INDEX `Transaction_paymentId_key`(`paymentId`);

-- Rename stripePriceId to planKey on PlanConfig
ALTER TABLE `PlanConfig` CHANGE `stripePriceId` `planKey` VARCHAR(191) NOT NULL DEFAULT '';
