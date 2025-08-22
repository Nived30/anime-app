/*
  # Update user_points game types

  1. Changes
    - Update the game_type check constraint to include all valid game types
    
  2. Details
    - Adds support for: task_completed, reading, reaction
*/

DO $$ 
BEGIN
  -- Drop existing constraint
  ALTER TABLE user_points DROP CONSTRAINT IF EXISTS user_points_game_type_check;
  
  -- Add new constraint with all valid game types
  ALTER TABLE user_points 
    ADD CONSTRAINT user_points_game_type_check 
    CHECK (game_type IN (
      'memory', 
      'quiz', 
      'purchase', 
      'task_completed',
      'reading',
      'reaction'
    ));
END $$;