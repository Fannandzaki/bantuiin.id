import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { CheckCircle2, ShieldCheck, MessageCircle, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t-2 border-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Column 1: Brand & Tagline */}
          <div className="lg:col-span-4">
            <div className="mb-4">
              <BrandLogo size="default" />
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-5 max-w-sm">
              Partner andalan solusi tugas akademik, skripsi, IT coding, dan konsultasi riset kilat dengan standar anti-plagiasi dan jaminan garansi tuntas.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="neo-tag bg-neo-lime text-black font-mono">
                24/7 SUPPORT
              </span>
              <span className="neo-tag bg-neo-yellow text-black font-mono">
                100% LEGAL
              </span>
            </div>
          </div>

          {/* Column 2: Navigasi */}
          <div className="lg:col-span-2">
            <h4 className="font-heading font-black text-xs uppercase tracking-wider text-black mb-4">
              NAVIGASI
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-bold text-slate-700">
              <li>
                <Link href="#layanan" className="hover:text-neo-blue transition-colors">
                  Layanan Utama
                </Link>
              </li>
              <li>
                <Link href="#katalog-harga" className="hover:text-neo-blue transition-colors">
                  Kalkulator Harga
                </Link>
              </li>
              <li>
                <Link href="#cara-order" className="hover:text-neo-blue transition-colors">
                  Panduan Order
                </Link>
              </li>
              <li>
                <Link href="#aturan-garansi" className="hover:text-neo-blue transition-colors">
                  Kebijakan Revisi
                </Link>
              </li>
              <li>
                <Link href="#cara-order" className="hover:text-neo-blue transition-colors">
                  Bukti Pengerjaan
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Jaminan & Standar */}
          <div className="lg:col-span-3">
            <h4 className="font-heading font-black text-xs uppercase tracking-wider text-black mb-4">
              JAMINAN &amp; STANDAR
            </h4>
            
            <div className="space-y-3">
              <div className="p-3 border-2 border-black rounded-lg bg-slate-50">
                <div className="flex items-center gap-1.5 text-xs font-black text-black">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>100% Garansi Uang Kembali</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-1">
                  Jika hasil melenceng dari brief awal.
                </p>
              </div>

              <div className="p-3 border-2 border-black rounded-lg bg-slate-50">
                <div className="flex items-center gap-1.5 text-xs font-black text-black">
                  <ShieldCheck className="h-4 w-4 text-neo-blue" />
                  <span>Privasi Dokumen Terkunci</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-1">
                  Enkripsi ketat &amp; NDA terjamin.
                </p>
              </div>
            </div>
          </div>

          {/* Column 4: Metode Pembayaran */}
          <div className="lg:col-span-3">
            <h4 className="font-heading font-black text-xs uppercase tracking-wider text-black mb-4">
              METODE PEMBAYARAN
            </h4>
            <p className="text-xs text-slate-600 font-medium mb-3">
              Terima transaksi otomatis &amp; manual via bank &amp; e-wallet nasional:
            </p>
            <div className="flex flex-wrap gap-1.5 mb-5 font-mono text-[10px] font-black">
              <span className="px-2 py-1 border-2 border-black rounded bg-white shadow-neo-sm">QRIS</span>
              <span className="px-2 py-1 border-2 border-black rounded bg-white shadow-neo-sm">GOPAY</span>
              <span className="px-2 py-1 border-2 border-black rounded bg-white shadow-neo-sm">OVO</span>
              <span className="px-2 py-1 border-2 border-black rounded bg-white shadow-neo-sm">DANA</span>
              <span className="px-2 py-1 border-2 border-black rounded bg-white shadow-neo-sm">SEABANK</span>
            </div>

            <p className="font-mono text-[11px] font-black uppercase text-black mb-2">
              Official Channels:
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://wa.me/6282100000000"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded border-2 border-black bg-slate-100 hover:bg-neo-lime flex items-center justify-center transition-colors shadow-neo-sm"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4 text-black" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded border-2 border-black bg-slate-100 hover:bg-neo-lime flex items-center justify-center transition-colors shadow-neo-sm"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded border-2 border-black bg-slate-100 hover:bg-neo-lime flex items-center justify-center transition-colors shadow-neo-sm"
                aria-label="Telegram"
              >
                <Send className="h-4 w-4 text-black" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-600">
          <p>© 2026 bantuiin.id — All Rights Reserved. Dibangun untuk Mahasiswa &amp; Profesional Tangguh.</p>
          <div className="flex items-center gap-4 text-slate-800 font-bold">
            <Link href="#aturan-garansi" className="hover:underline">
              Syarat &amp; Ketentuan
            </Link>
            <span>|</span>
            <Link href="#aturan-garansi" className="hover:underline">
              Kebijakan Privasi
            </Link>
            <span>|</span>
            <Link href="/admin" className="hover:underline text-neo-blue flex items-center gap-1">
              <span>Portal Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
