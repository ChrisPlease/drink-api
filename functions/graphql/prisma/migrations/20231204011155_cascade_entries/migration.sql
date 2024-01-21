-- DropForeignKey
ALTER TABLE "entries" DROP CONSTRAINT "entries_drink_id_fkey";

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_drink_id_fkey" FOREIGN KEY ("drink_id") REFERENCES "drinks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
