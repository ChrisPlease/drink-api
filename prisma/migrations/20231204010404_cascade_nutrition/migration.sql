-- DropForeignKey
ALTER TABLE "nutrition" DROP CONSTRAINT "nutrition_drink_id_fkey";

-- AddForeignKey
ALTER TABLE "nutrition" ADD CONSTRAINT "nutrition_drink_id_fkey" FOREIGN KEY ("drink_id") REFERENCES "drinks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
