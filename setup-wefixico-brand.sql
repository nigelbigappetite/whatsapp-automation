-- Add Wefixico brand to your Supabase brands table
-- Run this in your Supabase SQL editor

INSERT INTO public.brands (
  brand_id,
  brand_name,
  brand_slug,
  description,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Wefixico',
  'wefixico',
  'Waste removal and disposal services',
  true,
  now(),
  now()
) RETURNING brand_id, brand_name, brand_slug;
