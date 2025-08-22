/*
  # User Points and Game History Schema

  1. New Tables
    - `user_points`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `points` (integer)
      - `game_type` (text) - 'memory' or 'quiz'
      - `created_at` (timestamp)
    
  2. Security
    - Enable RLS on `user_points` table
    - Add policies for users to read their own points
    - Add policy for the application to insert points
*/

CREATE TABLE IF NOT EXISTS user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  points integer NOT NULL,
  game_type text NOT NULL CHECK (game_type IN ('memory', 'quiz')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own points"
  ON user_points
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Insert points for authenticated users"
  ON user_points
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);