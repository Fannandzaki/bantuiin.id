# BANTUIN.ID ⚡ — Platform Solusi Tugas & IT Support Mahasiswa

Platform digital modern berkonsep **Neo-Brutalism** untuk layanan pengerjaan tugas akademik, coding/pemrograman aplikasi & web, desain grafis & presentasi, serta jasa IT support/perawatan laptop hardware.

---

## 🚀 Fitur Utama

### 1. Website Publik (Landing Page)
- **Desain Neo-Brutalism**: Tipografi tegas (*Space Grotesk* & *Plus Jakarta Sans*), border hitam tebal, bayangan keras (*hard shadow*), dan palet warna kontras tinggi.
- **Katalog Layanan & Harga Dinamis**: Layanan, rentang harga, dan estimasi waktu terhubung langsung ke Supabase PostgreSQL secara real-time.
- **Generator Pesanan WhatsApp Otomatis**: Form interaktif untuk mahasiswa menghitung estimasi biaya, memilih add-on (*Sekalian Belajar* atau *Layanan Kilat/SKS*), membuat kode invoice unik `BANTU-YYYY-XXXX`, menyimpan riwayat pesanan ke database, dan langsung terhubung ke WhatsApp Admin.
- **Kalkulator Add-on Transparan**: Perhitungan otomatis biaya bimbingan step-by-step (+Rp25.000) dan biaya pengerjaan kilat <24 jam (+30%).
- **SOP 5 Langkah & Syarat Layanan**: Alur pemesanan jelas sesuai SOP (Konsultasi & Estimasi -> DP 50% -> Pengerjaan -> Demo Hasil -> Pelunasan & Garansi 7 Hari).

### 2. Admin Console Terproteksi (`/admin`)
- **Autentikasi Aman**: Didukung Supabase Auth SSR dengan proteksi Middleware dan verifikasi Role-Based Access Control (`role = 'admin'`).
- **Dashboard Metrik Bisnis**: Menampilkan ringkasan total pesanan masuk, total pendapatan proyek selesai, pesanan aktif dalam proses, dan rasio penyelesaian.
- **Manajemen Antrean Pesanan (`/admin/pesanan`)**:
  - Filter berdasarkan status (*Menunggu DP, Dikerjakan, Menunggu Pelunasan, Selesai, Dibatalkan*).
  - Pencarian instan berdasarkan kode order, nama klien, atau nomor WhatsApp.
  - Modal pengubahan status pesanan dan penambahan catatan teknis internal.
- **Manajemen Layanan & Penyesuaian Harga (`/admin/layanan`)**:
  - Ubah teks rentang harga (misal `Rp75.000 – Rp175.000`) dan nominal min-max langsung dari antarmuka web.
  - Perbarui estimasi waktu pengerjaan.
  - Toggle aktif/nonaktif untuk menampilkan atau menyembunyikan layanan dari halaman publik.
  - Tambah layanan baru secara instan.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Server Components)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan konfigurasi token Neo-Brutalism kustom
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security / RLS, Auth SSR)
- **Validasi**: [Zod](https://zod.dev/)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **Font**: Google Fonts `Space Grotesk` (Headings/Display) & `Plus Jakarta Sans` (Body)

---

## 📁 Struktur Direktori

```text
bantuiinId/
├── public/
│   └── images/
│       └── logo.png                  # Logo resmi Bantuiin.id (auto-cropped)
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   ├── orders.ts             # Server Action: simpan pesanan & buat kode order
│   │   │   └── services.ts           # Server Action: CRUD layanan & harga dinamis
│   │   ├── admin/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── page.tsx          # Overview statistik & pesanan terbaru
│   │   │   │   ├── pesanan/page.tsx  # Kelola status & antrean pesanan
│   │   │   │   └── layanan/page.tsx  # Kelola katalog harga & layanan
│   │   │   └── login/page.tsx        # Halaman autentikasi admin
│   │   ├── layout.tsx                # Root layout & Google Fonts
│   │   └── page.tsx                  # Landing page publik terintegrasi database
│   ├── components/
│   │   ├── admin/                    # Komponen antarmuka admin console
│   │   ├── home/                     # Komponen section landing page publik
│   │   └── layout/                   # Navbar & Footer
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser Supabase client
│   │   │   ├── server.ts             # Server Component / Action Supabase client
│   │   │   └── middleware.ts         # Middleware session refresher
│   │   └── validations/
│   │       └── order.ts              # Skema validasi Zod
│   └── middleware.ts                 # Next.js route protection middleware
├── supabase/
│   ├── migrations/
│   │   └── 20261030000000_initial_schema.sql  # DDL Skema 8 Tabel + RLS Policies
│   └── seed.sql                               # Data awal 4 kategori & 6 layanan
├── .env.example                      # Contoh template konfigurasi environment
├── package.json
└── tailwind.config.ts
```

---

## ⚙️ Panduan Instalasi & Menjalankan Lokal

### 1. Prasyarat
- [Node.js](https://nodejs.org/) versi 20 ke atas.
- Package Manager: `pnpm` (disarankan) atau `npm`.

### 2. Clone Repository & Install Dependensi
```bash
git clone https://github.com/Fannandzaki/bantuiin.id.git
cd bantuiin.id
pnpm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Isi variabel berikut sesuai kredensial proyek Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_WHATSAPP_NUMBER=6281234567890
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Setup Database Supabase
1. Buka dashboard proyek Supabase Anda di [supabase.com](https://supabase.com).
2. Masuk ke menu **SQL Editor**.
3. Jalankan seluruh query dari file [`supabase/migrations/20261030000000_initial_schema.sql`](./supabase/migrations/20261030000000_initial_schema.sql).
4. Jalankan query seed data dari file [`supabase/seed.sql`](./supabase/seed.sql).

### 5. Membuat Akun Admin Pertama
1. Daftarkan email & password admin di menu **Authentication > Users** pada dashboard Supabase (atau via form pendaftaran).
2. Buka menu **SQL Editor**, lalu jalankan perintah berikut untuk memberikan hak akses Admin:
```sql
INSERT INTO public.profiles (id, full_name, email, role)
SELECT id, 'Admin Bantuiin', email, 'admin'
FROM auth.users
WHERE email = 'email-admin-anda@domain.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### 6. Menjalankan Server Development
```bash
pnpm dev
```
Buka browser dan akses:
- Website Publik: [http://localhost:3000](http://localhost:3000)
- Admin Console: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🛡️ Keamanan & RLS (Row Level Security)

- Semua tabel dilindungi oleh kebijakan RLS PostgreSQL ketat.
- Pengunjung publik (*anon*) hanya diizinkan:
  - Membaca katalog kategori dan layanan yang berstatus aktif (`is_active = true`).
  - Mengirimkan (*INSERT*) pesanan baru melalui form order.
- Data sensitif (seluruh pesanan masuk, kontak klien, nominal rincian, dan pengubahan harga) hanya dapat diakses dan diubah oleh akun yang memiliki `role = 'admin'` atau `'staff'` dalam tabel `public.profiles`.

---

## 💼 Skema SOP Bisnis

1. **Konsultasi & Estimasi**: Klien mengirimkan rincian tugas via web form ke WhatsApp. Admin menetapkan harga final & deadline.
2. **Uang Muka (DP 50%)**: Pengerjaan hanya dimulai setelah DP 50% terverifikasi.
3. **Pengerjaan & Bimbingan**: Pengerjaan dilakukan oleh tim spesialis. Jika klien memilih add-on *Sekalian Belajar*, admin menyiapkan ringkasan logika, dokumentasi baris kode, dan video bimbingan/sesi Q&A.
4. **Demo Hasil**: Hasil diperlihatkan dalam bentuk video demo, screen capture, atau file bertanda watermark.
5. **Pelunasan & Serah Terima**: Klien melunasi sisa 50%. Seluruh file sumber asli (source code, PPT, file DOCX bebas watermark) diserahkan.
6. **Garansi 7 Hari**: Klien mendapatkan revisi minor gratis selama 7 hari kalender setelah serah terima sesuai instruksi awal.

---

## 📄 Lisensi

Hak Cipta © 2026 **BANTUIN.ID**. Seluruh hak cipta dilindungi undang-undang.
