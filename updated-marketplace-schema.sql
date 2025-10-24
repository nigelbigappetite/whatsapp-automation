-- Updated Waste Removal Marketplace Schema with Brand Attribution
-- All tables now include brand_id to attribute data to Wefixico

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(brand_id),
  customer_phone VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_brand ON conversations(brand_id);
CREATE INDEX idx_conversations_phone ON conversations(customer_phone);
CREATE INDEX idx_conversations_status ON conversations(status);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(brand_id),
  customer_phone VARCHAR(20) NOT NULL,
  message_id VARCHAR(100),
  message_type VARCHAR(20),
  content TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_brand ON messages(brand_id);
CREATE INDEX idx_messages_phone ON messages(customer_phone);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);

-- Quotes table (updated for tender model)
CREATE TABLE quotes (
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

CREATE INDEX idx_quotes_brand ON quotes(brand_id);
CREATE INDEX idx_quotes_phone ON quotes(customer_phone);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created ON quotes(created_at);
CREATE INDEX idx_quotes_booking_ref ON quotes(booking_reference);

-- Jobs table (when quote is booked, it becomes a job/tender)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(brand_id),
  quote_id UUID REFERENCES quotes(id),
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

CREATE INDEX idx_jobs_brand ON jobs(brand_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_customer_phone ON jobs(customer_phone);
CREATE INDEX idx_jobs_assigned_partner ON jobs(assigned_partner_id);
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at);
CREATE INDEX idx_jobs_reference ON jobs(job_reference);

-- Partners table (waste removal service providers)
CREATE TABLE partners (
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

CREATE INDEX idx_partners_brand ON partners(brand_id);
CREATE INDEX idx_partners_email ON partners(email);
CREATE INDEX idx_partners_active ON partners(is_active);

-- Partner bids/interest (if you want partners to bid rather than first-come)
CREATE TABLE job_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(brand_id),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id),
  
  -- Bid details
  proposed_payout DECIMAL(10,2), -- Partner can see the payout, this is if they want to negotiate
  message TEXT,
  
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, withdrawn
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(job_id, partner_id)
);

CREATE INDEX idx_job_bids_brand ON job_bids(brand_id);
CREATE INDEX idx_job_bids_job ON job_bids(job_id);
CREATE INDEX idx_job_bids_partner ON job_bids(partner_id);
CREATE INDEX idx_job_bids_status ON job_bids(status);

-- Customers table (optional - for tracking returning customers)
CREATE TABLE customers (
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

CREATE INDEX idx_customers_brand ON customers(brand_id);
CREATE INDEX idx_customers_phone ON customers(phone);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_bids_updated_at
  BEFORE UPDATE ON job_bids
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
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
-- For service role (backend), allow all operations
CREATE POLICY "Service role has full access to conversations"
  ON conversations FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to messages"
  ON messages FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to quotes"
  ON quotes FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to jobs"
  ON jobs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to partners"
  ON partners FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to job_bids"
  ON job_bids FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to customers"
  ON customers FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
