/*
  # Add purchase game type

  1. Changes
    - Update check constraint for user_points.game_type to include 'purchase'
*/

DO $$ 
BEGIN
  -- Drop existing constraint
  ALTER TABLE user_points DROP CONSTRAINT IF EXISTS user_points_game_type_check;
  
  -- Add new constraint with 'purchase' type
  ALTER TABLE user_points 
    ADD CONSTRAINT user_points_game_type_check 
    CHECK (game_type IN ('memory', 'quiz', 'purchase'));
END $$;