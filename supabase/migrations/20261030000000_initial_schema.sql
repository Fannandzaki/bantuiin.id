-- ==============================================================================
-- BANTUIN.ID — INITIAL DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) MIGRATION
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------------------------
CREATE TYPE public.user_role AS ENUM ('admin', 'staff');
CREATE TYPE public.order_type AS ENUM ('digital_task', 'hardware_service');
CREATE TYPE public.order_status AS ENUM (
  'new_inquiry',
  'under_review',
  'quotation_sent',
  'awaiting_dp',
  'in_progress',
  'awaiting_final_payment',
  'revision',
  'completed',
  'cancelled'
);
CREATE TYPE public.payment_type AS ENUM ('dp', 'full', 'final');
CREATE TYPE public.payment_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE public.quotation_status AS ENUM ('draft', 'sent', 'accepted', 'rejected');

-- ------------------------------------------------------------------------------
-- 2. PROFILES TABLE (Linked to Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'staff',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. SERVICE CATEGORIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE public.service_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  badge_text TEXT,
  color_header TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. SERVICES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE public.services (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  min_price BIGINT NOT NULL DEFAULT 0,
  max_price BIGINT NOT NULL DEFAULT 0,
  price_range_text TEXT NOT NULL,
  estimated_duration TEXT NOT NULL,
  badge_label TEXT,
  badge_color TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. ORDERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT NOT NULL UNIQUE,
  order_type public.order_type NOT NULL DEFAULT 'digital_task',
  customer_name TEXT NOT NULL,
  customer_contact TEXT NOT NULL,
  service_category TEXT,
  format_output TEXT,
  instructions TEXT NOT NULL,
  deadline TEXT NOT NULL,
  include_learn_package BOOLEAN NOT NULL DEFAULT FALSE,
  hardware_details JSONB NOT NULL DEFAULT '{}'::JSONB,
  status public.order_status NOT NULL DEFAULT 'new_inquiry',
  total_price BIGINT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. ORDER STATUS HISTORY TABLE (Audit Trail)
-- ------------------------------------------------------------------------------
CREATE TABLE public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status public.order_status,
  to_status public.order_status NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. QUOTATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  quotation_number TEXT NOT NULL UNIQUE,
  total_amount BIGINT NOT NULL,
  dp_amount BIGINT NOT NULL,
  final_amount BIGINT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::JSONB,
  valid_until TIMESTAMPTZ,
  status public.quotation_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. PAYMENT RECORDS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE public.payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  payment_type public.payment_type NOT NULL,
  amount BIGINT NOT NULL,
  payment_method TEXT NOT NULL,
  proof_url TEXT,
  status public.payment_status NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. SITE SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX idx_orders_order_code ON public.orders(order_code);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_services_category_id ON public.services(category_id);
CREATE INDEX idx_services_is_active ON public.services(is_active);
CREATE INDEX idx_quotations_order_id ON public.quotations(order_id);
CREATE INDEX idx_payment_records_order_id ON public.payment_records(order_id);

-- ------------------------------------------------------------------------------
-- 11. AUTOMATED UPDATED_AT TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profiles_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_update_orders_timestamp
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 12. HELPER FUNCTIONS FOR SECURITY (RLS)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- A. PROFILES POLICIES
CREATE POLICY "Users can read own profile or staff can read all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_staff_or_admin());

CREATE POLICY "Admin can update profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- B. SERVICE CATEGORIES POLICIES
CREATE POLICY "Public can view active service categories"
  ON public.service_categories FOR SELECT
  USING (is_active = TRUE OR public.is_staff_or_admin());

CREATE POLICY "Only admin can modify service categories"
  ON public.service_categories FOR ALL
  USING (public.is_admin());

-- C. SERVICES POLICIES
CREATE POLICY "Public can view active services"
  ON public.services FOR SELECT
  USING (is_active = TRUE OR public.is_staff_or_admin());

CREATE POLICY "Only admin can modify services"
  ON public.services FOR ALL
  USING (public.is_admin());

-- D. ORDERS POLICIES (Critical: Private Data Protection)
-- Public can ONLY insert new orders (Inquiry submission)
CREATE POLICY "Public can insert new orders"
  ON public.orders FOR INSERT
  WITH CHECK (TRUE);

-- Public CANNOT select all orders. Only staff or admin can read orders.
CREATE POLICY "Only staff or admin can view orders"
  ON public.orders FOR SELECT
  USING (public.is_staff_or_admin());

CREATE POLICY "Only staff or admin can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_staff_or_admin());

-- E. ORDER STATUS HISTORY POLICIES
CREATE POLICY "Only staff or admin can view order status history"
  ON public.order_status_history FOR SELECT
  USING (public.is_staff_or_admin());

CREATE POLICY "Only staff or admin can insert order status history"
  ON public.order_status_history FOR INSERT
  WITH CHECK (public.is_staff_or_admin());

-- F. QUOTATIONS POLICIES
CREATE POLICY "Staff or admin can view and manage quotations"
  ON public.quotations FOR ALL
  USING (public.is_staff_or_admin());

-- G. PAYMENT RECORDS POLICIES
CREATE POLICY "Public can insert payment proof with order"
  ON public.payment_records FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Only staff or admin can view and manage payment records"
  ON public.payment_records FOR SELECT
  USING (public.is_staff_or_admin());

CREATE POLICY "Only admin can verify payments"
  ON public.payment_records FOR UPDATE
  USING (public.is_admin());

-- H. SITE SETTINGS POLICIES
CREATE POLICY "Public can view site settings"
  ON public.site_settings FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admin can update site settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin());

