import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { Zap, ShieldCheck } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo - prominent & clear */}
        <BrandLogo size="default" />

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-800">
          <Link
            href="#layanan"
            className="hover:text-neo-blue transition-colors"
          >
            Layanan
          </Link>
          <Link
            href="#katalog-harga"
            className="hover:text-neo-blue transition-colors"
          >
            Cek Harga
          </Link>
          <Link
            href="#cara-order"
            className="hover:text-neo-blue transition-colors"
          >
            Cara Order
          </Link>
          <Link
            href="#aturan-garansi"
            className="hover:text-neo-blue transition-colors"
          >
            Aturan &amp; Garansi
          </Link>
        </nav>

        {/* CTA Button & Admin Portal Access */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin"
            className="neo-btn px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-slate-100 hover:bg-neo-yellow flex items-center gap-1.5 transition-colors"
            title="Masuk ke Portal Admin"
          >
            <ShieldCheck className="h-4 w-4 text-slate-800" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
          <Link
            href="#format-pemesanan"
            className="neo-btn-lime px-4 py-2.5 text-xs sm:text-sm font-black flex items-center gap-1.5"
          >
            <span>Konsultasi Gratis</span>
            <Zap className="h-4 w-4 fill-black text-black" />
          </Link>
        </div>
      </div>
    </header>
  );
}
