-- Add non-unique columns first
ALTER TABLE users ADD COLUMN otp TEXT;
ALTER TABLE users ADD COLUMN otp_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN google_id TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Add uniqueness through indexes instead of column constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id_unique ON users(google_id) WHERE google_id IS NOT NULL;
