import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { Zap } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        
        {/* Brand Logo - clean & compact */}
        <BrandLogo size="default" />

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-sm font-bold text-slate-800">
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

        {/* CTA Button */}
        <div className="flex items-center gap-2">
          <Link
            href="#order-generator"
            className="neo-btn-lime px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-black flex items-center gap-1.5"
          >
            <span>Konsultasi</span>
            <span className="hidden sm:inline">Gratis</span>
            <Zap className="h-3.5 w-3.5 fill-black text-black shrink-0" />
          </Link>
        </div>

      </div>
    </header>
  );
}
