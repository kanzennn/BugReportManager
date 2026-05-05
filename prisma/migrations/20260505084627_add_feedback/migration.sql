-- CreateTable
CREATE TABLE `Feedback` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('GENERAL', 'SUGGESTION', 'COMPLAINT', 'COMPLIMENT') NOT NULL DEFAULT 'GENERAL',
    `status` ENUM('NEW', 'READ', 'ARCHIVED') NOT NULL DEFAULT 'NEW',
    `rating` INTEGER NULL,
    `reporterEmail` VARCHAR(191) NULL,
    `appVersion` VARCHAR(191) NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Feedback_applicationId_idx`(`applicationId`),
    INDEX `Feedback_status_idx`(`status`),
    INDEX `Feedback_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
