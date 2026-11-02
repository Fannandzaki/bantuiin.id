-- ==============================================================================
-- BANTUIN.ID — PRIORITY & AFTER-HOURS SURCHARGE SYSTEM MIGRATION
-- Adds structured deadline, start time preference, surcharge percentages,
-- and priority approval workflow to orders and quotations.
-- ==============================================================================

-- 1. Extend public.orders table with priority & after-hours metadata
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS requested_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS requested_start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS start_time_preference TEXT DEFAULT 'asap',
  ADD COLUMN IF NOT EXISTS deadline_surcharge_percent INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS after_hours_surcharge_percent INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_surcharge_percent INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS priority_status TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS priority_rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS admin_adjustment_reason TEXT;

-- 2. Add performance indexes for admin filtering
CREATE INDEX IF NOT EXISTS idx_orders_requested_deadline ON public.orders(requested_deadline);
CREATE INDEX IF NOT EXISTS idx_orders_priority_status ON public.orders(priority_status);

-- 3. Ensure RLS policies allow admin & staff to manage quotations
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin and staff can manage quotations" ON public.quotations;
CREATE POLICY "Admin and staff can manage quotations"
  ON public.quotations FOR ALL
  TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Public can view valid quotations by quotation_number" ON public.quotations;
CREATE POLICY "Public can view valid quotations by quotation_number"
  ON public.quotations FOR SELECT
  TO anon
  USING (true);

