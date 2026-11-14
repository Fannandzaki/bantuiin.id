"use client";

import { useState, useMemo } from "react";
import { AdminOrder, OrderStatus, OrderType, PaymentRecord, PaymentType } from "@/types";
import {
  updateOrderStatusAction,
  verifyPriorityAction,
  createQuotationAction,
} from "@/app/actions/admin-orders";
import {
  getOrderPayments,
  recordPaymentAction,
  verifyPaymentAction,
} from "@/app/actions/payments";
import { formatRupiah } from "@/lib/utils";
import {
  calculateOrderPricing,
  calculateRemainingHours,
  formatJakartaDateTime,
} from "@/lib/pricing/priority-calculator";
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
  ShieldAlert,
  Calculator,
  Send,
  Check,
  CreditCard,
  Plus,
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
  const [actionError, setActionError] = useState<string | null>(null);

  // Priority verification state
  const [rejectionReason, setRejectionReason] = useState("");
  const [isVerifyingPriority, setIsVerifyingPriority] = useState(false);

  // Quotation Builder State
  const [basePriceInput, setBasePriceInput] = useState<number>(100000);
  const [includeAdminAdjustment, setIncludeAdminAdjustment] = useState(false);
  const [adminAdjPercent, setAdminAdjPercent] = useState<number>(0);
  const [adminAdjReason, setAdminAdjReason] = useState("");
  const [isCreatingQuotation, setIsCreatingQuotation] = useState(false);
  const [quotationCopied, setQuotationCopied] = useState(false);

  // Payment Management State
  const [orderPayments, setOrderPayments] = useState<PaymentRecord[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [newPayType, setNewPayType] = useState<PaymentType>("dp");
  const [newPayAmount, setNewPayAmount] = useState<number>(50000);
  const [newPayMethod, setNewPayMethod] = useState("QRIS");
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [isVerifyingPaymentId, setIsVerifyingPaymentId] = useState<string | null>(null);

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
    setRejectionReason("");
    setBasePriceInput(order.total_price || 100000);
    setIncludeAdminAdjustment(false);
    setAdminAdjPercent(0);
    setAdminAdjReason("");
    setActionSuccess(null);
    setActionError(null);

    const suggested = Math.round((order.total_price || 100000) * 0.5);
    setNewPayAmount(suggested);
    setNewPayType("dp");
    setNewPayMethod("QRIS");

    setPaymentsLoading(true);
    getOrderPayments(order.id)
      .then(setOrderPayments)
      .finally(() => setPaymentsLoading(false));
  };

  // Live calculation for quotation builder
  const modalPricingCalc = useMemo(() => {
    if (!selectedOrder) return null;

    const candidateDeadline = selectedOrder.requested_deadline || selectedOrder.deadline;
    return calculateOrderPricing({
      basePrice: basePriceInput,
      deadline: candidateDeadline,
      startTimePreference: selectedOrder.start_time_preference || "asap",
      requestedStartTime: selectedOrder.requested_start_time,
      adminSpecialAdjustment: includeAdminAdjustment
        ? {
            percent: adminAdjPercent,
            reason: adminAdjReason,
          }
        : undefined,
    });
  }, [selectedOrder, basePriceInput, includeAdminAdjustment, adminAdjPercent, adminAdjReason]);

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    setActionSuccess(null);
    setActionError(null);

    const result = await updateOrderStatusAction(
      selectedOrder.id,
      newStatus,
      statusNote
    );

    setIsUpdating(false);

    if (result.success) {
      setActionSuccess("Status pesanan berhasil diperbarui!");
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
    } else {
      setActionError(result.error || "Gagal memperbarui status");
    }
  };

  const handleVerifyPriority = async (decision: "approved" | "rejected") => {
    if (!selectedOrder) return;
    if (decision === "rejected" && !rejectionReason.trim()) {
      setActionError("Mohon masukkan alasan penolakan permintaan prioritas.");
      return;
    }

    setIsVerifyingPriority(true);
    setActionSuccess(null);
    setActionError(null);

    const result = await verifyPriorityAction(
      selectedOrder.id,
      decision,
      rejectionReason
    );

    setIsVerifyingPriority(false);

    if (result.success) {
      const updatedStatus = decision === "approved" ? "priority_approved" : "priority_rejected";
      setActionSuccess(
        decision === "approved"
          ? "Permintaan prioritas berhasil disetujui!"
          : "Permintaan prioritas ditolak dan dicatat di sistem."
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                priority_status: updatedStatus,
                priority_rejection_reason: decision === "rejected" ? rejectionReason : null,
              }
            : o
        )
      );
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              priority_status: updatedStatus,
              priority_rejection_reason: decision === "rejected" ? rejectionReason : null,
            }
          : null
      );
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError(result.error || "Gagal memverifikasi prioritas");
    }
  };

  const handleCreateQuotation = async () => {
    if (!selectedOrder || !modalPricingCalc) return;
    if (includeAdminAdjustment && !adminAdjReason.trim()) {
      setActionError("Mohon isi alasan penyesuaian khusus admin.");
      return;
    }

    setIsCreatingQuotation(true);
    setActionSuccess(null);
    setActionError(null);

    const result = await createQuotationAction({
      orderId: selectedOrder.id,
      basePrice: basePriceInput,
      adminSpecialAdjustment: includeAdminAdjustment
        ? {
            percent: adminAdjPercent,
            reason: adminAdjReason,
          }
        : undefined,
      notes: statusNote || undefined,
    });

    setIsCreatingQuotation(false);

    if (result.success && result.quotation) {
      setActionSuccess("Quotation resmi berhasil dibuat & disimpan ke database!");

      // Update state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                status: "quotation_sent",
                total_price: modalPricingCalc.finalPrice,
              }
            : o
        )
      );
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              status: "quotation_sent",
              total_price: modalPricingCalc.finalPrice,
            }
          : null
      );

      // Generate WhatsApp text
      const cleanPhone = selectedOrder.customer_contact.replace(/[^0-9]/g, "");
      const quoText =
        `Halo Kak ${selectedOrder.customer_name}, berikut rincian Quotation Resmi dari BANTUIN.ID untuk pesanan ${selectedOrder.order_code}:\n\n` +
        `• Layanan         : ${selectedOrder.service_category || "Layanan Kustom"}\n` +
        `• Deadline        : ${formatJakartaDateTime(selectedOrder.requested_deadline || selectedOrder.deadline)}\n` +
        `• Harga Dasar     : ${formatRupiah(modalPricingCalc.basePrice)}\n` +
        `• Biaya Prioritas : +${modalPricingCalc.deadlineSurchargePercent}% (${formatRupiah(modalPricingCalc.deadlineSurchargeAmount)})\n` +
        `• Biaya Luar Jam  : +${modalPricingCalc.afterHoursSurchargePercent}% (${formatRupiah(modalPricingCalc.afterHoursSurchargeAmount)})\n` +
        (modalPricingCalc.capAdjustmentAmount > 0
          ? `• Potongan Batas 25%: -${formatRupiah(modalPricingCalc.capAdjustmentAmount)}\n`
          : "") +
        `─────────────────────────────\n` +
        `• TOTAL HARGA     : ${formatRupiah(modalPricingCalc.finalPrice)}\n` +
        `• DP 50% (Tanda Jadi): ${formatRupiah(modalPricingCalc.dpAmount)}\n` +
        `• Sisa Pelunasan  : ${formatRupiah(modalPricingCalc.finalAmount)}\n\n` +
        `Pengerjaan langsung kami masukkan antrean aktif segera setelah bukti transfer DP diverifikasi. Terima kasih!`;

      navigator.clipboard.writeText(quoText);
      setQuotationCopied(true);
      setTimeout(() => setQuotationCopied(false), 4000);

      if (cleanPhone) {
        window.open(
          `https://wa.me/${cleanPhone}?text=${encodeURIComponent(quoText)}`,
          "_blank"
        );
      }
    } else {
      setActionError(result.error || "Gagal membuat quotation");
    }
  };

  const totalVerifiedPaid = useMemo(() => {
    return orderPayments
      .filter((p) => p.status === "verified")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [orderPayments]);

  const remainingBalance = useMemo(() => {
    const total = selectedOrder?.total_price || modalPricingCalc?.finalPrice || 0;
    return Math.max(0, total - totalVerifiedPaid);
  }, [selectedOrder, modalPricingCalc, totalVerifiedPaid]);

  const handleRecordPayment = async () => {
    if (!selectedOrder) return;
    if (newPayAmount <= 0) {
      setActionError("Nominal pembayaran harus lebih dari 0.");
      return;
    }

    setIsRecordingPayment(true);
    setActionSuccess(null);
    setActionError(null);

    const res = await recordPaymentAction({
      orderId: selectedOrder.id,
      paymentType: newPayType,
      amount: newPayAmount,
      paymentMethod: newPayMethod,
    });

    setIsRecordingPayment(false);

    if (res.success && res.payment) {
      setActionSuccess(`Pembayaran ${newPayType.toUpperCase()} berhasil dicatat.`);
      setOrderPayments((prev) => [res.payment!, ...prev]);
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError(res.error || "Gagal mencatat pembayaran.");
    }
  };

  const handleVerifyPayment = async (paymentId: string, decision: "verified" | "rejected") => {
    if (!selectedOrder) return;
    setIsVerifyingPaymentId(paymentId);
    setActionSuccess(null);
    setActionError(null);

    const res = await verifyPaymentAction(paymentId, decision, selectedOrder.id);
    setIsVerifyingPaymentId(null);

    if (res.success) {
      setActionSuccess(`Pembayaran berhasil ${decision === "verified" ? "diverifikasi" : "ditolak"}.`);
      setOrderPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: decision } : p))
      );
      if (decision === "verified" && selectedOrder.status === "awaiting_dp") {
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: "in_progress" } : o))
        );
        setSelectedOrder((prev) => (prev ? { ...prev, status: "in_progress" } : null));
        setNewStatus("in_progress");
      }
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError(res.error || "Gagal memverifikasi status pembayaran.");
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

  const renderPriorityBadge = (order: AdminOrder) => {
    const rawDeadline = order.requested_deadline || order.deadline;
    const hours = calculateRemainingHours(rawDeadline);

    if (order.priority_status === "priority_pending_admin" || hours < 2) {
      return (
        <span className="neo-tag bg-red-100 text-red-900 border-red-500 font-mono text-[9px] flex items-center gap-1 animate-pulse font-black">
          <ShieldAlert className="h-3 w-3 text-red-600" />
          <span>DARURAT &lt; 2 JAM</span>
        </span>
      );
    } else if (hours < 3) {
      return (
        <span className="neo-tag bg-amber-100 text-amber-900 font-mono text-[9px]">
          MENDESAK 2–3 JAM (+20%)
        </span>
      );
    } else if (hours < 6) {
      return (
        <span className="neo-tag bg-blue-100 text-neo-blue font-mono text-[9px]">
          PRIORITAS 3–6 JAM (+10%)
        </span>
      );
    }
    return (
      <span className="neo-tag bg-slate-100 text-slate-700 font-mono text-[9px]">
        REGULER (&ge; 6 JAM)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter Bar */}
      <div className="neo-box p-3.5 sm:p-4 bg-white shadow-neo-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Cari kode order, nama klien, atau layanan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs font-medium border-2 border-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neo-lime"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              <Filter className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-xs font-bold text-slate-700">Filter:</span>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as OrderType | "all")}
              className="flex-1 sm:flex-initial px-2.5 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-white focus:outline-none"
            >
              <option value="all">Semua Tipe</option>
              <option value="digital_task">Tugas Digital</option>
              <option value="hardware_service">Servis Hardware</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
              className="flex-1 sm:flex-initial px-2.5 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-white focus:outline-none"
            >
              <option value="all">Semua Status</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Orders Table */}
      <div className="neo-box bg-white overflow-hidden shadow-neo">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h4 className="font-heading font-black text-base text-slate-800">
              Tidak ada pesanan yang sesuai
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Coba sesuaikan filter pencarian atau status pesanan di atas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neo-dark text-white font-mono text-[11px] uppercase tracking-wider border-b-2 border-black">
                <tr>
                  <th className="p-3.5">Kode Order</th>
                  <th className="p-3.5">Klien</th>
                  <th className="p-3.5">Layanan</th>
                  <th className="p-3.5">Deadline &amp; Urgensi</th>
                  <th className="p-3.5">Harga Final</th>
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
                      <td className="p-3.5 font-mono text-[11px]">
                        <p className="font-bold text-black">{order.deadline}</p>
                        <div className="mt-1">{renderPriorityBadge(order)}</div>
                      </td>
                      <td className="p-3.5 font-mono font-black text-black">
                        {order.total_price ? formatRupiah(order.total_price) : "-"}
                      </td>
                      <td className="p-3.5">
                        {renderStatusBadge(order.status)}
                      </td>
                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          {order.customer_contact && order.customer_contact.replace(/[^0-9]/g, "").length >= 9 ? (
                            <a
                              href={`https://wa.me/${order.customer_contact.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="neo-btn-lime py-1 px-2.5 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                              title="Chat WhatsApp Klien"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </a>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(order)}
                            className="neo-btn-white py-1 px-2.5 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="neo-box max-w-3xl w-full bg-white max-h-[95vh] overflow-y-auto shadow-neo-lg p-3.5 sm:p-6 md:p-7">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-black mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="neo-pill bg-neo-yellow text-black text-xs font-mono font-black">
                    {selectedOrder.order_code}
                  </span>
                  <span className="neo-tag bg-slate-100 text-slate-800 font-mono">
                    {selectedOrder.order_type === "digital_task" ? "TUGAS DIGITAL" : "SERVIS HARDWARE"}
                  </span>
                  {selectedOrder.priority_status === "priority_pending_admin" && (
                    <span className="neo-tag bg-red-100 text-red-900 font-mono font-black animate-pulse">
                      PERLU REVIEW PRIORITAS
                    </span>
                  )}
                </div>
                <h3 className="font-heading font-black text-xl text-black">
                  Detail Pesanan &amp; Quotation Resmi
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded border border-black hover:bg-slate-100 cursor-pointer"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Alerts */}
            {actionSuccess && (
              <div className="mb-4 p-3 border-2 border-black rounded bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                <span>{actionSuccess}</span>
              </div>
            )}
            {actionError && (
              <div className="mb-4 p-3 border-2 border-black rounded bg-red-100 text-red-900 font-bold text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-700" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-5 text-xs">
              
              {/* Emergency Approval Action Card (If < 2h or pending admin review) */}
              {selectedOrder.priority_status === "priority_pending_admin" && (
                <div className="p-4 border-2 border-red-600 rounded-lg bg-red-50 space-y-3">
                  <div className="flex items-center gap-2 text-red-900 font-black text-sm">
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                    <span>Konfirmasi Permintaan Prioritas Darurat (&lt; 2 Jam)</span>
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    Pesanan ini memiliki deadline mendesak (&lt; 2 jam). Pastikan kesiapan teknisi/developer sebelum menyetujui pengerjaan.
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isVerifyingPriority}
                      onClick={() => handleVerifyPriority("approved")}
                      className="neo-btn-lime py-2 px-4 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Setujui Pengerjaan Darurat (+25%)</span>
                    </button>

                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Alasan penolakan jika tidak sanggup (cth: slot tim penuh)..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium border-2 border-black rounded bg-white"
                      />
                      <button
                        type="button"
                        disabled={isVerifyingPriority}
                        onClick={() => handleVerifyPriority("rejected")}
                        className="neo-btn-dark py-2 px-3 text-xs font-black cursor-pointer disabled:opacity-50"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Brief Info */}
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
                  <span className="text-slate-500 block text-[11px] font-mono">Deadline Diminta:</span>
                  <span className="font-mono font-bold text-amber-900">{selectedOrder.deadline}</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3.5 border-2 border-black rounded-lg bg-white">
                <span className="text-[11px] font-mono font-bold text-slate-500 block mb-1">
                  Detail Instruksi / Soal:
                </span>
                <p className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                  {selectedOrder.instructions}
                </p>
              </div>

              {/* Quotation Builder (Interactive Engine) */}
              <div className="p-4 border-2 border-black rounded-lg bg-neo-yellow/20 space-y-3">
                <div className="flex items-center justify-between border-b border-black pb-2">
                  <div className="flex items-center gap-1.5 font-heading font-black text-sm text-black">
                    <Calculator className="h-4 w-4 text-black" />
                    <span>Interactive Quotation Generator (Hitung Harga Final)</span>
                  </div>
                  <span className="neo-tag bg-neo-lime text-black font-mono text-[10px]">
                    SERVER ENFORCED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-800 mb-1">
                      Harga Dasar Layanan (Base Price) *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-mono font-black text-slate-500">
                        Rp
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={5000}
                        value={basePriceInput}
                        onChange={(e) => setBasePriceInput(Number(e.target.value) || 0)}
                        className="w-full pl-9 pr-3 py-2 text-sm font-black border-2 border-black rounded-lg bg-white focus:outline-none"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-600 font-mono">
                      Masukkan estimasi dasar sebelum surcharge prioritas.
                    </p>
                  </div>

                  {modalPricingCalc && (
                    <div className="p-3 border-2 border-black rounded-lg bg-white space-y-1 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Harga Dasar:</span>
                        <span className="font-bold">{formatRupiah(modalPricingCalc.basePrice)}</span>
                      </div>
                      <div className="flex justify-between text-blue-900">
                        <span>Biaya Deadline (+{modalPricingCalc.deadlineSurchargePercent}%):</span>
                        <span>+{formatRupiah(modalPricingCalc.deadlineSurchargeAmount)}</span>
                      </div>
                      <div className="flex justify-between text-purple-900">
                        <span>Luar Jam (+{modalPricingCalc.afterHoursSurchargePercent}%):</span>
                        <span>+{formatRupiah(modalPricingCalc.afterHoursSurchargeAmount)}</span>
                      </div>
                      {modalPricingCalc.capAdjustmentAmount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>Potongan Batas 25%:</span>
                          <span>-{formatRupiah(modalPricingCalc.capAdjustmentAmount)}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-black flex justify-between font-black text-black text-sm">
                        <span>Total Harga:</span>
                        <span className="text-neo-blue">{formatRupiah(modalPricingCalc.finalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>DP 50% (Tanda Jadi):</span>
                        <span>{formatRupiah(modalPricingCalc.dpAmount)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Special Admin Override Accordion */}
                <div className="pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={includeAdminAdjustment}
                      onChange={(e) => setIncludeAdminAdjustment(e.target.checked)}
                      className="h-4 w-4 accent-black rounded"
                    />
                    <span>Aktifkan Penyesuaian Harga Khusus Admin (Kondisi Khusus di Luar Batas)</span>
                  </label>

                  {includeAdminAdjustment && (
                    <div className="mt-2.5 p-3 border-2 border-black rounded-lg bg-white space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Persentase Biaya Tambahan Khusus (%)
                          </label>
                          <input
                            type="number"
                            value={adminAdjPercent}
                            onChange={(e) => setAdminAdjPercent(Number(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 text-xs font-bold border-2 border-black rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Alasan Operasional Khusus (Wajib Tercatat) *
                          </label>
                          <input
                            type="text"
                            placeholder="Cth: Perlu sewa server komputasi tambahan..."
                            value={adminAdjReason}
                            onChange={(e) => setAdminAdjReason(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-medium border-2 border-black rounded"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={isCreatingQuotation}
                    onClick={handleCreateQuotation}
                    className="w-full sm:w-auto justify-center neo-btn-lime py-2.5 px-5 text-xs font-black flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isCreatingQuotation ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-black" />
                        <span>Menyimpan Quotation...</span>
                      </>
                    ) : quotationCopied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Quotation Tersimpan &amp; Format Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Simpan Quotation &amp; Buka WhatsApp Klien</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Payment Records & Balance Management */}
              <div className="pt-4 border-t-2 border-black space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    <h4 className="font-heading font-black text-sm text-black uppercase tracking-tight">
                      Riwayat &amp; Verifikasi Pembayaran
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono font-black">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-400 rounded">
                      Terbayar: {formatRupiah(totalVerifiedPaid)}
                    </span>
                    <span
                      className={`px-2 py-0.5 border rounded ${
                        remainingBalance > 0
                          ? "bg-amber-100 text-amber-900 border-amber-400"
                          : "bg-blue-100 text-blue-900 border-blue-400"
                      }`}
                    >
                      Sisa: {formatRupiah(remainingBalance)}
                    </span>
                  </div>
                </div>

                {/* Payment History List */}
                {paymentsLoading ? (
                  <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                    <span>Memuat riwayat pembayaran...</span>
                  </div>
                ) : orderPayments.length === 0 ? (
                  <div className="p-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg text-center text-xs text-slate-600 font-mono">
                    Belum ada riwayat pembayaran tercatat untuk pesanan ini.
                  </div>
                ) : (
                  <div className="border-2 border-black rounded-lg overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-mono">
                        <thead className="bg-slate-100 border-b-2 border-black text-[11px] font-black uppercase text-slate-700">
                          <tr>
                            <th className="px-3 py-2 text-left">Tipe</th>
                            <th className="px-3 py-2 text-left">Metode</th>
                            <th className="px-3 py-2 text-right">Nominal</th>
                            <th className="px-3 py-2 text-center">Status</th>
                            <th className="px-3 py-2 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {orderPayments.map((pay) => (
                            <tr key={pay.id} className="hover:bg-slate-50">
                              <td className="px-3 py-2 font-bold uppercase text-slate-900">
                                {pay.payment_type}
                              </td>
                              <td className="px-3 py-2 text-slate-600">
                                {pay.payment_method || "-"}
                              </td>
                              <td className="px-3 py-2 text-right font-black text-black">
                                {formatRupiah(pay.amount)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                    pay.status === "verified"
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                      : pay.status === "pending"
                                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                                      : "bg-red-100 text-red-800 border border-red-300"
                                  }`}
                                >
                                  {pay.status === "verified"
                                    ? "Terverifikasi"
                                    : pay.status === "pending"
                                    ? "Menunggu"
                                    : "Ditolak"}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                {pay.status === "pending" ? (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      disabled={isVerifyingPaymentId === pay.id}
                                      onClick={() => handleVerifyPayment(pay.id, "verified")}
                                      className="px-2 py-1 bg-emerald-400 hover:bg-emerald-500 text-black border border-black rounded text-[10px] font-black flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                    >
                                      {isVerifyingPaymentId === pay.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        "Verifikasi"
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isVerifyingPaymentId === pay.id}
                                      onClick={() => handleVerifyPayment(pay.id, "rejected")}
                                      className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 border border-red-400 rounded text-[10px] font-black cursor-pointer disabled:opacity-50"
                                    >
                                      Tolak
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-mono">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Form Catat Pembayaran Baru */}
                <div className="p-3 bg-slate-50 border-2 border-black rounded-lg space-y-2">
                  <div className="flex items-center gap-1 text-[11px] font-black uppercase text-slate-800">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Catat Pembayaran Masuk (Klien Telah Transfer):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Tipe Pembayaran
                      </label>
                      <select
                        value={newPayType}
                        onChange={(e) => setNewPayType(e.target.value as PaymentType)}
                        className="w-full px-2.5 py-1.5 text-xs font-bold border-2 border-black rounded bg-white"
                      >
                        <option value="dp">DP (Down Payment)</option>
                        <option value="final">Pelunasan</option>
                        <option value="full">Bayar Lunas Langsung</option>
                        <option value="additional">Biaya Tambahan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Nominal (Rp)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={5000}
                        value={newPayAmount}
                        onChange={(e) => setNewPayAmount(Number(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 text-xs font-black border-2 border-black rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Metode Transfer
                      </label>
                      <select
                        value={newPayMethod}
                        onChange={(e) => setNewPayMethod(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-bold border-2 border-black rounded bg-white"
                      >
                        <option value="QRIS">QRIS</option>
                        <option value="Transfer BCA">Transfer BCA</option>
                        <option value="GoPay">GoPay</option>
                        <option value="SeaBank">SeaBank</option>
                        <option value="Dana">Dana</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      disabled={isRecordingPayment || newPayAmount <= 0}
                      onClick={handleRecordPayment}
                      className="px-4 py-1.5 neo-btn-lime text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isRecordingPayment ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Catat Pembayaran</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Update Form */}
              <div className="pt-4 border-t-2 border-black space-y-3">
                <h4 className="font-heading font-black text-sm text-black">
                  Perbarui Status Pesanan &amp; Catatan Internal:
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

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="w-full sm:w-auto justify-center neo-btn-white py-2 px-4 text-xs font-black cursor-pointer text-center"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={handleUpdateStatus}
                    className="w-full sm:w-auto justify-center neo-btn-dark py-2 px-5 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Simpan Perubahan Status</span>
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
