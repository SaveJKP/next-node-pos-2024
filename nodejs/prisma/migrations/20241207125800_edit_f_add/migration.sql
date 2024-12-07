-- DropForeignKey
ALTER TABLE "Food" DROP CONSTRAINT "Food_foodTypeId_fkey";

-- AddForeignKey
ALTER TABLE "Food" ADD CONSTRAINT "Food_foodTypeId_fkey" FOREIGN KEY ("foodTypeId") REFERENCES "FoodType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
