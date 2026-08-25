/*
# Create projects table for the online code editor

1. New Tables
- `projects`
  - `id` (uuid, primary key)
  - `name` (text, not null) - the project's display name
  - `description` (text, nullable) - short optional description
  - `html` (text, default empty string) - HTML source code
  - `css` (text, default empty string) - CSS source code
  - `js` (text, default empty string) - JavaScript source code
  - `created_at` (timestamptz) - creation timestamp
  - `updated_at` (timestamptz) - last modification timestamp

2. Security
- Enable RLS on `projects`.
- Allow anon + authenticated full CRUD because this is a single-tenant
  no-auth app where all projects are intentionally shared/public.

3. Notes
- No user_id column because the app has no sign-in flow.
- `updated_at` is maintained by the application on every update.
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  html text NOT NULL DEFAULT '',
  css text NOT NULL DEFAULT '',
  js text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE
  TO anon, authenticated USING (true);
