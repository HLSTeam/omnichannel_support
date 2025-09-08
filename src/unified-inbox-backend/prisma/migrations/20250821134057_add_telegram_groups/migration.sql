-- CreateEnum
CREATE TYPE "public"."BroadcastStatus" AS ENUM ('PENDING', 'EXECUTING', 'SENT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."GroupType" AS ENUM ('ADMIN', 'CUSTOMER', 'SUPPLIER');

-- CreateTable
CREATE TABLE "public"."telegram_groups" (
    "id" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "groupType" "public"."GroupType" NOT NULL,
    "chatId" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "chatTitle" TEXT,
    "memberCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."group_permissions" (
    "id" TEXT NOT NULL,
    "groupType" "public"."GroupType" NOT NULL,
    "permissionName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_logs" (
    "id" TEXT NOT NULL,
    "telegramGroupId" TEXT NOT NULL,
    "messageContent" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BroadcastSession" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "filtersJson" JSONB NOT NULL,
    "targetCount" INTEGER NOT NULL,
    "targetIds" TEXT[],
    "status" "public"."BroadcastStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executedAt" TIMESTAMP(3),
    "createdByAgentId" TEXT NOT NULL,

    CONSTRAINT "BroadcastSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_GroupPermissionToTelegramGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GroupPermissionToTelegramGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_groups_chatId_key" ON "public"."telegram_groups"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "group_permissions_groupType_permissionName_key" ON "public"."group_permissions"("groupType", "permissionName");

-- CreateIndex
CREATE INDEX "_GroupPermissionToTelegramGroup_B_index" ON "public"."_GroupPermissionToTelegramGroup"("B");

-- AddForeignKey
ALTER TABLE "public"."notification_logs" ADD CONSTRAINT "notification_logs_telegramGroupId_fkey" FOREIGN KEY ("telegramGroupId") REFERENCES "public"."telegram_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BroadcastSession" ADD CONSTRAINT "BroadcastSession_createdByAgentId_fkey" FOREIGN KEY ("createdByAgentId") REFERENCES "public"."Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_GroupPermissionToTelegramGroup" ADD CONSTRAINT "_GroupPermissionToTelegramGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."group_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_GroupPermissionToTelegramGroup" ADD CONSTRAINT "_GroupPermissionToTelegramGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."telegram_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
