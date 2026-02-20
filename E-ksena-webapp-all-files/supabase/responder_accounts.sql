-- Run this in Supabase SQL Editor (Dashboard → SQL Editor) to create the table for registered responder accounts.

CREATE TABLE IF NOT EXISTS responder_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  email_lower TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  username_lower TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('police', 'firefighter', 'medic')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast login lookup by email or username (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_responder_accounts_email_lower ON responder_accounts (email_lower);
CREATE INDEX IF NOT EXISTS idx_responder_accounts_username_lower ON responder_accounts (username_lower);

-- Allow anonymous insert/select for the app (use Row Level Security in production)
ALTER TABLE responder_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for responder_accounts" ON responder_accounts
  FOR ALL
  USING (true)
  WITH CHECK (true);
