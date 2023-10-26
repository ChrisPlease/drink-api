-- DropIndex
DROP INDEX "drinks_id_sugar_key";

-- CreateIndex
CREATE INDEX "drinks_id_sugar_idx" ON "drinks"("id", "sugar");

-- CreateIndex
CREATE INDEX "drinks_id_coefficient_idx" ON "drinks"("id", "coefficient");

-- CreateIndex
CREATE INDEX "drinks_id_caffeine_idx" ON "drinks"("id", "caffeine");
