-- ==============================================================================
-- BANTUIN.ID — SECURITY HARDENING MIGRATION
-- Fixes: SEC-06 (search_path hijacking), SEC-09 (payment_records RLS), DB-01 (profiles INSERT)
-- ==============================================================================

-- 1. Pin search_path on SECURITY DEFINER functions to prevent schema hijacking
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Tighten payment_records RLS: verify associated order exists before allowing public insert
DROP POLICY IF EXISTS "Public can insert payment proof with order" ON public.payment_records;
CREATE POLICY "Public can insert payment proof with valid order"
  ON public.payment_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payment_records.order_id
    )
  );

-- 3. Allow admins to insert new profiles
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
CREATE POLICY "Admin can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin());

