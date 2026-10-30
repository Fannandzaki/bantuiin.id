"use client";

import { useState } from "react";
import { AdminOrder, OrderStatus, OrderType } from "@/types";
import { updateOrderStatusAction } from "@/app/actions/admin-orders";
import { formatRupiah } from "@/lib/utils";
import {
  Search,
  Filter,
  MessageCircle,
  FileCode,
  Laptop,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  Edit3,
} from "lucide-react";

interface OrdersManagerProps {
  initialOrders: AdminOrder[];
}

export function OrdersManager({ initialOrders }: OrdersManagerProps) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<OrderType | "all">("all");

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("new_inquiry");
  const [statusNote, setStatusNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: "new_inquiry", label: "Inquiry Baru" },
    { value: "under_review", label: "Sedang Ditinjau" },
    { value: "quotation_sent", label: "Penawaran Terkirim" },
    { value: "awaiting_dp", label: "Menunggu DP 50%" },
    { value: "in_progress", label: "Sedang Dikerjakan" },
    { value: "awaiting_final_payment", label: "Menunggu Pelunasan" },
    { value: "revision", label: "Masa Garansi / Revisi" },
    { value: "completed", label: "Selesai" },
    { value: "cancelled", label: "Dibatalkan" },
  ];

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (typeFilter !== "all" && order.order_type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const codeMatch = order.order_code.toLowerCase().includes(q);
      const nameMatch = order.customer_name.toLowerCase().includes(q);
      const catMatch = order.service_category?.toLowerCase().includes(q);
      if (!codeMatch && !nameMatch && !catMatch) return false;
    }
    return true;
  });

  const handleOpenDetail = (order: AdminOrder) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote(order.internal_notes || "");
    setActionSuccess(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    setActionSuccess(null);

    const result = await updateOrderStatusAction(
      selectedOrder.id,
      newStatus,
      statusNote
    );

    setIsUpdating(false);

    if (result.success) {
      setActionSuccess("Status pesanan berhasil diperbarui!");
      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, status: newStatus, internal_notes: statusNote }
            : o
        )
      );
      setSelectedOrder((prev) =>
        prev ? { ...prev, status: newStatus, internal_notes: statusNote } : null
      );
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "new_inquiry":
        return <span className="neo-tag bg-neo-yellow text-black">INQUIRY BARU</span>;
      case "under_review":
        return <span className="neo-tag bg-blue-100 text-blue-900">DITINJAU</span>;
      case "quotation_sent":
        return <span className="neo-tag bg-purple-100 text-purple-900">PENAWARAN TERKIRIM</span>;
      case "awaiting_dp":
        return <span className="neo-tag bg-amber-100 text-amber-900">MENUNGGU DP</span>;
      case "in_progress":
        return <span className="neo-tag bg-neo-lime text-black">DIKERJAKAN</span>;
      case "awaiting_final_payment":
        return <span className="neo-tag bg-indigo-100 text-indigo-900">MENUNGGU PELUNASAN</span>;
      case "revision":
        return <span className="neo-tag bg-orange-100 text-orange-900">REVISI</span>;
      case "completed":
        return <span className="neo-tag bg-emerald-100 text-emerald-900">SELESAI</span>;
      case "cancelled":
        return <span className="neo-tag bg-red-100 text-red-900">DIBATALKAN</span>;
      default:
        return <span className="neo-tag bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Bar */}
      <div className="neo-box p-4 bg-white shadow-neo-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Cari ID order, nama klien, atau layanan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm font-medium border-2 border-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neo-lime"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="md:col-span-6 flex flex-wrap items-center justify-start md:justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`neo-btn py-1.5 px-3 text-xs font-black ${
                typeFilter === "all"
                  ? "bg-black text-white shadow-neo-sm"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Semua Jenis
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("digital_task")}
              className={`neo-btn py-1.5 px-3 text-xs font-black flex items-center gap-1 ${
                typeFilter === "digital_task"
                  ? "bg-neo-blue text-white shadow-neo-sm"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <FileCode className="h-3 w-3" />
              <span>Tugas Digital</span>
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("hardware_service")}
              className={`neo-btn py-1.5 px-3 text-xs font-black flex items-center gap-1 ${
                typeFilter === "hardware_service"
                  ? "bg-neo-mint text-black shadow-neo-sm"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Laptop className="h-3 w-3" />
              <span>Servis Laptop</span>
            </button>
          </div>

        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-slate-100 overflow-x-auto text-xs font-mono">
          <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Status:
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-2 py-0.5 rounded border ${
              statusFilter === "all"
                ? "bg-black text-white border-black font-black"
                : "bg-slate-100 text-slate-700 border-transparent hover:border-slate-400"
            }`}
          >
            Semua ({orders.length})
          </button>
          {statusOptions.map((opt) => {
            const count = orders.filter((o) => o.status === opt.value).length;
            if (count === 0 && statusFilter !== opt.value) return null;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={`px-2 py-0.5 rounded border ${
                  statusFilter === opt.value
                    ? "bg-neo-lime text-black border-black font-black"
                    : "bg-slate-100 text-slate-700 border-transparent hover:border-slate-400"
                }`}
              >
                {opt.label} ({count})
              </button>
            );
          })}
        </div>

      </div>

      {/* Orders Table */}
      <div className="neo-box overflow-hidden bg-white shadow-neo">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="font-black text-sm text-black">
              Tidak ada pesanan yang sesuai filter
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Coba ubah kata kunci pencarian atau bersihkan filter status.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-black bg-slate-100 text-slate-800 font-mono font-black uppercase text-[11px]">
                  <th className="p-3.5">ID Order</th>
                  <th className="p-3.5">Klien &amp; Kontak</th>
                  <th className="p-3.5">Layanan</th>
                  <th className="p-3.5">Tenggat Waktu</th>
                  <th className="p-3.5">Estimasi Biaya</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y border-black font-medium text-slate-800">
                {filteredOrders.map((order) => {
                  const isDigital = order.order_type === "digital_task";
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => handleOpenDetail(order)}
                    >
                      <td className="p-3.5 font-mono font-black text-black">
                        {order.order_code}
                      </td>
                      <td className="p-3.5">
                        <p className="font-black text-black">{order.customer_name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {order.customer_contact}
                        </p>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          {isDigital ? (
                            <span className="neo-tag bg-blue-100 text-neo-blue text-[9px] flex items-center gap-1">
                              <FileCode className="h-2.5 w-2.5" /> DIGITAL
                            </span>
                          ) : (
                            <span className="neo-tag bg-emerald-100 text-emerald-900 text-[9px] flex items-center gap-1">
                              <Laptop className="h-2.5 w-2.5" /> HARDWARE
                            </span>
                          )}
                          {order.include_learn_package && (
                            <span className="neo-tag bg-neo-yellow text-black text-[9px]">
                              SEKALIAN BELAJAR
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-slate-900 line-clamp-1 max-w-xs">
                          {order.service_category || "Layanan Kustom"}
                        </p>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-700">
                        {order.deadline}
                      </td>
                      <td className="p-3.5 font-mono font-black text-black">
                        {order.total_price ? formatRupiah(order.total_price) : "-"}
                      </td>
                      <td className="p-3.5">
                        {renderStatusBadge(order.status)}
                      </td>
                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          {order.customer_contact && (
                            <a
                              href={`https://wa.me/${order.customer_contact.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="neo-btn-lime py-1 px-2.5 text-[11px] font-mono flex items-center gap-1"
                              title="Chat WhatsApp Klien"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(order)}
                            className="neo-btn-white py-1 px-2.5 text-[11px] font-mono flex items-center gap-1"
                          >
                            <Edit3 className="h-3 w-3 text-slate-700" />
                            <span>Detail</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail / Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="neo-box max-w-2xl w-full bg-white max-h-[90vh] overflow-y-auto shadow-neo-lg p-6 sm:p-7">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-black mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="neo-pill bg-neo-yellow text-black text-xs font-mono">
                    {selectedOrder.order_code}
                  </span>
                  <span className="neo-tag bg-slate-100 text-slate-800 font-mono">
                    {selectedOrder.order_type === "digital_task" ? "TUGAS DIGITAL" : "SERVIS HARDWARE"}
                  </span>
                </div>
                <h3 className="font-heading font-black text-xl text-black">
                  Detail Pesanan &amp; Kelola Status
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded border border-black hover:bg-slate-100"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Action Success Alert */}
            {actionSuccess && (
              <div className="mb-4 p-3 border-2 border-black rounded bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Order Brief Info */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 border-2 border-black rounded-lg bg-slate-50 font-medium">
                <div>
                  <span className="text-slate-500 block text-[11px] font-mono">Nama Klien:</span>
                  <span className="font-black text-black text-sm">{selectedOrder.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-mono">Kontak:</span>
                  <a
                    href={`https://wa.me/${selectedOrder.customer_contact.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-neo-blue hover:underline flex items-center gap-1"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>{selectedOrder.customer_contact}</span>
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-mono">Kategori Layanan:</span>
                  <span className="font-bold text-black">{selectedOrder.service_category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-mono">Tenggat Waktu:</span>
                  <span className="font-mono font-bold text-amber-800">{selectedOrder.deadline}</span>
                </div>
              </div>

              {/* Hardware specific or digital specific */}
              {selectedOrder.order_type === "digital_task" ? (
                <div className="p-3.5 border-2 border-black rounded-lg bg-blue-50/50">
                  <p className="text-[11px] font-mono font-bold text-slate-600 mb-1">
                    Format Output Diminta:
                  </p>
                  <p className="font-mono text-black font-bold">
                    {selectedOrder.format_output || "Standar .zip / .docx"}
                  </p>
                  {selectedOrder.include_learn_package && (
                    <div className="mt-2 inline-flex items-center gap-1.5 neo-tag bg-neo-yellow text-black font-mono">
                      <span>✓</span> Termasuk Paket Sekalian Belajar (+Rp25.000)
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 border-2 border-black rounded-lg bg-emerald-50/50">
                  <p className="text-[11px] font-mono font-bold text-slate-600 mb-1">
                    Detail Servis Laptop:
                  </p>
                  <p className="font-bold text-black">
                    Unit: {selectedOrder.hardware_details?.laptop_model || "-"}
                  </p>
                  <p className="text-slate-700 mt-0.5">
                    Metode: {selectedOrder.hardware_details?.delivery_method || "-"}
                  </p>
                </div>
              )}

              {/* Instructions / Soal */}
              <div className="p-3.5 border-2 border-black rounded-lg bg-white">
                <span className="text-[11px] font-mono font-bold text-slate-500 block mb-1">
                  Detail Instruksi / Soal:
                </span>
                <p className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                  {selectedOrder.instructions}
                </p>
              </div>

              {/* Status Update Form */}
              <div className="pt-4 border-t-2 border-black space-y-3">
                <h4 className="font-heading font-black text-sm text-black">
                  Perbarui Status &amp; Catatan Internal:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                      Status Pesanan
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-lg bg-white focus:outline-none"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                      Catatan Internal Admin / Progress
                    </label>
                    <input
                      type="text"
                      placeholder="Cth: DP sudah masuk, progress bab 2 selesai..."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium border-2 border-black rounded-lg bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="neo-btn-white py-2 px-4 text-xs font-black"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={handleUpdateStatus}
                    className="neo-btn-lime py-2 px-5 text-xs font-black flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Simpan Perubahan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

