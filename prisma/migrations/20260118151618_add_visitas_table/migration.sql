-- CreateTable
CREATE TABLE `visitas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombreApellido` VARCHAR(191) NOT NULL,
    `correoElectronico` VARCHAR(191) NOT NULL,
    `edadAdultoMayor` INTEGER NOT NULL,
    `nivelDependencia` VARCHAR(191) NOT NULL,
    `observacionesSalud` TEXT NULL,
    `fechaSeleccionada` VARCHAR(191) NOT NULL,
    `horaSeleccionada` VARCHAR(191) NOT NULL,
    `evaluacion` JSON NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'pendiente',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `visitas_fechaSeleccionada_horaSeleccionada_key`(`fechaSeleccionada`, `horaSeleccionada`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
