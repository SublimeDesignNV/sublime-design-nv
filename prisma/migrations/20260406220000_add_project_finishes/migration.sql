-- AddColumn: finishes JSONB array on Project
ALTER TABLE "Project" ADD COLUMN "finishes" JSONB DEFAULT '[]';
