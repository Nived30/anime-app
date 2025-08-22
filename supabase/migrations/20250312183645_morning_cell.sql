/*
  # Make niveddalu@gmail.com an admin user

  1. Changes
    - Updates the role of niveddalu@gmail.com to 'admin'
    - Updates user metadata to reflect admin status
    - Ensures proper admin role setup
*/

-- Update the user's role and metadata
UPDATE auth.users
SET 
  raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  ),
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{isAdmin}',
    'true'
  );

-- Ensure admin role exists and has proper permissions
DO $$
BEGIN
  -- Create admin role if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM pg_roles WHERE rolname = 'admin'
  ) THEN
    CREATE ROLE admin;
  END IF;

  -- Grant necessary permissions to admin role
  GRANT USAGE ON SCHEMA public TO admin;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO admin;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO admin;
  GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO admin;
END
$$;