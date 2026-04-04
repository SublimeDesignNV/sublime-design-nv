-- CreateEnum
CREATE TYPE "IntakeServiceType" AS ENUM ('BARN_DOORS', 'CABINETS', 'CUSTOM_CLOSETS', 'FAUX_BEAMS', 'FLOATING_SHELVES', 'MANTELS', 'TRIM_WORK', 'MULTIPLE', 'OTHER');

-- CreateEnum
CREATE TYPE "IntakeAssetType" AS ENUM ('SPACE_PHOTO', 'INSPIRATION_PHOTO', 'VIDEO', 'PRODUCT_LINK', 'INSPIRATION_LINK', 'VISION_RENDER');

-- CreateEnum
CREATE TYPE "IntakeLeadStatus" AS ENUM ('NEW', 'INTAKE_SENT', 'INTAKE_STARTED', 'INTAKE_COMPLETE', 'VISION_GENERATED', 'BID_READY', 'CONVERTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "VisionStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETE', 'FAILED');

-- CreateTable
CREATE TABLE "IntakeLead" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "serviceType" "IntakeServiceType" NOT NULL,
    "projectNotes" TEXT,
    "intakeData" JSONB,
    "visionPrompt" TEXT,
    "visionResult" JSONB,
    "visionStatus" "VisionStatus" NOT NULL DEFAULT 'PENDING',
    "status" "IntakeLeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntakeLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeLeadAsset" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "IntakeAssetType" NOT NULL,
    "url" TEXT NOT NULL,
    "cloudinaryId" TEXT,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntakeLeadAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntakeLead_token_key" ON "IntakeLead"("token");

-- AddForeignKey
ALTER TABLE "IntakeLeadAsset" ADD CONSTRAINT "IntakeLeadAsset_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "IntakeLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Project_projectId_position_key" RENAME TO "ProjectAsset_projectId_position_key";
