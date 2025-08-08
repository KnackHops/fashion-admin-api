-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_materialId_fkey";

-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "materialId" DROP NOT NULL,
ALTER COLUMN "brand" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;
