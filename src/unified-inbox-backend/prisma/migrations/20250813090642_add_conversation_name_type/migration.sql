/*
  Warnings:

  - Added the required column `type` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Conversation" ADD COLUMN     "name" TEXT,
ADD COLUMN     "type" TEXT NOT NULL;
