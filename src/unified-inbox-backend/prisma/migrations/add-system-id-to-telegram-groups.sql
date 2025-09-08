-- Migration: Add systemId to TelegramGroup and GroupPermission tables
-- Date: 2025-08-23
-- Description: Fix multi-system architecture by adding system isolation

-- Step 1: Add systemId column to telegram_groups table
ALTER TABLE telegram_groups 
ADD COLUMN system_id UUID REFERENCES systems(id);

-- Step 2: Add systemId column to group_permissions table  
ALTER TABLE group_permissions 
ADD COLUMN system_id UUID REFERENCES systems(id);

-- Step 3: Drop old unique constraint on group_permissions
ALTER TABLE group_permissions 
DROP CONSTRAINT group_permissions_group_type_permission_name_key;

-- Step 4: Add new composite unique constraint
ALTER TABLE group_permissions 
ADD CONSTRAINT group_permissions_system_group_permission_key 
UNIQUE (system_id, group_type, permission_name);

-- Step 5: Add NOT NULL constraint after data migration
-- Note: This will be added after we populate system_id for existing records

-- Step 6: Create indexes for performance
CREATE INDEX idx_telegram_groups_system_id ON telegram_groups(system_id);
CREATE INDEX idx_group_permissions_system_id ON group_permissions(system_id);
CREATE INDEX idx_group_permissions_system_group ON group_permissions(system_id, group_type);

-- Step 7: Add foreign key constraints
ALTER TABLE telegram_groups 
ADD CONSTRAINT fk_telegram_groups_system 
FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE CASCADE;

ALTER TABLE group_permissions 
ADD CONSTRAINT fk_group_permissions_system 
FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE CASCADE;
