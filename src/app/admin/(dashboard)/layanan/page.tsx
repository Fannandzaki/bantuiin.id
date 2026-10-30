import { SERVICE_CATEGORIES, SERVICE_ITEMS } from "@/data/services";
import { Layers, Clock, CheckCircle2 } from "lucide-react";

export default function AdminLayananPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-black">
            Katalog Layanan &amp; Struktur Harga
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Konfigurasi 4 pilar solusi utama dan parameter estimasi harga awal (Starting From).
          </p>
        </div>
      </div>

      {/* 4 Pillars Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {SERVICE_CATEGORIES.map((cat) => (
          <div key={cat.id} className="neo-box overflow-hidden bg-white shadow-neo-sm">
            <div className={`p-4 border-b-2 border-black flex items-center justify-between ${cat.colorHeader}`}>
              <h3 className={`font-heading font-black text-base ${cat.textColor || "text-black"}`}>
                {cat.name}
              </h3>
              <span className="neo-tag bg-neo-lime text-black font-mono text-[10px]">
                {cat.startPriceText}
              </span>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {cat.description}
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Katalog Aktif Publik</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Service Items Table */}
      <div className="neo-box overflow-hidden bg-white shadow-neo">
        <div className="p-4 sm:p-5 border-b-2 border-black bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-neo-blue" />
            <h2 className="font-heading font-black text-lg text-black">
              Daftar Layanan Terdaftar
            </h2>
          </div>
          <span className="neo-tag bg-neo-lime text-black font-mono text-xs">
            {SERVICE_ITEMS.length} LAYANAN AKTIF
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-black bg-slate-100 text-slate-800 font-mono font-black uppercase text-[11px]">
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Nama Layanan</th>
                <th className="p-3.5">Deskripsi Singkat</th>
                <th className="p-3.5">Estimasi Pengerjaan</th>
                <th className="p-3.5">Rentang Harga</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y border-black font-medium text-slate-800">
              {SERVICE_ITEMS.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5">
                    <span className={`neo-tag font-mono text-[10px] ${item.tagColor}`}>
                      {item.categoryLabel}
                    </span>
                  </td>
                  <td className="p-3.5 font-black text-black">
                    {item.title}
                  </td>
                  <td className="p-3.5 text-slate-600 max-w-xs">
                    {item.description}
                  </td>
                  <td className="p-3.5 font-mono text-slate-700 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>{item.estimatedDuration}</span>
                  </td>
                  <td className="p-3.5 font-mono font-black text-neo-blueDark">
                    {item.priceRange}
                  </td>
                  <td className="p-3.5">
                    <span className="neo-tag bg-emerald-100 text-emerald-900 font-mono text-[10px]">
                      PUBLISHED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

