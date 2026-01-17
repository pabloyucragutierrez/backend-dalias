-- CreateTable
CREATE TABLE `blogs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `contenido` LONGTEXT NOT NULL,
    `imagen` VARCHAR(191) NULL,
    `imagePublicId` VARCHAR(191) NULL,
    `slug` VARCHAR(191) NOT NULL,
    `categoria` VARCHAR(191) NOT NULL,
    `tags` TEXT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'borrador',
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blogs_slug_key`(`slug`),
    INDEX `blogs_userId_idx`(`userId`),
    INDEX `blogs_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blogs` ADD CONSTRAINT `blogs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
