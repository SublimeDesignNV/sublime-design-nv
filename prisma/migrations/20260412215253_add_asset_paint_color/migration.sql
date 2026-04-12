-- CreateTable
CREATE TABLE "AssetPaintColor" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "paintColorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetPaintColor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssetPaintColor_assetId_paintColorId_key" ON "AssetPaintColor"("assetId", "paintColorId");

-- AddForeignKey
ALTER TABLE "AssetPaintColor" ADD CONSTRAINT "AssetPaintColor_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetPaintColor" ADD CONSTRAINT "AssetPaintColor_paintColorId_fkey" FOREIGN KEY ("paintColorId") REFERENCES "PaintColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
