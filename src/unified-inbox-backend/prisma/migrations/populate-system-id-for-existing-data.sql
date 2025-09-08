-- Data Migration: Populate systemId for existing records
-- Date: 2025-08-23
-- Description: Set default systemId for existing data before adding NOT NULL constraint

-- Step 1: Get or create default system
-- If no systems exist, create a default one
INSERT INTO systems (id, name, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Default System',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM systems LIMIT 1);

-- Step 2: Get the default system ID
DO $$
DECLARE
    default_system_id UUID;
BEGIN
    SELECT id INTO default_system_id FROM systems LIMIT 1;
    
    -- Update existing telegram_groups with default system
    UPDATE telegram_groups 
    SET system_id = default_system_id 
    WHERE system_id IS NULL;
    
    -- Update existing group_permissions with default system
    UPDATE group_permissions 
    SET system_id = default_system_id 
    WHERE system_id IS NULL;
    
    RAISE NOTICE 'Updated % telegram groups and % group permissions with system_id: %', 
        (SELECT COUNT(*) FROM telegram_groups WHERE system_id = default_system_id),
        (SELECT COUNT(*) FROM group_permissions WHERE system_id = default_system_id),
        default_system_id;
END $$;

-- Step 3: Verify all records have system_id
SELECT 
    'telegram_groups' as table_name,
    COUNT(*) as total_records,
    COUNT(system_id) as records_with_system_id,
    COUNT(*) - COUNT(system_id) as records_missing_system_id
FROM telegram_groups
UNION ALL
SELECT 
    'group_permissions' as table_name,
    COUNT(*) as total_records,
    COUNT(system_id) as records_with_system_id,
    COUNT(*) - COUNT(system_id) as records_missing_system_id
FROM group_permissions;

-- Step 4: Add NOT NULL constraint after data is populated
ALTER TABLE telegram_groups ALTER COLUMN system_id SET NOT NULL;
ALTER TABLE group_permissions ALTER COLUMN system_id SET NOT NULL;
