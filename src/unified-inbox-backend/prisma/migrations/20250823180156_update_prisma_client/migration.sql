-- DropForeignKey
ALTER TABLE "public"."group_permissions" DROP CONSTRAINT "group_permissions_systemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."telegram_groups" DROP CONSTRAINT "telegram_groups_systemId_fkey";

-- DropIndex
DROP INDEX "public"."idx_group_permissions_system_group";

-- DropIndex
DROP INDEX "public"."idx_group_permissions_system_id";

-- DropIndex
DROP INDEX "public"."idx_telegram_groups_system_id";

-- AddForeignKey
ALTER TABLE "public"."telegram_groups" ADD CONSTRAINT "telegram_groups_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "public"."System"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_permissions" ADD CONSTRAINT "group_permissions_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "public"."System"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
