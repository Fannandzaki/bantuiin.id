-- ==============================================================================
-- BANTUIN.ID — SECURE QUOTATIONS & PAYMENT RECORDS RLS HARDENING
-- Fixes: SEC-05 (Quotations exposure guard) & Payment Records Strict RLS
-- ==============================================================================

-- 1. Ensure RLS is active
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- 2. Clean up legacy broad quotation policies
DROP POLICY IF EXISTS "Staff or admin can view and manage quotations" ON public.quotations;
DROP POLICY IF EXISTS "Only staff or admin can view quotations" ON public.quotations;
DROP POLICY IF EXISTS "Only staff or admin can insert quotations" ON public.quotations;
DROP POLICY IF EXISTS "Only staff or admin can update quotations" ON public.quotations;
DROP POLICY IF EXISTS "Only admin can delete quotations" ON public.quotations;

-- 3. Strict granular policies for quotations
CREATE POLICY "Only staff or admin can view quotations"
  ON public.quotations FOR SELECT
  USING (public.is_staff_or_admin());

CREATE POLICY "Only staff or admin can insert quotations"
  ON public.quotations FOR INSERT
  WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "Only staff or admin can update quotations"
  ON public.quotations FOR UPDATE
  USING (public.is_staff_or_admin());

CREATE POLICY "Only admin can delete quotations"
  ON public.quotations FOR DELETE
  USING (public.is_admin());

-- 4. Ensure payment records deletion is strictly restricted to admin
DROP POLICY IF EXISTS "Only admin can delete payment records" ON public.payment_records;
CREATE POLICY "Only admin can delete payment records"
  ON public.payment_records FOR DELETE
  USING (public.is_admin());
