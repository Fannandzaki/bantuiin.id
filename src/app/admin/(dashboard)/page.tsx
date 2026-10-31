import Link from "next/link";
import { getAdminOrders } from "@/app/actions/admin-orders";
import { formatRupiah } from "@/lib/utils";

export const dynamic = "force-dynamic";
import {
  Inbox,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  MessageCircle,
  FileCode,
  Laptop,
  AlertTriangle,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const orders = await getAdminOrders();

  const totalOrders = orders.length;
  const newInquiries = orders.filter(
    (o) => o.status === "new_inquiry" || o.status === "under_review"
  ).length;
  const inProgress = orders.filter((o) => o.status === "in_progress").length;
  const completed = orders.filter((o) => o.status === "completed").length;
  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.total_price || 0), 0);

  const statusBadge = (status: string) => {
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
    <div className="space-y-8">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-black">
            Ringkasan Operasional
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Pantau arus pemesanan tugas mahasiswa, pekerjaan IT support, dan perputaran pesanan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/pesanan"
            className="neo-btn-lime py-2 px-4 text-xs font-black flex items-center gap-2"
          >
            <Inbox className="h-4 w-4" />
            <span>Buka Antrean Pesanan ({totalOrders})</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Total Orders */}
        <div className="neo-box p-5 bg-white flex flex-col justify-between shadow-neo-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase font-mono">
              Total Pesanan
            </span>
            <div className="h-8 w-8 rounded bg-blue-100 border border-black flex items-center justify-center">
              <Inbox className="h-4 w-4 text-neo-blue" />
            </div>
          </div>
          <div>
            <p className="font-heading font-black text-3xl text-black">
              {totalOrders}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Inquiry masuk tercatat
            </p>
          </div>
        </div>

        {/* Card 2: Need Review */}
        <div className="neo-box p-5 bg-white flex flex-col justify-between shadow-neo-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase font-mono">
              Perlu Respon / DP
            </span>
            <div className="h-8 w-8 rounded bg-yellow-100 border border-black flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-700" />
            </div>
          </div>
          <div>
            <p className="font-heading font-black text-3xl text-black">
              {newInquiries}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Menunggu respon atau quotation
            </p>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="neo-box p-5 bg-white flex flex-col justify-between shadow-neo-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase font-mono">
              Sedang Dikerjakan
            </span>
            <div className="h-8 w-8 rounded bg-neo-lime border border-black flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-black" />
            </div>
          </div>
          <div>
            <p className="font-heading font-black text-3xl text-black">
              {inProgress}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Aktif oleh tim/eksekutor
            </p>
          </div>
        </div>

        {/* Card 4: Estimated Revenue */}
        <div className="neo-box p-5 bg-white flex flex-col justify-between shadow-neo-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase font-mono">
              Estimasi Omset
            </span>
            <div className="h-8 w-8 rounded bg-emerald-100 border border-black flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-700" />
            </div>
          </div>
          <div>
            <p className="font-heading font-black text-2xl sm:text-3xl text-neo-blueDark">
              {formatRupiah(totalRevenue)}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {completed} pesanan selesai
            </p>
          </div>
        </div>

      </div>

      {/* Latest Orders Table Box */}
      <div className="neo-box overflow-hidden bg-white shadow-neo">
        
        {/* Table Header */}
        <div className="p-4 sm:p-5 border-b-2 border-black bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="font-heading font-black text-lg text-black">
              Pesanan Masuk Terbaru
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Daftar transaksi dan inquiry klien yang perlu ditindaklanjuti.
            </p>
          </div>
          <Link
            href="/admin/pesanan"
            className="text-xs font-black text-neo-blue hover:underline flex items-center gap-1"
          >
            <span>Semua Pesanan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Table Content */}
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="font-black text-sm text-black">Belum ada pesanan masuk</p>
            <p className="text-xs text-slate-500 mt-1">
              Pesanan baru yang dikirim via generator WhatsApp otomatis akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-black bg-slate-100 text-slate-800 font-mono font-black uppercase text-[11px]">
                  <th className="p-3.5">ID Order</th>
                  <th className="p-3.5">Klien &amp; Kontak</th>
                  <th className="p-3.5">Jenis Layanan</th>
                  <th className="p-3.5">Tenggat Waktu</th>
                  <th className="p-3.5">Estimasi Biaya</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y border-black font-medium text-slate-800">
                {orders.slice(0, 5).map((order) => {
                  const isDigital = order.order_type === "digital_task";
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
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
                        {statusBadge(order.status)}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {order.customer_contact && (
                            <a
                              href={`https://wa.me/${order.customer_contact.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="neo-btn-lime py-1 px-2 text-[11px] font-mono flex items-center gap-1"
                              title="Chat WhatsApp Klien"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span className="hidden sm:inline">WA</span>
                            </a>
                          )}
                          <Link
                            href="/admin/pesanan"
                            className="neo-btn-white py-1 px-2 text-[11px] font-mono"
                          >
                            Kelola
                          </Link>
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

    </div>
  );
}

