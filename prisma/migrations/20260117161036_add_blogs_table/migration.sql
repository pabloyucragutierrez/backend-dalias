/*
  Warnings:

  - You are about to drop the column `categoria` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the column `contenido` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `blogs` table. All the data in the column will be lost.
  - Added the required column `descripcionCorta` to the `blogs` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `blogs_slug_idx` ON `blogs`;

-- DropIndex
DROP INDEX `blogs_slug_key` ON `blogs`;

-- AlterTable
ALTER TABLE `blogs` DROP COLUMN `categoria`,
    DROP COLUMN `contenido`,
    DROP COLUMN `slug`,
    DROP COLUMN `tags`,
    ADD COLUMN `descripcionCorta` TEXT NOT NULL,
    MODIFY `descripcion` LONGTEXT NOT NULL;
