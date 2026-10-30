-- ==============================================================================
-- BANTUIN.ID — SEED DATA (INITIAL CATEGORIES, SERVICES, & SITE SETTINGS)
-- ==============================================================================

-- 1. Insert Categories
INSERT INTO public.service_categories (id, name, slug, description, badge_text, color_header, sort_order, is_active)
VALUES
  ('coding', 'IT & Coding', 'it-coding', 'Solusi kode bersih, rapi, dan terstruktur untuk proyek kampus atau prototipe bisnis.', 'HIGH-VALUE', 'bg-neo-blue text-white', 1, TRUE),
  ('design', 'Desain & UI', 'desain-ui', 'Tampilan visual modern standar industri kreatif dengan file master siap pakai.', 'TRENDING', 'bg-neo-yellow text-black', 2, TRUE),
  ('documents', 'Dokumen Riset', 'dokumen-riset', 'Penulisan presisi, sitasi valid, dan layout rapi bebas revisi format dosen pembimbing.', 'FAST DELIVERY', 'bg-neo-lavender text-black', 3, TRUE),
  ('hardware', 'IT Support', 'it-support', 'Perawatan laptop lemot, install software kuliah, dan optimasi performa mesin kerja.', 'HARDWARE & OS', 'bg-neo-mint text-black', 4, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Services
INSERT INTO public.services (id, category_id, title, slug, description, min_price, max_price, price_range_text, estimated_duration, badge_label, badge_color, sort_order, is_active)
VALUES
  ('web-landing', 'coding', 'Web Statis Landing Page (Tailwind / Bootstrap)', 'web-statis-landing-page', 'Satu halaman responsif, mobile-friendly, clean HTML/CSS/JS siap hosting.', 75000, 175000, 'Rp75.000 – Rp175.000', 'Est: 1 – 3 Hari', 'CODING', 'bg-blue-100 text-neo-blue', 1, TRUE),
  ('web-crud', 'coding', 'Aplikasi CRUD Web (Laravel / PHP Native)', 'aplikasi-crud-web', 'Sistem database MySQL, autentikasi user, kelola data master, export PDF/Excel.', 200000, 450000, 'Rp200.000 – Rp450.000', 'Est: 2 – 5 Hari', 'CODING & DB', 'bg-blue-100 text-neo-blue', 2, TRUE),
  ('slide-ppt', 'design', 'Slide Presentasi Sidang & PPT Tugas', 'slide-presentasi-sidang-ppt', '10–20 slide berkonsep modern, tipografi rapi, animasi clean, visualisasi data.', 50000, 120000, 'Rp50.000 – Rp120.000', 'Est: 1 – 2 Hari', 'DESAIN', 'bg-amber-100 text-amber-800', 3, TRUE),
  ('uiux-figma', 'design', 'Desain UI/UX Figma Mobile / Web (Prototype)', 'desain-ui-ux-figma', 'High-Fidelity screens, design token color & font, komponen terstruktur, clickable link.', 150000, 350000, 'Rp150.000 – Rp350.000', 'Est: 2 – 4 Hari', 'UI/UX', 'bg-amber-100 text-amber-800', 4, TRUE),
  ('doc-word', 'documents', 'Perapihan Format Word + Sitasi Mendeley', 'perapihan-format-word-mendeley', 'Daftar isi/tabel/gambar otomatis, perapihan margin bab & sitasi APA/IEEE otomatis.', 35000, 90000, 'Rp35.000 – Rp90.000', 'Est: 1 – 2 Hari', 'DOKUMEN', 'bg-lime-100 text-lime-900', 5, TRUE),
  ('hw-cleaning', 'hardware', 'Cleaning Fan + Repaste Thermal Paste', 'cleaning-fan-repaste-thermal-paste', 'Bongkar total debu fan heatsink, ganti pasta Arctic/Thermal Grizzly, turun hingga 15°C.', 60000, 120000, 'Rp60.000 – Rp120.000', 'Est: 2 – 4 Jam', 'HARDWARE', 'bg-blue-100 text-neo-blue', 6, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Site Settings
INSERT INTO public.site_settings (key, value)
VALUES
  ('contact', '{"whatsapp": "6282100000000", "email": "halo@bantuiin.id", "instagram": "bantuiin.id", "telegram": "bantuiin_admin"}'::JSONB),
  ('operational_hours', '{"days": "Senin - Minggu", "hours": "08.00 - 23.00 WIB", "rush_available": true}'::JSONB),
  ('policies', '{"dp_percentage": 50, "free_revision_count": 3, "revision_claim_hours": 48, "hardware_warranty_days": 7}'::JSONB)
ON CONFLICT (key) DO NOTHING;

