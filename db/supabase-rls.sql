-- Enable Row Level Security (RLS) and add policies so users can only access their own rows.
-- Run this in Supabase SQL editor after applying the base schema.

-- Sermons RLS
ALTER TABLE IF EXISTS sermons ENABLE ROW LEVEL SECURITY;

-- Allow selects only for rows owned by the current jwt user
CREATE POLICY IF NOT EXISTS "select_own" ON sermons
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow inserts only if the user_id matches the jwt user
CREATE POLICY IF NOT EXISTS "insert_own" ON sermons
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow updates only for the owner
CREATE POLICY IF NOT EXISTS "update_own" ON sermons
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Sermon revisions RLS
ALTER TABLE IF EXISTS sermon_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "select_revisions_own" ON sermon_revisions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "insert_revisions_own" ON sermon_revisions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Optionally, allow users to read revisions for sermons they own even if they didn't author the revision
-- This requires a function to check sermon ownership; for simplicity, keep revisions tied to the creating user.
