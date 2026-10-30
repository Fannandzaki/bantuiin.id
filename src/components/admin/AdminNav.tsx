"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/layout/BrandLogo";
import {
  LayoutDashboard,
  Inbox,
  Layers,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { adminLogout } from "@/app/actions/auth";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Antrean Pesanan",
      href: "/admin/pesanan",
      icon: Inbox,
      exact: false,
    },
    {
      label: "Katalog Layanan",
      href: "/admin/layanan",
      icon: Layers,
      exact: false,
    },
  ];

  const handleLogout = async () => {
    await adminLogout();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-black bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand + Console Tag */}
        <div className="flex items-center gap-3">
          <BrandLogo size="default" />
          <span className="neo-tag bg-neo-yellow text-black font-mono text-[10px] hidden sm:inline-block">
            ADMIN CONSOLE
          </span>
        </div>

        {/* Center: Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`neo-btn py-1.5 px-3 text-xs font-black flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-neo-lime text-black shadow-neo-sm"
                    : "bg-white text-slate-700 hover:bg-slate-50 shadow-none border-transparent hover:border-black"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: External Link & Logout */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="neo-btn-white py-1.5 px-2.5 text-xs font-bold hidden md:inline-flex items-center gap-1"
            title="Buka Website Publik"
          >
            <span>Lihat Web</span>
            <ExternalLink className="h-3 w-3 text-slate-500" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="neo-btn-dark py-1.5 px-3 text-xs font-black flex items-center gap-1.5"
            title="Keluar dari Admin Console"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
}

