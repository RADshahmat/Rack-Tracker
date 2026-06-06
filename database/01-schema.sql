-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50)  UNIQUE NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'viewer'
                CONSTRAINT users_role_check CHECK (role IN ('admin', 'operator', 'viewer')),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);


-- Create racks table
CREATE TABLE IF NOT EXISTS racks (
  id SERIAL PRIMARY KEY,
  tag VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(100),
  capacity INT DEFAULT 42 CHECK (capacity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create equipment table (serial_nb and status fields should be added in future iterations)
CREATE TABLE IF NOT EXISTS equipment (
  id SERIAL PRIMARY KEY,
  tag VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50),
  rack_id INT REFERENCES racks(id) ON DELETE SET NULL,
  slot_position INT CHECK (slot_position > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- upload attachments table
CREATE TABLE IF NOT EXISTS rack_attachments (
    id            SERIAL PRIMARY KEY,
    rack_id       INT          NOT NULL REFERENCES racks(id) ON DELETE CASCADE,
    filename      VARCHAR(255) NOT NULL,        -- UUID filename on disk
    original_name VARCHAR(255) NOT NULL,        -- user's original filename
    file_path     VARCHAR(500) NOT NULL,        -- full path on disk
    file_size     INT          NOT NULL,        -- bytes
    uploaded_by   INT          REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ  DEFAULT NOW()
);


-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for Users Table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);


-- Create triggers for both tables
CREATE TRIGGER update_racks_updated_at
  BEFORE UPDATE ON racks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_racks_tag ON racks(tag);
CREATE INDEX idx_racks_created_at ON racks(created_at DESC);
CREATE INDEX idx_equipment_tag ON equipment(tag);
CREATE INDEX idx_equipment_rack_id ON equipment(rack_id);
CREATE INDEX idx_equipment_created_at ON equipment(created_at DESC);
CREATE INDEX idx_rack_attachments_rack_id ON rack_attachments(rack_id);