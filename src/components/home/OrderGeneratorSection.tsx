"use client";

import { useState, useMemo } from "react";
import {
  Laptop,
  FileCode,
  Send,
  Check,
  Loader2,
  AlertCircle,
  Clock,
  Moon,
} from "lucide-react";
import {
  createDigitalTaskOrder,
  createHardwareServiceOrder,
} from "@/app/actions/orders";
import {
  calculateOrderPricing,
  formatJakartaDateTime,
} from "@/lib/pricing/priority-calculator";
import { StartTimePreference } from "@/types";

// Helper to get formatted default date 48h from now for datetime-local
function getDefaultDeadlineLocal(): string {
  const d = new Date();
  d.setHours(d.getHours() + 48, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export function OrderGeneratorSection() {
  const [orderType, setOrderType] = useState<"task" | "hardware">("task");

  // State for Digital Task Form
  const [taskForm, setTaskForm] = useState({
    name: "Mahasiswa Hebat",
    category: "Coding Web / Laravel / PHP",
    outputFormat: ".ZIP (Source Code) + .SQL",
    instructions: "Bikin sistem kasir mini ada CRUD produk dan laporan transaksi harian.",
    deadlineInput: getDefaultDeadlineLocal(),
    startTimePreference: "asap" as StartTimePreference,
    requestedStartTime: "",
    includeLearnPackage: true,
  });

  // State for Hardware Service Form
  const [hardwareForm, setHardwareForm] = useState({
    name: "Mahasiswa Hebat",
    issue: "Cleaning Fan + Repaste Thermal Paste Overheat",
    laptopModel: "Asus ROG Zephyrus / Lenovo Legion",
    deliveryMethod: "Drop-off ke Lokasi Admin",
    deadlineInput: getDefaultDeadlineLocal(),
    startTimePreference: "asap" as StartTimePreference,
    requestedStartTime: "",
    acceptsDataDisclaimer: true,
  });

  const [registeredOrderCode, setRegisteredOrderCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Active form data according to tab
  const activeDeadline = orderType === "task" ? taskForm.deadlineInput : hardwareForm.deadlineInput;
  const activeStartPref = orderType === "task" ? taskForm.startTimePreference : hardwareForm.startTimePreference;
  const activeStartTime = orderType === "task" ? taskForm.requestedStartTime : hardwareForm.requestedStartTime;

  // Real-time calculation of priority & after-hours pricing
  const livePricing = useMemo(() => {
    try {
      const parsed = new Date(activeDeadline);
      if (isNaN(parsed.getTime())) return null;

      return calculateOrderPricing({
        basePrice: 100000, // Normalized unit
        deadline: parsed,
        startTimePreference: activeStartPref,
        requestedStartTime: activeStartTime || undefined,
      });
    } catch {
      return null;
    }
  }, [activeDeadline, activeStartPref, activeStartTime]);

  // Generate WhatsApp message based on active tab matching Figma format
  const generateMessageText = (code?: string) => {
    const orderIdLine = code ? `• ID Pesanan  : ${code}\n` : "";
    const deadlineFormatted = formatJakartaDateTime(activeDeadline);

    let prioritySummary = "0% (Reguler)";
    if (livePricing) {
      const totalSurcharge = Math.min(25, livePricing.deadlineSurchargePercent + livePricing.afterHoursSurchargePercent);
      if (totalSurcharge > 0) {
        prioritySummary = `+${totalSurcharge}% (${livePricing.deadlineTierLabel}${
          livePricing.afterHoursSurchargePercent > 0 ? ` + ${livePricing.afterHoursTierLabel}` : ""
        })`;
      }
      if (livePricing.priorityStatus === "priority_pending_admin") {
        prioritySummary += " [Perlu Verifikasi Slot Admin]";
      }
    }

    const startPrefLabel =
      activeStartPref === "asap"
        ? "Mulai Secepatnya / Standby"
        : activeStartPref === "regular_hours"
        ? "Jam Operasional Reguler (06.00–22.00 WIB)"
        : `Jadwal Khusus: ${activeStartTime || "Sesuai kesepakatan"}`;

    if (orderType === "task") {
      return (
        `Halo Tim bantuiin.id, saya mau order bantuan tugas/proyek:\n\n` +
        orderIdLine +
        `• Nama Klien  : ${taskForm.name || "..."}\n` +
        `• Kategori    : ${taskForm.category}\n` +
        `• Format File : ${taskForm.outputFormat || "..."}\n` +
        `• Deadline    : ${deadlineFormatted}\n` +
        `• Waktu Mulai : ${startPrefLabel}\n` +
        `• Est. Biaya  : ${prioritySummary}\n` +
        `• Pkt Belajar : ${
          taskForm.includeLearnPackage
            ? "YA (Ambil Paket Sekalian Belajar)"
            : "Tidak"
        }\n\n` +
        `Detail Instruksi:\n"${taskForm.instructions || "..."}"\n\n` +
        `Mohon dicek estimasi biaya final dan ketersediaan slotnya, terima kasih!`
      );
    } else {
      return (
        `Halo Tim bantuiin.id, saya mau order bantuan servis laptop:\n\n` +
        orderIdLine +
        `• Nama Klien  : ${hardwareForm.name || "..."}\n` +
        `• Kendala/Item: ${hardwareForm.issue}\n` +
        `• Tipe Laptop : ${hardwareForm.laptopModel || "..."}\n` +
        `• Penyerahan  : ${hardwareForm.deliveryMethod}\n` +
        `• Target Waktu: ${deadlineFormatted}\n` +
        `• Waktu Mulai : ${startPrefLabel}\n` +
        `• Est. Biaya  : ${prioritySummary}\n` +
        `• Backup Data : ${
          hardwareForm.acceptsDataDisclaimer ? "Sudah disetujui" : "Belum"
        }\n\n` +
        `Mohon dicek estimasi biaya final dan ketersediaan slotnya, terima kasih!`
      );
    }
  };

  const currentMessage = generateMessageText(registeredOrderCode || undefined);

  const handleActionWhatsApp = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      let result;
      if (orderType === "task") {
        result = await createDigitalTaskOrder({
          name: taskForm.name,
          category: taskForm.category,
          outputFormat: taskForm.outputFormat,
          instructions: taskForm.instructions,
          deadline: formatJakartaDateTime(taskForm.deadlineInput),
          requestedDeadline: new Date(taskForm.deadlineInput).toISOString(),
          startTimePreference: taskForm.startTimePreference,
          requestedStartTime: taskForm.requestedStartTime
            ? new Date(taskForm.requestedStartTime).toISOString()
            : undefined,
          includeLearnPackage: taskForm.includeLearnPackage,
        });
      } else {
        result = await createHardwareServiceOrder({
          name: hardwareForm.name,
          issue: hardwareForm.issue,
          laptopModel: hardwareForm.laptopModel,
          deliveryMethod: hardwareForm.deliveryMethod,
          expectedCompletion: formatJakartaDateTime(hardwareForm.deadlineInput),
          requestedDeadline: new Date(hardwareForm.deadlineInput).toISOString(),
          startTimePreference: hardwareForm.startTimePreference,
          requestedStartTime: hardwareForm.requestedStartTime
            ? new Date(hardwareForm.requestedStartTime).toISOString()
            : undefined,
          acceptsDataDisclaimer: hardwareForm.acceptsDataDisclaimer,
        });
      }

      if (!result.success) {
        setErrorMessage(result.error || "Gagal memvalidasi pesanan");
        setIsSubmitting(false);
        return;
      }

      const generatedCode = result.orderCode;
      if (generatedCode) {
        setRegisteredOrderCode(generatedCode);
      }

      // Build message with order code
      const finalMsg = generateMessageText(generatedCode);

      // Copy text to clipboard
      navigator.clipboard.writeText(finalMsg);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);

      // Open WhatsApp official
      const cleanPhone = (
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6281234567890"
      ).replace(/[^0-9]/g, "");
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        finalMsg
      )}`;
      window.open(waUrl, "_blank");
    } catch (err) {
      console.error(err);
      setErrorMessage("Terjadi kendala saat menghubungkan ke WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="order-generator" className="py-20 bg-neo-yellow/30 border-b-2 border-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="neo-tag bg-neo-lime text-black font-mono text-xs mb-3">
            INTERACTIVE ORDER GENERATOR
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-black uppercase tracking-tight">
            Buat Format Pesanan Sekali Klik
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-700 font-medium">
            Pilih layanan, tentukan deadline dan waktu mulai pengerjaan. Sistem otomatis menghitung estimasi biaya prioritas secara adil dan transparan.
          </p>
        </div>

        {/* Main Box */}
        <div className="neo-box p-6 sm:p-8 bg-white shadow-neo-lg">
          
          <div className="space-y-6">
            
            {/* Tab Selector */}
            <div className="flex flex-wrap gap-2 sm:gap-3 border-b-2 border-black pb-5">
              <button
                type="button"
                onClick={() => setOrderType("task")}
                className={`neo-btn py-2 px-4 sm:px-6 text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer transition-all ${
                  orderType === "task"
                    ? "bg-neo-blue text-white shadow-neo"
                    : "bg-white text-black hover:bg-slate-50"
                }`}
              >
                <FileCode className="h-4 w-4" />
                <span>Order Tugas Koding / Desain / Riset</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType("hardware")}
                className={`neo-btn py-2 px-4 sm:px-6 text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer transition-all ${
                  orderType === "hardware"
                    ? "bg-neo-lime text-black shadow-neo"
                    : "bg-white text-black hover:bg-slate-50"
                }`}
              >
                <Laptop className="h-4 w-4" />
                <span>Order Servis / Install Laptop</span>
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-6 p-4 border-2 border-black rounded-lg bg-red-100 text-red-900 flex items-center gap-3 text-xs sm:text-sm font-bold shadow-neo-sm">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Registered Order Code Banner */}
            {registeredOrderCode && (
              <div className="mb-6 p-4 border-2 border-black rounded-lg bg-emerald-100 text-emerald-950 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold shadow-neo-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-700" />
                  <span>Pesanan berhasil tercatat di antrean sistem:</span>
                  <span className="font-mono bg-white px-2 py-0.5 border border-black rounded font-black text-black">
                    {registeredOrderCode}
                  </span>
                </div>
                <span className="neo-tag bg-neo-lime text-black font-mono text-[10px]">
                  TERSIMPAN
                </span>
              </div>
            )}

            {/* 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-7 space-y-4">
                {orderType === "task" ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Nama Panggilan / Alias *
                      </label>
                      <input
                        type="text"
                        value={taskForm.name}
                        onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm font-medium border-2 border-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neo-lime"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Kategori Tugas *
                        </label>
                        <select
                          value={taskForm.category}
                          onChange={(e) =>
                            setTaskForm({ ...taskForm, category: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 text-sm font-medium border-2 border-black rounded-lg bg-white focus:outline-none"
                        >
                          <option>Coding Web / Laravel / PHP</option>
                          <option>Database &amp; SQL Query</option>
                          <option>Algoritma &amp; OOP (Python/Java/C++)</option>
                          <option>UI/UX Design Figma</option>
                          <option>Slide Presentasi Sidang &amp; PPT</option>
                          <option>Formatting Word + Sitasi Mendeley</option>
                          <option>Olah Data Excel Lanjutan</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Format Output yang Diminta *
                        </label>
                        <input
                          type="text"
                          value={taskForm.outputFormat}
                          onChange={(e) =>
                            setTaskForm({ ...taskForm, outputFormat: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 text-sm font-medium border-2 border-black rounded-lg bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Detail Instruksi / Deskripsi Singkat *
                      </label>
                      <textarea
                        rows={3}
                        value={taskForm.instructions}
                        onChange={(e) =>
                          setTaskForm({ ...taskForm, instructions: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-sm font-medium border-2 border-black rounded-lg bg-white focus:outline-none"
                      ></textarea>
                    </div>

                    {/* Deadline Field (datetime-local) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-800">
                          Tenggat Waktu / Deadline Dibutuhkan *
                        </label>
                        <span className="text-[11px] font-mono text-slate-500">
                          Zona Waktu: Asia/Jakarta (WIB)
                        </span>
                      </div>
                      <input
                        type="datetime-local"
                        value={taskForm.deadlineInput}
                        onChange={(e) =>
                          setTaskForm({ ...taskForm, deadlineInput: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-sm font-bold border-2 border-black rounded-lg bg-white focus:outline-none"
                      />
                      <p className="mt-1 text-[11px] font-mono text-slate-600">
                        Terpilih: {formatJakartaDateTime(taskForm.deadlineInput)}
                      </p>
                    </div>

                    {/* Waktu Mulai Pengerjaan Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Waktu Mulai Pengerjaan yang Diharapkan *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setTaskForm({ ...taskForm, startTimePreference: "asap" })}
                          className={`p-2.5 text-left border-2 border-black rounded-lg text-xs font-bold transition-all ${
                            taskForm.startTimePreference === "asap"
                              ? "bg-neo-lime text-black shadow-neo-sm"
                              : "bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-black">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Mulai Secepatnya</span>
                          </div>
                          <p className="text-[10px] font-medium text-slate-600 mt-1">
                            Langsung ditangani tim standby
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setTaskForm({ ...taskForm, startTimePreference: "regular_hours" })
                          }
                          className={`p-2.5 text-left border-2 border-black rounded-lg text-xs font-bold transition-all ${
                            taskForm.startTimePreference === "regular_hours"
                              ? "bg-neo-lime text-black shadow-neo-sm"
                              : "bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-black">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Jam Kerja Reguler</span>
                          </div>
                          <p className="text-[10px] font-medium text-slate-600 mt-1">
                            06.00–22.00 WIB (Bebas Biaya Dini Hari)
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setTaskForm({ ...taskForm, startTimePreference: "specific_time" })
                          }
                          className={`p-2.5 text-left border-2 border-black rounded-lg text-xs font-bold transition-all ${
                            taskForm.startTimePreference === "specific_time"
                              ? "bg-neo-lime text-black shadow-neo-sm"
                              : "bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-black">
                            <Moon className="h-3.5 w-3.5" />
                            <span>Jadwal Khusus</span>
                          </div>
                          <p className="text-[10px] font-medium text-slate-600 mt-1">
                            Pilih tanggal &amp; jam mulai
                          </p>
                        </button>
                      </div>

                      {taskForm.startTimePreference === "specific_time" && (
                        <div className="mt-2.5 p-3 border-2 border-black rounded-lg bg-slate-50">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Pilih Tanggal &amp; Jam Mulai yang Diinginkan:
                          </label>
                          <input
                            type="datetime-local"
                            value={taskForm.requestedStartTime}
                            onChange={(e) =>
                              setTaskForm({ ...taskForm, requestedStartTime: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs font-bold border-2 border-black rounded bg-white"
                          />
                        </div>
                      )}
                    </div>

                    {/* Learn Package Checkbox */}
                    <div className="p-3.5 border-2 border-black rounded-lg bg-neo-lime/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={taskForm.includeLearnPackage}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              includeLearnPackage: e.target.checked,
                            })
                          }
                          className="h-5 w-5 accent-neo-blue border-2 border-black rounded cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-black text-black">
                            Ambil Paket &quot;Sekalian Belajar&quot; (+Rp25.000)
                          </p>
                          <p className="text-[11px] text-slate-600 font-medium">
                            Sertakan full komentar baris kode &amp; VN penjelasan alur program.
                          </p>
                        </div>
                      </div>
                      <span className="neo-tag bg-neo-yellow text-black font-mono text-[10px]">
                        REKOMENDASI
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Nama Panggilan / Alias *
                      </label>
                      <input
                        type="text"
                        value={hardwareForm.name}
                        onChange={(e) =>
                          setHardwareForm({ ...hardwareForm, name: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-sm font-medium border-2 border-black rounded-lg bg-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Kendala / Layanan yang Dibutuhkan *
                        </label>
                        <select
                          value={hardwareForm.issue}
                          onChange={(e) =>
                            setHardwareForm({ ...hardwareForm, issue: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 text-sm font-medium border-2 border-black rounded-lg bg-white focus:outline-none"
                        >
                          <option>Cleaning Fan + Repaste Thermal Paste Overheat</option>
                          <option>Install Ulang Windows/Linux + Office/CAD</option>
                          <option>Upgrade SSD/RAM + Clone Sistem Operasi</option>
                          <option>Troubleshoot Blue Screen (BSOD) &amp; Malware</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Tipe / Merk Laptop *
                        </label>
                        <input
                          type="text"
                          value={hardwareForm.laptopModel}
                          onChange={(e) =>
                            setHardwareForm({
                              ...hardwareForm,
                              laptopModel: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2.5 text-sm font-medium border-2 border-black rounded-lg bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Metode Penyerahan *
                        </label>
                        <select
                          value={hardwareForm.deliveryMethod}
                          onChange={(e) =>
                            setHardwareForm({
                              ...hardwareForm,
                              deliveryMethod: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2.5 text-sm font-medium border-2 border-black rounded-lg bg-white focus:outline-none"
                        >
                          <option>Drop-off ke Lokasi Admin</option>
                          <option>Home Service (Area Terjangkau)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Target Selesai / Deadline Dibutuhkan *
                        </label>
                        <input
                          type="datetime-local"
                          value={hardwareForm.deadlineInput}
                          onChange={(e) =>
                            setHardwareForm({
                              ...hardwareForm,
                              deadlineInput: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2.5 text-sm font-bold border-2 border-black rounded-lg bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Disclaimer Checkbox */}
                    <div className="p-3.5 border-2 border-black rounded-lg bg-amber-50 flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={hardwareForm.acceptsDataDisclaimer}
                        onChange={(e) =>
                          setHardwareForm({
                            ...hardwareForm,
                            acceptsDataDisclaimer: e.target.checked,
                          })
                        }
                        className="h-5 w-5 accent-neo-blue border-2 border-black rounded mt-0.5 cursor-pointer"
                      />
                      <div>
                        <p className="text-xs font-black text-black">
                          Persetujuan Backup Data Mandiri *
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium">
                          Saya memahami bahwa data penting telah dibackup mandiri sebelum unit diserahkan ke teknisi.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Transparency Breakdown Card */}
                {livePricing && (
                  <div className="p-4 border-2 border-black rounded-lg bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-neo-blue" />
                        <span className="font-heading font-black text-xs text-black uppercase">
                          Estimasi Biaya Prioritas &amp; Luar Jam:
                        </span>
                      </div>
                      <span className="font-mono font-black text-xs px-2 py-0.5 rounded border border-black bg-white">
                        {livePricing.hoursRemaining > 0
                          ? `${livePricing.hoursRemaining} Jam Menuju Deadline`
                          : "Waktu Lewat"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 border border-black/30 rounded bg-white">
                        <span className="text-slate-500 block">Biaya Deadline:</span>
                        <span className="font-black text-black">
                          {livePricing.deadlineSurchargePercent > 0
                            ? `+${livePricing.deadlineSurchargePercent}% (${livePricing.deadlineTierLabel})`
                            : "0% (Reguler / Standar)"}
                        </span>
                      </div>

                      <div className="p-2 border border-black/30 rounded bg-white">
                        <span className="text-slate-500 block">Layanan Luar Jam:</span>
                        <span className="font-black text-black">
                          {livePricing.afterHoursSurchargePercent > 0
                            ? `+${livePricing.afterHoursSurchargePercent}% (${livePricing.afterHoursTierLabel})`
                            : "0% (Jam Operasional Normal)"}
                        </span>
                      </div>
                    </div>

                    {livePricing.priorityStatus === "priority_pending_admin" && (
                      <div className="p-2.5 border-2 border-black rounded bg-red-100 text-red-900 text-xs font-bold flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-700 shrink-0 mt-0.5" />
                        <span>
                          Deadline &lt; 2 jam memerlukan pemeriksaan kesiapan admin terlebih dahulu sebelum pesanan dapat disetujui.
                        </span>
                      </div>
                    )}

                    <p className="text-[10px] text-slate-500 font-mono italic">
                      *Total biaya tambahan reguler dibatasi maksimal 25%. Estimasi nominal final akan dikonfirmasi admin dalam penawaran resmi (Quotation).
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Live WhatsApp Box */}
              <div className="lg:col-span-5 neo-box bg-neo-dark text-white p-5 sm:p-6 shadow-neo-lg">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                  <span className="font-mono text-xs font-bold text-neo-yellow tracking-wider">
                    LIVE WHATSAPP MESSAGE PREVIEW
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    <span>{registeredOrderCode ? "Tercatat di Database" : "Siap Kirim"}</span>
                  </span>
                </div>

                {/* Message Box */}
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap min-h-64 mb-5">
                  {currentMessage}
                </div>

                {/* Button Salin & Buka WhatsApp */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleActionWhatsApp}
                  className="w-full neo-btn-lime py-3.5 text-sm font-black flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-black" />
                      <span>Mencatat Pesanan &amp; Membuka WhatsApp...</span>
                    </>
                  ) : copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Format Tersalin! Mengalihkan ke WhatsApp...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      <span>Salin &amp; Buka WhatsApp Resmi</span>
                    </>
                  )}
                </button>

                <p className="mt-3 text-[11px] text-center text-slate-400 font-mono">
                  Admin standby merespons cepat &amp; memberikan konfirmasi slot.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
