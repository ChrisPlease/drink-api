/*
  Warnings:

  - The primary key for the `nutrition` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `addedSugar` on the `nutrition` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `nutrition` table. All the data in the column will be lost.
  - You are about to alter the column `serving_size` on the `nutrition` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Added the required column `imperial_size` to the `nutrition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metric_size` to the `nutrition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serving_unit` to the `nutrition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "nutrition" DROP CONSTRAINT "Nutrition_pkey",
DROP COLUMN "addedSugar",
DROP COLUMN "id",
ADD COLUMN     "added_sugar" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "imperial_size" INTEGER NOT NULL,
ADD COLUMN     "metric_size" INTEGER NOT NULL,
ADD COLUMN     "serving_unit" TEXT NOT NULL,
ALTER COLUMN "serving_size" SET DATA TYPE INTEGER;

-- RenameForeignKey
ALTER TABLE "nutrition" RENAME CONSTRAINT "Nutrition_drink_id_fkey" TO "nutrition_drink_id_fkey";

-- RenameIndex
ALTER INDEX "Nutrition_drink_id_key" RENAME TO "nutrition_drink_id_key";
