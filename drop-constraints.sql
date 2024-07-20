-- Drop the foreign key constraint
ALTER TABLE snippets DROP CONSTRAINT IF EXISTS snippets_user_id_users_clerk_id_fk;

-- Drop the unique constraint on users table
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_clerk_id_unique;

-- Drop the clerk_id column from users table
ALTER TABLE users DROP COLUMN IF EXISTS clerk_id;