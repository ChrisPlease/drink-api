/*
  Warnings:

  - You are about to drop the column `metric_size` on the `nutrition` table. All the data in the column will be lost.
  - You are about to drop the column `serving_size` on the `nutrition` table. All the data in the column will be lost.
  - You are about to drop the column `serving_unit` on the `nutrition` table. All the data in the column will be lost.
  - Added the required column `metric_size` to the `drinks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serving_size` to the `drinks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serving_unit` to the `drinks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "drinks" ADD COLUMN     "metric_size" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "serving_size" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "serving_unit" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "nutrition" DROP COLUMN "metric_size",
DROP COLUMN "serving_size",
DROP COLUMN "serving_unit";
