-- Add onboarding fields to User
ALTER TABLE `User`
  ADD COLUMN `agreedToTermsAt` DATETIME(3) NULL,
  ADD COLUMN `heardFrom` VARCHAR(191) NULL,
  ADD COLUMN `userType` VARCHAR(191) NULL;
