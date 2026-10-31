"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { DbService } from "@/app/actions/services";

type FilterTab = "all" | "coding" | "design" | "documents" | "hardware";

interface CatalogItem {
  id: string;
  category: FilterTab;
  badge: string;
  badgeColor: string;
  duration: string;
  title: string;
  desc: string;
  price: string;
  priceColor: string;
}

interface PricingCatalogSectionProps {
  initialServices?: DbService[];
}

export function PricingCatalogSection({ initialServices }: PricingCatalogSectionProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const getPriceColor = (category: string) => {
    switch (category) {
      case "coding":
        return "text-neo-blue";
      case "design":
        return "text-amber-600";
      case "documents":
        return "text-emerald-700";
      case "hardware":
        return "text-neo-blue";
      default:
        return "text-neo-blueDark";
    }
  };

  const getBadgeColor = (category: string) => {
    switch (category) {
      case "coding":
        return "bg-blue-100 text-neo-blue";
      case "design":
        return "bg-amber-100 text-amber-800";
      case "documents":
        return "bg-lime-100 text-lime-900";
      case "hardware":
        return "bg-blue-100 text-neo-blue";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getBadgeLabel = (category: string) => {
    switch (category) {
      case "coding":
        return "CODING";
      case "design":
        return "DESAIN";
      case "documents":
        return "DOKUMEN";
      case "hardware":
        return "HARDWARE";
      default:
        return "LAYANAN";
    }
  };

  const catalogItems: CatalogItem[] = initialServices && initialServices.length > 0
    ? initialServices.map((srv) => ({
        id: srv.id,
        category: srv.category_id as FilterTab,
        badge: srv.badge_label || getBadgeLabel(srv.category_id),
        badgeColor: srv.badge_color || getBadgeColor(srv.category_id),
        duration: srv.estimated_duration,
        title: srv.title,
        desc: srv.description,
        price: srv.price_range_text,
        priceColor: getPriceColor(srv.category_id),
      }))
    : [
        {
          id: "web-landing",
          category: "coding",
          badge: "CODING",
          badgeColor: "bg-blue-100 text-neo-blue",
          duration: "Est: 1 – 3 Hari",
          title: "Web Statis Landing Page (Tailwind / Bootstrap)",
          desc: "Satu halaman responsif, mobile-friendly, clean HTML/CSS/JS siap hosting.",
          price: "Rp75.000 – Rp175.000",
          priceColor: "text-neo-blue",
        },
        {
          id: "web-crud",
          category: "coding",
          badge: "CODING & DB",
          badgeColor: "bg-blue-100 text-neo-blue",
          duration: "Est: 2 – 5 Hari",
          title: "Aplikasi CRUD Web (Laravel / PHP Native)",
          desc: "Sistem database MySQL, autentikasi user, kelola data master, export PDF/Excel.",
          price: "Rp200.000 – Rp450.000",
          priceColor: "text-neo-blue",
        },
        {
          id: "slide-ppt",
          category: "design",
          badge: "DESAIN",
          badgeColor: "bg-amber-100 text-amber-800",
          duration: "Est: 1 – 2 Hari",
          title: "Slide Presentasi Sidang & PPT Tugas",
          desc: "10–20 slide berkonsep modern, tipografi rapi, animasi clean, visualisasi data.",
          price: "Rp50.000 – Rp120.000",
          priceColor: "text-amber-600",
        },
        {
          id: "uiux-figma",
          category: "design",
          badge: "UI/UX",
          badgeColor: "bg-amber-100 text-amber-800",
          duration: "Est: 2 – 4 Hari",
          title: "Desain UI/UX Figma Mobile / Web (Prototype)",
          desc: "High-Fidelity screens, design token color & font, komponen terstruktur, clickable link.",
          price: "Rp150.000 – Rp350.000",
          priceColor: "text-amber-600",
        },
        {
          id: "doc-word",
          category: "documents",
          badge: "DOKUMEN",
          badgeColor: "bg-lime-100 text-lime-900",
          duration: "Est: 1 – 2 Hari",
          title: "Perapihan Format Word + Sitasi Mendeley",
          desc: "Daftar isi/tabel/gambar otomatis, perapihan margin bab & sitasi APA/IEEE otomatis.",
          price: "Rp35.000 – Rp90.000",
          priceColor: "text-emerald-700",
        },
        {
          id: "hw-cleaning",
          category: "hardware",
          badge: "HARDWARE",
          badgeColor: "bg-blue-100 text-neo-blue",
          duration: "Est: 2 – 4 Jam",
          title: "Cleaning Fan + Repaste Thermal Paste",
          desc: "Bongkar total debu fan heatsink, ganti pasta Arctic/Thermal Grizzly, turun hingga 15°C.",
          price: "Rp60.000 – Rp120.000",
          priceColor: "text-neo-blue",
        },
      ];

  const filteredItems =
    activeTab === "all"
      ? catalogItems
      : catalogItems.filter((item) => item.category === activeTab);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "Semua Layanan" },
    { key: "coding", label: "Coding & IT" },
    { key: "design", label: "Desain & UI/UX" },
    { key: "documents", label: "Dokumen & Riset" },
    { key: "hardware", label: "IT Support & Laptop" },
  ];

  return (
    <section id="katalog-harga" className="py-20 bg-white border-b-2 border-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="neo-tag bg-white text-black font-mono mb-3">
            [TRANSPARANSI PENUH]
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight mb-3">
            Katalog Harga &amp; Estimasi Pengerjaan
          </h2>
          <p className="text-sm sm:text-base text-slate-700 font-medium">
            Harga realistis untuk kantong mahasiswa dengan jaminan kualitas tinggi. Bebas biaya tersembunyi.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`neo-btn text-xs sm:text-sm font-black transition-all ${
                  isActive
                    ? "bg-neo-lime text-black shadow-neo"
                    : "bg-white text-slate-800 hover:bg-slate-100 shadow-neo-sm"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="neo-box p-6 bg-white flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-neo-lg"
            >
              <div>
                {/* Meta Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`neo-tag font-mono text-[10px] ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-600">
                    {item.duration}
                  </span>
                </div>

                {/* Title & Desc */}
                <h3 className="font-heading font-black text-lg text-black mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              {/* Price & Action */}
              <div>
                <p className={`font-heading font-black text-xl mb-4 ${item.priceColor}`}>
                  {item.price}
                </p>

                <Link
                  href="#format-pemesanan"
                  className="w-full neo-btn-white py-2.5 text-xs font-black flex items-center justify-center gap-1.5 group"
                >
                  <span>Pilih Layanan Ini</span>
                  <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
