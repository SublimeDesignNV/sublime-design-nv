-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "assetManufacturerId" TEXT,
ADD COLUMN     "assetMaterialId" TEXT,
ADD COLUMN     "assetSupplierId" TEXT,
ADD COLUMN     "materialCategoryId" TEXT,
ADD COLUMN     "materialSheen" TEXT;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_materialCategoryId_fkey" FOREIGN KEY ("materialCategoryId") REFERENCES "MaterialCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_assetManufacturerId_fkey" FOREIGN KEY ("assetManufacturerId") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_assetSupplierId_fkey" FOREIGN KEY ("assetSupplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_assetMaterialId_fkey" FOREIGN KEY ("assetMaterialId") REFERENCES "Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;
