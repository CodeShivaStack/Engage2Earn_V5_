/*
  # Create tasks and engagements tables

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `token_reward` (numeric)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `platform` (text)
      - `required_likes` (integer)
      - `required_shares` (integer)
      - `required_comments` (integer)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `task_engagements`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `user_id` (uuid, references profiles)
      - `post_url` (text)
      - `likes_count` (integer)
      - `shares_count` (integer)
      - `comments_count` (integer)
      - `status` (text)
      - `reward_claimed` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  token_reward numeric NOT NULL CHECK (token_reward > 0),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  platform text NOT NULL CHECK (platform IN ('twitter', 'instagram', 'tiktok')),
  required_likes integer DEFAULT 0,
  required_shares integer DEFAULT 0,
  required_comments integer DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (start_date < end_date)
);

CREATE TABLE IF NOT EXISTS task_engagements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  post_url text NOT NULL,
  likes_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),
  reward_claimed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(task_id, user_id)
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_engagements ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "Anyone can read tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Creators can update their tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (creator_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'sub'
  ))
  WITH CHECK (creator_id IN (
    SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'sub'
  ));

-- Task engagements policies
CREATE POLICY "Users can read their engagements"
  ON task_engagements
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'sub'
    ) OR
    task_id IN (
      SELECT id FROM tasks WHERE creator_id IN (
        SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'sub'
      )
    )
  );

CREATE POLICY "Users can create engagements"
  ON task_engagements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update their engagements"
  ON task_engagements
  FOR UPDATE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'sub'
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM profiles WHERE wallet_address = auth.jwt() ->> 'sub'
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_engagements_updated_at
  BEFORE UPDATE ON task_engagements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check task status
CREATE OR REPLACE FUNCTION check_task_status()
RETURNS trigger AS $$
BEGIN
  IF NEW.end_date < NOW() AND NEW.status = 'active' THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_task_status_trigger
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION check_task_status();