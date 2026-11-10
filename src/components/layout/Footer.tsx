import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { MessageCircle, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t-2 border-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 lg:py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-6 lg:gap-8 items-start">
          
          {/* Section A: Brand & Deskripsi */}
          <div className="md:col-span-5 lg:col-span-5">
            <div className="mb-1.5 sm:mb-2">
              <BrandLogo size="default" />
            </div>
            <p className="text-xs text-slate-600 font-medium leading-normal sm:leading-relaxed max-w-sm">
              Partner solusi akademik, IT, dan kreatif untuk membantu kebutuhan digital Anda secara profesional dan terpercaya.
            </p>
          </div>

          {/* Section B: Navigasi (2 kolom di mobile, 1 kolom di tablet/desktop) */}
          <nav className="md:col-span-3 lg:col-span-3" aria-label="Footer Navigation">
            <h4 className="font-heading font-black text-xs uppercase tracking-wider text-black mb-1.5 sm:mb-2">
              NAVIGASI
            </h4>
            <ul className="grid grid-cols-2 md:grid-cols-1 gap-y-1 sm:gap-y-1.5 gap-x-4 text-xs font-bold text-slate-700">
              <li>
                <Link href="#layanan" className="hover:text-neo-blue transition-colors leading-tight inline-block py-0.5">
                  Layanan Utama
                </Link>
              </li>
              <li>
                <Link href="#katalog-harga" className="hover:text-neo-blue transition-colors leading-tight inline-block py-0.5">
                  Kalkulator Harga
                </Link>
              </li>
              <li>
                <Link href="#cara-order" className="hover:text-neo-blue transition-colors leading-tight inline-block py-0.5">
                  Panduan Order
                </Link>
              </li>
              <li>
                <Link href="#aturan-garansi" className="hover:text-neo-blue transition-colors leading-tight inline-block py-0.5">
                  Kebijakan Revisi
                </Link>
              </li>
              <li>
                <Link href="#cara-order" className="hover:text-neo-blue transition-colors leading-tight inline-block py-0.5">
                  Bukti Pengerjaan
                </Link>
              </li>
            </ul>
          </nav>

          {/* Section C: Trust & Contact (Metode Pembayaran + Official Channels) */}
          <div className="md:col-span-4 lg:col-span-4">
            {/* Metode Pembayaran */}
            <div className="mb-2.5 sm:mb-3">
              <h4 className="font-heading font-black text-xs uppercase tracking-wider text-black mb-1.5">
                METODE PEMBAYARAN
              </h4>
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 font-mono text-[9px] font-black text-black">
                <span className="px-1.5 sm:px-2 py-0.5 border border-black rounded bg-white shadow-[1px_1px_0px_#000]">
                  QRIS
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 border border-black rounded bg-white shadow-[1px_1px_0px_#000]">
                  GoPay
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 border border-black rounded bg-white shadow-[1px_1px_0px_#000]">
                  OVO
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 border border-black rounded bg-white shadow-[1px_1px_0px_#000]">
                  DANA
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 border border-black rounded bg-white shadow-[1px_1px_0px_#000]">
                  SeaBank
                </span>
              </div>
            </div>

            {/* Official Channels */}
            <div>
              <p className="font-mono text-[10px] font-black uppercase text-black mb-1">
                Official Channels:
              </p>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <a
                  href="https://wa.me/6282100000000"
                  target="_blank"
                  rel="noreferrer"
                  className="h-7 w-7 rounded border-2 border-black bg-slate-50 hover:bg-neo-lime hover:shadow-neo-sm flex items-center justify-center transition-all"
                  aria-label="WhatsApp Resmi"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-black" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="h-7 w-7 rounded border-2 border-black bg-slate-50 hover:bg-neo-lime hover:shadow-neo-sm flex items-center justify-center transition-all"
                  aria-label="Instagram Resmi"
                >
                  <svg className="h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noreferrer"
                  className="h-7 w-7 rounded border-2 border-black bg-slate-50 hover:bg-neo-lime hover:shadow-neo-sm flex items-center justify-center transition-all"
                  aria-label="Telegram Resmi"
                >
                  <Send className="h-3.5 w-3.5 text-black" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Section D: Bottom Footer */}
        <div className="mt-3.5 sm:mt-5 pt-2.5 sm:pt-3 border-t border-black/15 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 font-mono text-[10px] sm:text-xs text-slate-600">
          <p>© 2026 bantuin.id — All Rights Reserved.</p>
          <div className="flex items-center gap-2.5 sm:gap-3 text-slate-800 font-bold">
            <Link href="#aturan-garansi" className="hover:underline">
              Syarat &amp; Ketentuan
            </Link>
            <span className="text-slate-400">|</span>
            <Link href="#aturan-garansi" className="hover:underline">
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
