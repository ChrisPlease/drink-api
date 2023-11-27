/*
  Warnings:

  - A unique constraint covering the columns `[upc]` on the table `drinks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "drinks_upc_key" ON "drinks"("upc");
