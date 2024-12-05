-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "FoodType" ALTER COLUMN "remark" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "level" SET DEFAULT 'admin';

-- CreateTable
CREATE TABLE "FoodSize" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "remark" TEXT NOT NULL,
    "foodTypeId" INTEGER NOT NULL,
    "moneyAdded" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'use',

    CONSTRAINT "FoodSize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Taste" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "remark" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'use',
    "foodTypeId" INTEGER NOT NULL,

    CONSTRAINT "Taste_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Food" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "remark" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'use',
    "price" INTEGER NOT NULL,
    "foodType" TEXT NOT NULL DEFAULT 'food',
    "foodTypeId" INTEGER NOT NULL,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleTemp" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tableNo" INTEGER NOT NULL,
    "foodId" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,

    CONSTRAINT "SaleTemp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleTempDetail" (
    "id" SERIAL NOT NULL,
    "saleTempId" INTEGER NOT NULL,
    "foodId" INTEGER NOT NULL,
    "tasteId" INTEGER,
    "foodSizeId" INTEGER,

    CONSTRAINT "SaleTempDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "promptpay" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "taxCode" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillSale" (
    "id" SERIAL NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "payType" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "inputMoney" INTEGER NOT NULL,
    "returnMoney" INTEGER NOT NULL,
    "tableNo" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'use',

    CONSTRAINT "BillSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillSaleDetail" (
    "id" SERIAL NOT NULL,
    "billSaleId" INTEGER NOT NULL,
    "foodId" INTEGER NOT NULL,
    "tasteId" INTEGER,
    "foodSizeId" INTEGER,
    "moneyAdded" INTEGER,
    "price" INTEGER,

    CONSTRAINT "BillSaleDetail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FoodSize" ADD CONSTRAINT "FoodSize_foodTypeId_fkey" FOREIGN KEY ("foodTypeId") REFERENCES "FoodType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taste" ADD CONSTRAINT "Taste_foodTypeId_fkey" FOREIGN KEY ("foodTypeId") REFERENCES "FoodType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Food" ADD CONSTRAINT "Food_foodTypeId_fkey" FOREIGN KEY ("foodTypeId") REFERENCES "FoodType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleTemp" ADD CONSTRAINT "SaleTemp_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleTempDetail" ADD CONSTRAINT "SaleTempDetail_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleTempDetail" ADD CONSTRAINT "SaleTempDetail_tasteId_fkey" FOREIGN KEY ("tasteId") REFERENCES "Taste"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleTempDetail" ADD CONSTRAINT "SaleTempDetail_foodSizeId_fkey" FOREIGN KEY ("foodSizeId") REFERENCES "FoodSize"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleTempDetail" ADD CONSTRAINT "SaleTempDetail_saleTempId_fkey" FOREIGN KEY ("saleTempId") REFERENCES "SaleTemp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillSale" ADD CONSTRAINT "BillSale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillSaleDetail" ADD CONSTRAINT "BillSaleDetail_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillSaleDetail" ADD CONSTRAINT "BillSaleDetail_billSaleId_fkey" FOREIGN KEY ("billSaleId") REFERENCES "BillSale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillSaleDetail" ADD CONSTRAINT "BillSaleDetail_foodSizeId_fkey" FOREIGN KEY ("foodSizeId") REFERENCES "FoodSize"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillSaleDetail" ADD CONSTRAINT "BillSaleDetail_tasteId_fkey" FOREIGN KEY ("tasteId") REFERENCES "Taste"("id") ON DELETE SET NULL ON UPDATE CASCADE;
