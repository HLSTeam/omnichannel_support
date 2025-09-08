-- Rollback Migration: Remove systemId from TelegramGroup and GroupPermission tables
-- Date: 2025-08-23
-- Description: Rollback changes if needed

-- Step 1: Drop foreign key constraints
ALTER TABLE telegram_groups DROP CONSTRAINT IF EXISTS fk_telegram_groups_system;
ALTER TABLE group_permissions DROP CONSTRAINT IF EXISTS fk_group_permissions_system;

-- Step 2: Drop indexes
DROP INDEX IF EXISTS idx_telegram_groups_system_id;
DROP INDEX IF EXISTS idx_group_permissions_system_id;
DROP INDEX IF EXISTS idx_group_permissions_system_group;

-- Step 3: Drop new unique constraint
ALTER TABLE group_permissions DROP CONSTRAINT IF EXISTS group_permissions_system_group_permission_key;

-- Step 4: Restore old unique constraint
ALTER TABLE group_permissions ADD CONSTRAINT group_permissions_group_type_permission_name_key 
    UNIQUE (group_type, permission_name);

-- Step 5: Drop system_id columns
ALTER TABLE telegram_groups DROP COLUMN IF EXISTS system_id;
ALTER TABLE group_permissions DROP COLUMN IF EXISTS system_id;

-- Step 6: Verify rollback
SELECT 'Rollback completed successfully' as status;
