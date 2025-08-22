/*
  # Make niveddalu@gmail.com an admin user

  1. Changes
    - Updates the role of niveddalu@gmail.com to 'admin'
    - Updates user metadata to reflect admin status
*/

-- Update the user's role and metadata
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
),
raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{tier}',
  '"admin"'
)
WHERE email = 'niveddalu@gmail.com';