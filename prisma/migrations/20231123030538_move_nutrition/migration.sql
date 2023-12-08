/*
  Warnings:

  - You are about to drop the column `caffeine` on the `drinks` table. All the data in the column will be lost.
  - You are about to drop the column `coefficient` on the `drinks` table. All the data in the column will be lost.
  - You are about to drop the column `serving_size` on the `drinks` table. All the data in the column will be lost.
  - You are about to drop the column `sugar` on the `drinks` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "drinks_id_caffeine_key";

-- DropIndex
DROP INDEX "drinks_id_coefficient_key";

-- DropIndex
DROP INDEX "drinks_id_sugar_key";

-- AlterTable
ALTER TABLE "drinks" DROP COLUMN "caffeine",
DROP COLUMN "coefficient",
DROP COLUMN "serving_size",
DROP COLUMN "sugar",
ADD COLUMN     "upc" VARCHAR(12);

-- CreateTable
CREATE TABLE "nutrition" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "coefficient" DOUBLE PRECISION DEFAULT 100,
    "serving_size" DOUBLE PRECISION NOT NULL,
    "calories" DOUBLE PRECISION DEFAULT 0,
    "saturated_fat" DOUBLE PRECISION DEFAULT 0,
    "total_fat" DOUBLE PRECISION DEFAULT 0,
    "cholesterol" DOUBLE PRECISION DEFAULT 0,
    "sodium" DOUBLE PRECISION DEFAULT 0,
    "carbohydrates" DOUBLE PRECISION DEFAULT 0,
    "fiber" DOUBLE PRECISION DEFAULT 0,
    "sugar" DOUBLE PRECISION DEFAULT 0,
    "addedSugar" DOUBLE PRECISION DEFAULT 0,
    "protein" DOUBLE PRECISION DEFAULT 0,
    "potassium" DOUBLE PRECISION DEFAULT 0,
    "caffeine" DOUBLE PRECISION DEFAULT 0,
    "drink_id" UUID NOT NULL,

    CONSTRAINT "Nutrition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Nutrition_drink_id_key" ON "nutrition"("drink_id");

-- AddForeignKey
ALTER TABLE "nutrition" ADD CONSTRAINT "Nutrition_drink_id_fkey" FOREIGN KEY ("drink_id") REFERENCES "drinks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
