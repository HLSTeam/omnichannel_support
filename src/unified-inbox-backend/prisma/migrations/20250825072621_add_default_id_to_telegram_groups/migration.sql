-- DropForeignKey
ALTER TABLE "public"."helpdesk_tickets" DROP CONSTRAINT "helpdesk_tickets_conversationId_fkey";

-- AlterTable
ALTER TABLE "public"."helpdesk_tickets" ALTER COLUMN "conversationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."helpdesk_tickets" ADD CONSTRAINT "helpdesk_tickets_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
