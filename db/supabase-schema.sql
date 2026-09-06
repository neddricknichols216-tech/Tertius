-- Supabase schema for Tertius MVP

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  display_name text,
  created_at timestamptz DEFAULT now()
);

-- sermons (master record)
CREATE TABLE IF NOT EXISTS sermons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  title text,
  primary_passage text,
  series text,
  sermon_date date,
  audience text,
  raw_notes jsonb,
  master_sermon jsonb,
  locked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_deleted boolean DEFAULT false
);

-- sermon revisions for simple version history
CREATE TABLE IF NOT EXISTS sermon_revisions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sermon_id uuid REFERENCES sermons(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  master_sermon jsonb,
  summary text,
  created_at timestamptz DEFAULT now()
);
