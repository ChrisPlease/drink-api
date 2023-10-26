/*
  Warnings:

  - A unique constraint covering the columns `[id,sugar]` on the table `drinks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "drinks_id_sugar_key" ON "drinks"("id", "sugar");
