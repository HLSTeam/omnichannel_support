/*
  Warnings:

  - Added the required column `systemId` to the `helpdesk_tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- First, add the column as nullable
ALTER TABLE "public"."helpdesk_tickets" ADD COLUMN "systemId" TEXT;

-- Update existing records with a default system ID (get the first system)
UPDATE "public"."helpdesk_tickets" 
SET "systemId" = (SELECT id FROM "public"."System" LIMIT 1)
WHERE "systemId" IS NULL;

-- Make the column NOT NULL
ALTER TABLE "public"."helpdesk_tickets" ALTER COLUMN "systemId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."helpdesk_tickets" ADD CONSTRAINT "helpdesk_tickets_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "public"."System"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
