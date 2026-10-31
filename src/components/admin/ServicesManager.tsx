"use client";

import { useState } from "react";
import {
  DbService,
  updateServiceAction,
  createServiceAction,
  ServiceInput,
} from "@/app/actions/services";
import {
  Layers,
  Edit3,
  Plus,
  CheckCircle2,
  X,
  Loader2,
  Clock,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";

interface ServicesManagerProps {
  initialServices: DbService[];
}

export function ServicesManager({ initialServices }: ServicesManagerProps) {
  const [services, setServices] = useState<DbService[]>(initialServices);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal State
  const [editingService, setEditingService] = useState<DbService | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State for Editing or Creating
  const [formData, setFormData] = useState<ServiceInput>({
    title: "",
    category_id: "coding",
    description: "",
    price_range_text: "",
    min_price: 50000,
    max_price: 150000,
    estimated_duration: "Est: 1 – 3 Hari",
    badge_label: "LAYANAN",
    badge_color: "bg-blue-100 text-blue-900",
    is_active: true,
  });

  const categories = [
    { id: "all", name: "Semua Kategori" },
    { id: "coding", name: "IT & Coding" },
    { id: "design", name: "Desain & UI" },
    { id: "documents", name: "Dokumen Riset" },
    { id: "hardware", name: "IT Support" },
  ];

  const filteredServices = services.filter((srv) => {
    if (categoryFilter !== "all" && srv.category_id !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        srv.title.toLowerCase().includes(q) ||
        srv.description.toLowerCase().includes(q) ||
        srv.price_range_text.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenEdit = (service: DbService) => {
    setEditingService(service);
    setIsAddingNew(false);
    setFormData({
      title: service.title,
      category_id: service.category_id,
      description: service.description,
      price_range_text: service.price_range_text,
      min_price: service.min_price,
      max_price: service.max_price,
      estimated_duration: service.estimated_duration,
      badge_label: service.badge_label || "LAYANAN",
      badge_color: service.badge_color || "bg-blue-100 text-blue-900",
      is_active: service.is_active,
    });
  };

  const handleOpenCreate = () => {
    setEditingService(null);
    setIsAddingNew(true);
    setFormData({
      title: "",
      category_id: categoryFilter !== "all" ? categoryFilter : "coding",
      description: "",
      price_range_text: "Rp50.000 – Rp150.000",
      min_price: 50000,
      max_price: 150000,
      estimated_duration: "Est: 1 – 3 Hari",
      badge_label: "LAYANAN",
      badge_color: "bg-blue-100 text-blue-900",
      is_active: true,
    });
  };

  const handleCloseModal = () => {
    setEditingService(null);
    setIsAddingNew(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);

    if (isAddingNew) {
      const result = await createServiceAction(formData);
      setIsSaving(false);
      if (result.success) {
        setNotification("Layanan baru berhasil ditambahkan!");
        // Refresh local state
        const newMock: DbService = {
          id: `srv-${Date.now()}`,
          category_id: formData.category_id,
          title: formData.title,
          slug: formData.title.toLowerCase().replace(/\s+/g, "-"),
          description: formData.description,
          min_price: formData.min_price,
          max_price: formData.max_price,
          price_range_text: formData.price_range_text,
          estimated_duration: formData.estimated_duration,
          badge_label: formData.badge_label || "LAYANAN",
          badge_color: formData.badge_color || "bg-blue-100 text-blue-900",
          sort_order: services.length + 1,
          is_active: formData.is_active ?? true,
        };
        setServices([...services, newMock]);
        handleCloseModal();
        setTimeout(() => setNotification(null), 3000);
      } else {
        alert(result.error || "Gagal menyimpan layanan");
      }
    } else if (editingService) {
      const result = await updateServiceAction(editingService.id, formData);
      setIsSaving(false);
      if (result.success) {
        setNotification("Harga & data layanan berhasil diperbarui!");
        setServices((prev) =>
          prev.map((s) =>
            s.id === editingService.id
              ? {
                  ...s,
                  ...formData,
                  badge_label: formData.badge_label || null,
                  badge_color: formData.badge_color || null,
                  is_active: formData.is_active ?? true,
                }
              : s
          )
        );
        handleCloseModal();
        setTimeout(() => setNotification(null), 3000);
      } else {
        alert(result.error || "Gagal memperbarui layanan");
      }
    }
  };

  const handleQuickToggleActive = async (service: DbService) => {
    const nextState = !service.is_active;
    const result = await updateServiceAction(service.id, { is_active: nextState });
    if (result.success) {
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, is_active: nextState } : s))
      );
      setNotification(
        `Layanan ${nextState ? "ditampilkan di publik" : "disembunyikan dari publik"}.`
      );
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Success Notification Alert */}
      {notification && (
        <div className="p-4 border-2 border-black rounded-lg bg-emerald-100 text-emerald-950 flex items-center gap-2.5 text-xs sm:text-sm font-bold shadow-neo-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Control Bar: Search, Category Filter, and Add Button */}
      <div className="neo-box p-4 bg-white shadow-neo-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="w-full md:w-80 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Cari layanan atau harga..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm font-medium border-2 border-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neo-lime"
            />
          </div>

          {/* Add New Service Button */}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="w-full md:w-auto neo-btn-lime py-2 px-4 text-xs font-black flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Layanan Baru</span>
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold border transition-colors ${
                categoryFilter === cat.id
                  ? "bg-black text-white border-black font-black"
                  : "bg-slate-100 text-slate-700 border-transparent hover:border-slate-400"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <div className="neo-box overflow-hidden bg-white shadow-neo">
        <div className="p-4 sm:p-5 border-b-2 border-black bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-neo-blue" />
            <h2 className="font-heading font-black text-base sm:text-lg text-black">
              Katalog Layanan &amp; Penyesuaian Harga
            </h2>
          </div>
          <span className="neo-tag bg-neo-lime text-black font-mono text-xs">
            {filteredServices.length} LAYANAN
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-black bg-slate-100 text-slate-800 font-mono font-black uppercase text-[11px]">
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Nama Layanan</th>
                <th className="p-3.5">Rentang Harga Teks</th>
                <th className="p-3.5">Estimasi Waktu</th>
                <th className="p-3.5">Status Publikasi</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y border-black font-medium text-slate-800">
              {filteredServices.map((srv) => (
                <tr key={srv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5">
                    <span className="neo-tag font-mono text-[10px] bg-slate-100 text-slate-800">
                      {srv.category_id.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <p className="font-black text-black text-sm">{srv.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 max-w-sm mt-0.5">
                      {srv.description}
                    </p>
                  </td>
                  <td className="p-3.5 font-mono font-black text-neo-blueDark text-sm">
                    {srv.price_range_text}
                  </td>
                  <td className="p-3.5 font-mono text-slate-700 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>{srv.estimated_duration}</span>
                  </td>
                  <td className="p-3.5">
                    <button
                      type="button"
                      onClick={() => handleQuickToggleActive(srv)}
                      className={`neo-tag font-mono text-[10px] flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-80 ${
                        srv.is_active
                          ? "bg-emerald-100 text-emerald-900 border-emerald-500"
                          : "bg-slate-200 text-slate-600 border-slate-400"
                      }`}
                      title="Klik untuk mengubah status aktif"
                    >
                      {srv.is_active ? (
                        <>
                          <Eye className="h-2.5 w-2.5" />
                          <span>PUBLIK (AKTIF)</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-2.5 w-2.5" />
                          <span>DISEMBUNYIKAN</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(srv)}
                      className="neo-btn-white py-1.5 px-3 text-xs font-mono font-bold flex items-center gap-1 ml-auto"
                    >
                      <Edit3 className="h-3 w-3 text-slate-700" />
                      <span>Ubah Harga</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit or Create Service */}
      {(editingService || isAddingNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="neo-box max-w-xl w-full bg-white max-h-[90vh] overflow-y-auto shadow-neo-lg p-6 sm:p-7">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-5">
              <h3 className="font-heading font-black text-xl text-black">
                {isAddingNew ? "Tambah Layanan Baru" : "Ubah Data & Harga Layanan"}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded border border-black hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-800 mb-1">
                  Nama / Judul Layanan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Cth: Aplikasi CRUD Laravel Fullstack"
                  className="w-full px-3 py-2 text-xs sm:text-sm font-medium border-2 border-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neo-lime"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-800 mb-1">
                    Kategori Layanan *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-lg bg-white focus:outline-none"
                  >
                    <option value="coding">IT &amp; Coding</option>
                    <option value="design">Desain &amp; UI</option>
                    <option value="documents">Dokumen Riset</option>
                    <option value="hardware">IT Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-800 mb-1">
                    Estimasi Pengerjaan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.estimated_duration}
                    onChange={(e) =>
                      setFormData({ ...formData, estimated_duration: e.target.value })
                    }
                    placeholder="Cth: Est: 1 – 3 Hari / Est: 24 Jam"
                    className="w-full px-3 py-2 text-xs sm:text-sm font-medium border-2 border-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neo-lime"
                  />
                </div>
              </div>

              {/* Price Range Settings */}
              <div className="p-3.5 border-2 border-black rounded-lg bg-neo-surface space-y-3">
                <p className="font-heading font-black text-xs text-black">
                  Pengaturan Tampilan Harga
                </p>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-800 mb-1">
                    Teks Rentang Harga (Ditampilkan di Website) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.price_range_text}
                    onChange={(e) =>
                      setFormData({ ...formData, price_range_text: e.target.value })
                    }
                    placeholder="Cth: Rp75.000 – Rp175.000"
                    className="w-full px-3 py-2 text-xs sm:text-sm font-bold font-mono border-2 border-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neo-lime text-neo-blueDark"
                  />
                  <span className="text-[10px] text-slate-500 font-medium">
                    Teks ini yang akan langsung terbaca oleh calon klien di katalog harga.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
                      Nominal Min (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.min_price}
                      onChange={(e) =>
                        setFormData({ ...formData, min_price: Number(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-black rounded bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
                      Nominal Max (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.max_price}
                      onChange={(e) =>
                        setFormData({ ...formData, max_price: Number(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-black rounded bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-800 mb-1">
                  Deskripsi Lingkup Pekerjaan *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Jelaskan apa yang didapatkan klien..."
                  className="w-full px-3 py-2 text-xs font-medium border-2 border-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neo-lime"
                ></textarea>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_active_toggle"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="h-4 w-4 accent-neo-blue border-2 border-black rounded cursor-pointer"
                />
                <label
                  htmlFor="is_active_toggle"
                  className="text-xs font-bold text-slate-800 cursor-pointer"
                >
                  Tampilkan layanan ini di website publik
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="neo-btn-white py-2 px-4 text-xs font-black"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="neo-btn-lime py-2 px-5 text-xs font-black flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan ke Database...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{isAddingNew ? "Tambah Layanan" : "Simpan Perubahan"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
