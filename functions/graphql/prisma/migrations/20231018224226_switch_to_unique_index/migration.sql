/*
  Warnings:

  - A unique constraint covering the columns `[id,sugar]` on the table `drinks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,coefficient]` on the table `drinks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,caffeine]` on the table `drinks` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "drinks_id_caffeine_idx";

-- DropIndex
DROP INDEX "drinks_id_coefficient_idx";

-- DropIndex
DROP INDEX "drinks_id_sugar_idx";

-- CreateIndex
CREATE UNIQUE INDEX "drinks_id_sugar_key" ON "drinks"("id", "sugar");

-- CreateIndex
CREATE UNIQUE INDEX "drinks_id_coefficient_key" ON "drinks"("id", "coefficient");

-- CreateIndex
CREATE UNIQUE INDEX "drinks_id_caffeine_key" ON "drinks"("id", "caffeine");
