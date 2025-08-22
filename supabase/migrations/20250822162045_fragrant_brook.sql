/*
  # Create Affiliate Tracking System

  1. New Tables
    - `affiliates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `referral_code` (text, unique)
      - `commission_rate` (decimal, default 0.10 for 10%)
      - `total_earnings` (decimal, default 0)
      - `status` (text, active/inactive)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `affiliate_clicks`
      - `id` (uuid, primary key)
      - `affiliate_id` (uuid, foreign key to affiliates)
      - `ip_address` (text)
      - `user_agent` (text)
      - `referrer` (text)
      - `created_at` (timestamp)
    
    - `affiliate_conversions`
      - `id` (uuid, primary key)
      - `affiliate_id` (uuid, foreign key to affiliates)
      - `user_id` (uuid, foreign key to users)
      - `conversion_type` (text: signup, purchase)
      - `order_value` (decimal, nullable)
      - `commission_amount` (decimal)
      - `status` (text: pending, approved, paid)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for affiliates to read their own data
    - Add policies for admins to manage all data

  3. Functions
    - Function to generate unique referral codes
    - Function to calculate commissions
*/

-- Create affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code text UNIQUE NOT NULL,
  commission_rate decimal DEFAULT 0.10,
  total_earnings decimal DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create affiliate_clicks table
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  ip_address text,
  user_agent text,
  referrer text,
  created_at timestamptz DEFAULT now()
);

-- Create affiliate_conversions table
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  conversion_type text NOT NULL CHECK (conversion_type IN ('signup', 'purchase')),
  order_value decimal,
  commission_amount decimal NOT NULL DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- Policies for affiliates table
CREATE POLICY "Affiliates can read own data"
  ON affiliates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Affiliates can update own data"
  ON affiliates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all affiliates"
  ON affiliates
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- Policies for affiliate_clicks table
CREATE POLICY "Affiliates can read own clicks"
  ON affiliate_clicks
  FOR SELECT
  TO authenticated
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert clicks"
  ON affiliate_clicks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage all clicks"
  ON affiliate_clicks
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- Policies for affiliate_conversions table
CREATE POLICY "Affiliates can read own conversions"
  ON affiliate_conversions
  FOR SELECT
  TO authenticated
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert conversions"
  ON affiliate_conversions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage all conversions"
  ON affiliate_conversions
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    -- Generate a random 8-character code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if it already exists
    SELECT EXISTS(SELECT 1 FROM affiliates WHERE referral_code = code) INTO exists;
    
    -- If it doesn't exist, return it
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update affiliate earnings
CREATE OR REPLACE FUNCTION update_affiliate_earnings()
RETURNS trigger AS $$
BEGIN
  -- Update total earnings when a conversion is approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE affiliates 
    SET total_earnings = total_earnings + NEW.commission_amount,
        updated_at = now()
    WHERE id = NEW.affiliate_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update earnings
CREATE TRIGGER update_affiliate_earnings_trigger
  AFTER UPDATE ON affiliate_conversions
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_earnings();

-- Trigger to update updated_at
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();