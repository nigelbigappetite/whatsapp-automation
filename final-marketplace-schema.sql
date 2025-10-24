-- Final Waste Removal Marketplace Schema
-- Uses existing brands and whatsapp_messages tables
-- Run this entire script in Supabase SQL Editor

-- Note: brands table already exists, so we'll reference it
-- Note: whatsapp_messages table already exists, so we'll use it for message logging

-- Live conversations table (replaces whatsapp_staging for active conversations)
CREATE TABLE IF NOT EXISTS live_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(brand_id),
  customer_phone VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_conversations_brand ON live_conversations(brand_id);
CREATE INDEX IF NOT EXISTS idx_live_conversations_phone ON live_conversations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_live_conversations_status ON live_conversations(status);

-- WhatsApp quotes table (AI-generated quotes from WhatsApp conversations)
CREATE TABLE IF NOT EXISTS whatsapp_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(brand_id),
  customer_phone VARCHAR(20) NOT NULL,
  quote_data JSONB NOT NULL,
  items JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, booked, assigned, completed, cancelled, expired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
  booking_confirmed_at TIMESTAMP WITH TIME ZONE,
  booking_reference VARCHAR(50) UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_quotes_brand ON whatsapp_quotes(brand_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_quotes_phone ON whatsapp_quotes(customer_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_quotes_status ON whatsapp_quotes(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_quotes_created ON whatsapp_quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_quotes_booking_ref ON whatsapp_quotes(booking_reference);

-- Partners table (waste removal service providers)
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(brand_id),
  company_name VARCHAR(200) NOT NULL,
  contact_name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  
  -- Service areas (postcodes or regions)
  service_areas JSONB DEFAULT '[]',
  
  -- Performance metrics
  total_jobs_completed INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  
  -- Settings
  auto_accept_enabled BOOLEAN DEFAULT FALSE,
  notification_preferences JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_partners_brand ON partners(brand_id);
CREATE INDEX IF NOT EXISTS idx_partners_email ON partners(email);
CREATE INDEX IF NOT EXISTS idx_partners_active ON partners(is_active);

-- WhatsApp jobs table (when quote is booked via WhatsApp, it becomes a job/tender)
CREATE TABLE IF NOT EXISTS whatsapp_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(brand_id),
  quote_id UUID REFERENCES whatsapp_quotes(id),
  job_reference VARCHAR(50) UNIQUE NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(100),
  customer_address TEXT,
  customer_postcode VARCHAR(10),
  
  -- Pricing breakdown (two-tier fee structure)
  customer_pays DECIMAL(10,2) NOT NULL, -- What customer paid (e.g., £187.50)
  wefixico_fee DECIMAL(10,2) NOT NULL, -- 12.5% customer-side fee (e.g., £20.83)
  job_value_after_wefixico_fee DECIMAL(10,2) NOT NULL, -- Job value shown to partner (e.g., £166.67)
  partner_platform_fee DECIMAL(10,2) NOT NULL, -- 6.5% partner-side fee (e.g., £10.83)
  partner_payout DECIMAL(10,2) NOT NULL, -- Net payout to partner (e.g., £155.84)
  wefixico_income DECIMAL(10,2) NOT NULL, -- Total platform revenue (12.5% + 6.5%)
  
  -- Job details
  items JSONB NOT NULL,
  estimated_volume DECIMAL(10,2),
  special_instructions TEXT,
  preferred_date DATE,
  preferred_time VARCHAR(20),
  
  -- Tender status
  status VARCHAR(20) DEFAULT 'open', -- open, assigned, in_progress, completed, cancelled
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Partner assignment
  assigned_partner_id UUID REFERENCES partners(id),
  partner_accepted_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_jobs_brand ON whatsapp_jobs(brand_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_jobs_status ON whatsapp_jobs(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_jobs_customer_phone ON whatsapp_jobs(customer_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_jobs_assigned_partner ON whatsapp_jobs(assigned_partner_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_jobs_posted_at ON whatsapp_jobs(posted_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_jobs_reference ON whatsapp_jobs(job_reference);

-- WhatsApp job bids table (partner bids on WhatsApp-generated jobs)
CREATE TABLE IF NOT EXISTS whatsapp_job_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(brand_id),
  job_id UUID REFERENCES whatsapp_jobs(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id),
  
  -- Bid details
  proposed_payout DECIMAL(10,2), -- Partner can see the payout, this is if they want to negotiate
  message TEXT,
  
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, withdrawn
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(job_id, partner_id)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_job_bids_brand ON whatsapp_job_bids(brand_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_job_bids_job ON whatsapp_job_bids(job_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_job_bids_partner ON whatsapp_job_bids(partner_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_job_bids_status ON whatsapp_job_bids(status);

-- WhatsApp customers table (customers who book via WhatsApp)
CREATE TABLE IF NOT EXISTS whatsapp_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(brand_id),
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(100),
  email VARCHAR(100),
  total_quotes INTEGER DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  is_pro BOOLEAN DEFAULT FALSE,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint per brand
  UNIQUE(brand_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_customers_brand ON whatsapp_customers(brand_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_customers_phone ON whatsapp_customers(phone);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_live_conversations_updated_at
  BEFORE UPDATE ON live_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_jobs_updated_at
  BEFORE UPDATE ON whatsapp_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_job_bids_updated_at
  BEFORE UPDATE ON whatsapp_job_bids
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
  date_part TEXT;
  random_part TEXT;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  random_part := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN 'BK' || date_part || random_part;
END;
$$ LANGUAGE plpgsql;

-- Function to generate job reference
CREATE OR REPLACE FUNCTION generate_job_reference()
RETURNS TEXT AS $$
DECLARE
  date_part TEXT;
  random_part TEXT;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  random_part := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN 'JOB' || date_part || random_part;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE live_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_job_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_customers ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
-- For service role (backend), allow all operations
CREATE POLICY "Service role has full access to live_conversations"
  ON live_conversations FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to whatsapp_quotes"
  ON whatsapp_quotes FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to whatsapp_jobs"
  ON whatsapp_jobs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to partners"
  ON partners FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to whatsapp_job_bids"
  ON whatsapp_job_bids FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to whatsapp_customers"
  ON whatsapp_customers FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
