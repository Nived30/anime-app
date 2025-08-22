/*
  # Enable real-time tracking for analytics and user activities

  1. Changes
    - Add realtime enabled flag for analytics table
    - Create function to track user points changes
    - Create trigger for user points tracking
*/

-- Enable realtime for analytics table
ALTER PUBLICATION supabase_realtime ADD TABLE analytics;

-- Create function to track points changes
CREATE OR REPLACE FUNCTION track_points_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics (
    event_type,
    user_id,
    metadata
  ) VALUES (
    'points_update',
    NEW.user_id,
    jsonb_build_object(
      'points_change', NEW.points - COALESCE(
        (SELECT points FROM user_points 
         WHERE user_id = NEW.user_id 
         ORDER BY created_at DESC 
         LIMIT 1), 
        0
      ),
      'new_total', NEW.points,
      'game_type', NEW.game_type
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for points tracking
DROP TRIGGER IF EXISTS points_change_trigger ON user_points;
CREATE TRIGGER points_change_trigger
  AFTER INSERT OR UPDATE
  ON user_points
  FOR EACH ROW
  EXECUTE FUNCTION track_points_change();