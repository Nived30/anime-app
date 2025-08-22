/*
  # Add products and analytics tables

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `points_required` (integer)
      - `image_url` (text)
      - `sizes` (text[])
      - `category` (text)
      - `stock` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `analytics`
      - `id` (uuid, primary key)
      - `event_type` (text) - registration, game_played, purchase, points_earned
      - `user_id` (uuid)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for admin access to products
    - Add policies for analytics tracking
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  points_required integer,
  image_url text,
  sizes text[] NOT NULL DEFAULT '{}',
  category text,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Allow read access for all users"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin to manage products"
  ON products
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Analytics policies
CREATE POLICY "Users can insert their own analytics"
  ON analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all analytics"
  ON analytics
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create admin role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin'
  ) THEN
    CREATE ROLE admin;
  END IF;
END
$$;