/*
  # Create profiles and social media tables

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `wallet_address` (text, unique)
      - `username` (text, unique)
      - `bio` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `social_accounts`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `platform` (text)
      - `username` (text)
      - `verified` (boolean)
      - `verification_post_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  username text NOT NULL,
  verified boolean DEFAULT false,
  verification_post_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, platform)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read any profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (wallet_address = auth.jwt() ->> 'sub')
  WITH CHECK (wallet_address = auth.jwt() ->> 'sub');

CREATE POLICY "Users can read any social account"
  ON social_accounts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own social accounts"
  ON social_accounts
  FOR ALL
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles 
      WHERE wallet_address = auth.jwt() ->> 'sub'
    )
  )
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles 
      WHERE wallet_address = auth.jwt() ->> 'sub'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();