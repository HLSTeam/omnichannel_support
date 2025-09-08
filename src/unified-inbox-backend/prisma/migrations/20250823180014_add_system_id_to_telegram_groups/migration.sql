/*
  Migration: Add systemId to TelegramGroup and GroupPermission tables
  Date: 2025-08-23
  Description: Fix multi-system architecture by adding system isolation
*/

-- Step 1: Create default system if not exists
INSERT INTO "public"."System" (id, name, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    'Default System',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "public"."System" LIMIT 1);

-- Step 2: Get default system ID
DO $$
DECLARE
    default_system_id TEXT;
BEGIN
    SELECT id INTO default_system_id FROM "public"."System" LIMIT 1;
    
    -- Step 3: Add systemId columns as nullable first
    ALTER TABLE "public"."telegram_groups" ADD COLUMN IF NOT EXISTS "systemId" TEXT;
    ALTER TABLE "public"."group_permissions" ADD COLUMN IF NOT EXISTS "systemId" TEXT;
    
    -- Step 4: Populate existing records with default system
    UPDATE "public"."telegram_groups" 
    SET "systemId" = default_system_id 
    WHERE "systemId" IS NULL;
    
    UPDATE "public"."group_permissions" 
    SET "systemId" = default_system_id 
    WHERE "systemId" IS NULL;
    
    -- Step 5: Make columns NOT NULL
    ALTER TABLE "public"."telegram_groups" ALTER COLUMN "systemId" SET NOT NULL;
    ALTER TABLE "public"."group_permissions" ALTER COLUMN "systemId" SET NOT NULL;
    
    RAISE NOTICE 'Updated records with default system_id: %', default_system_id;
END $$;

-- Step 6: Drop old unique constraint
DROP INDEX IF EXISTS "public"."group_permissions_groupType_permissionName_key";

-- Step 7: Create new composite unique constraint
CREATE UNIQUE INDEX "group_permissions_systemId_groupType_permissionName_key" 
ON "public"."group_permissions"("systemId", "groupType", "permissionName");

-- Step 8: Add foreign key constraints
ALTER TABLE "public"."telegram_groups" 
ADD CONSTRAINT "telegram_groups_systemId_fkey" 
FOREIGN KEY ("systemId") REFERENCES "public"."System"("id") ON DELETE CASCADE;

ALTER TABLE "public"."group_permissions" 
ADD CONSTRAINT "group_permissions_systemId_fkey" 
FOREIGN KEY ("systemId") REFERENCES "public"."System"("id") ON DELETE CASCADE;

-- Step 9: Create performance indexes
CREATE INDEX IF NOT EXISTS "idx_telegram_groups_system_id" ON "public"."telegram_groups"("systemId");
CREATE INDEX IF NOT EXISTS "idx_group_permissions_system_id" ON "public"."group_permissions"("systemId");
CREATE INDEX IF NOT EXISTS "idx_group_permissions_system_group" ON "public"."group_permissions"("systemId", "groupType");
