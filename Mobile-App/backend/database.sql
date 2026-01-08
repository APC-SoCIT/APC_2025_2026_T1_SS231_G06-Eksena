-- ============================================
-- E-KSENA Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- Table 1: Emergency Responders
-- Stores phone numbers for fire, medical, and police responders
-- ============================================
CREATE TABLE IF NOT EXISTS public.emergency_responders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  service_type TEXT CHECK (service_type IN ('fire', 'medical', 'police')) NOT NULL,
  name TEXT, -- Optional: e.g., "Fire Station #1", "Ambulance Unit 3"
  location_lat NUMERIC, -- Optional: responder's base location
  location_lng NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_responders_service_type ON public.emergency_responders(service_type);
CREATE INDEX IF NOT EXISTS idx_responders_active ON public.emergency_responders(is_active);

-- ============================================
-- Table 2: Incidents
-- Tracks all emergency reports with user and responder phone numbers
-- ============================================
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_phone_number TEXT NOT NULL, -- Phone number of the citizen who reported
  responder_phone_number TEXT, -- Phone number of the responder assigned (null until assigned)
  service_type TEXT CHECK (service_type IN ('fire', 'medical', 'police')) NOT NULL,
  location_lat NUMERIC NOT NULL,
  location_lng NUMERIC NOT NULL,
  location_address TEXT,
  video_url TEXT, -- Mock URL or placeholder (no actual storage needed)
  status TEXT CHECK (status IN ('pending', 'assigned', 'in_progress', 'resolved')) DEFAULT 'pending',
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- When AI detected the emergency type
  assigned_at TIMESTAMP WITH TIME ZONE, -- When responder was assigned
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_incidents_user_phone ON public.incidents(user_phone_number);
CREATE INDEX IF NOT EXISTS idx_incidents_responder_phone ON public.incidents(responder_phone_number);
CREATE INDEX IF NOT EXISTS idx_incidents_service_type ON public.incidents(service_type);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);

-- ============================================
-- Table 3: Responder Locations (OPTIONAL)
-- Only create this if you have a responder app sending real-time GPS updates
-- Skip this table if you're using simulated routes or static route calculation
-- ============================================
-- Uncomment the following if you need real-time responder tracking:

/*
CREATE TABLE IF NOT EXISTS public.responder_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  responder_phone_number TEXT NOT NULL,
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  current_lat NUMERIC NOT NULL,
  current_lng NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(responder_phone_number, incident_id)
);

-- Indexes for faster location lookups
CREATE INDEX IF NOT EXISTS idx_responder_locations_incident ON public.responder_locations(incident_id);
CREATE INDEX IF NOT EXISTS idx_responder_locations_phone ON public.responder_locations(responder_phone_number);
*/

-- ============================================
-- Sample Data: Emergency Responders
-- Insert test data (use fake phone numbers for testing)
-- ============================================
-- Optional: add a human-readable base address for responders
ALTER TABLE IF EXISTS public.emergency_responders
  ADD COLUMN IF NOT EXISTS station_address TEXT;

INSERT INTO public.emergency_responders (phone_number, service_type, name, location_lat, location_lng, station_address) VALUES
  ('+12345678901', 'fire', 'Fire Station #1', 37.7749, -122.4194, '123 Market St, San Francisco, CA'),
  ('+12345678902', 'fire', 'Fire Station #2', 37.7790, -122.4310, '200 Pine St, San Francisco, CA'),
  ('+12345678903', 'medical', 'Ambulance Unit 1', 37.7680, -122.4090, '500 Mission St, San Francisco, CA'),
  ('+12345678904', 'medical', 'Ambulance Unit 2', 37.7600, -122.4270, '700 Howard St, San Francisco, CA'),
  ('+12345678905', 'police', 'Police Department Unit 1', 37.7850, -122.4050, '850 Bryant St, San Francisco, CA'),
  ('+12345678906', 'police', 'Police Department Unit 2', 37.7920, -122.4180, '301 Eddy St, San Francisco, CA')
ON CONFLICT (phone_number) DO NOTHING;

-- ============================================
-- Row Level Security (RLS) - Optional
-- Uncomment if you want to enable RLS policies
-- ============================================
-- ALTER TABLE public.emergency_responders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Example policy (allow service role to do everything):
-- CREATE POLICY "Service role can do everything" ON public.emergency_responders
--   FOR ALL USING (auth.role() = 'service_role');

