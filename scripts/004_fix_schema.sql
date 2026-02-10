-- Fix progress_records table to match application code
ALTER TABLE public.progress_records
  ADD COLUMN IF NOT EXISTS body_fat_percentage NUMERIC,
  ADD COLUMN IF NOT EXISTS calories_consumed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS water_liters NUMERIC,
  ADD COLUMN IF NOT EXISTS sleep_hours NUMERIC,
  ADD COLUMN IF NOT EXISTS mood TEXT;

-- Fix achievements table to match application code
ALTER TABLE public.achievements
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS charity_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unlocked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMPTZ;

-- Add created_at to achievements if missing
ALTER TABLE public.achievements
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Fix meals table - make meal_type nullable and add day_of_week
ALTER TABLE public.meals
  ALTER COLUMN meal_type DROP NOT NULL;

ALTER TABLE public.meals
  ADD COLUMN IF NOT EXISTS day_of_week TEXT;

-- Add description column to nutrition_plans if missing
ALTER TABLE public.nutrition_plans
  ADD COLUMN IF NOT EXISTS description TEXT;
