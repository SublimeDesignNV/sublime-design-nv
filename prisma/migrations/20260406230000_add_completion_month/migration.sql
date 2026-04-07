-- AddColumn: completionMonth on Project
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "completionMonth" INTEGER;
