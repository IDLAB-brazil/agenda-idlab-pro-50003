-- Add admin_token column to admin_config
ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS admin_token TEXT;

-- Set the admin token
UPDATE admin_config 
SET admin_token = 'idlab-admin-2025'
WHERE id = 'ba13854a-fb8a-4b3b-978b-43cabaa4398b';