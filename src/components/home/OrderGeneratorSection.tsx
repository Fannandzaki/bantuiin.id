"use client";

import { useState } from "react";
import { Laptop, FileCode, Send, Check, Loader2, AlertCircle } from "lucide-react";
import {
  createDigitalTaskOrder,
  createHardwareServiceOrder,
} from "@/app/actions/orders";

export function OrderGeneratorSection() {
  const [orderType, setOrderType] = useState<"task" | "hardware">("task");

  // State for Digital Task Form with Figma defaults
  const [taskForm, setTaskForm] = useState({
    name: "Mahasiswa Hebat",
    category: "Coding Web / Laravel / PHP",
    outputFormat: ".ZIP (Source Code) + .SQL",
    instructions: "Bikin sistem kasir mini ada CRUD produk dan laporan transaksi harian.",
    deadline: "Besok lusa, pukul 18.00 WIB",
    includeLearnPackage: true,
  });

  // State for Hardware Service Form
  const [hardwareForm, setHardwareForm] = useState({
    name: "Mahasiswa Hebat",
    issue: "Cleaning Fan + Repaste Thermal Paste Overheat",
    laptopModel: "Asus ROG Zephyrus / Lenovo Legion",
    deliveryMethod: "Drop-off ke Lokasi Admin",
    expectedCompletion: "Besok lusa, pukul 17.00 WIB",
    acceptsDataDisclaimer: true,
  });

  const [registeredOrderCode, setRegisteredOrderCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate WhatsApp message based on active tab matching Figma format
  const generateMessageText = (code?: string) => {
    const orderIdLine = code ? `• ID Pesanan  : ${code}\n` : "";

    if (orderType === "task") {
      return (
        `Halo Tim bantuiin.id, saya mau order bantuan tugas/proyek:\n\n` +
        orderIdLine +
        `• Nama Klien  : ${taskForm.name || "..."}\n` +
        `• Kategori    : ${taskForm.category}\n` +
        `• Format File : ${taskForm.outputFormat || "..."}\n` +
        `• Deadline    : ${taskForm.deadline || "..."}\n` +
        `• Pkt Belajar : ${
          taskForm.includeLearnPackage
            ? "YA (Ambil Paket Sekalian Belajar)"
            : "Tidak"
        }\n\n` +
        `Detail Instruksi:\n"${taskForm.instructions || "..."}"\n\n` +
        `Mohon dicek estimasi biaya dan ketersediaan slotnya, terima kasih!`
      );
    } else {
      return (
        `Halo Tim bantuiin.id, saya mau order bantuan servis laptop:\n\n` +
        orderIdLine +
        `• Nama Klien  : ${hardwareForm.name || "..."}\n` +
        `• Kendala/Item: ${hardwareForm.issue}\n` +
        `• Tipe Laptop : ${hardwareForm.laptopModel || "..."}\n` +
        `• Penyerahan  : ${hardwareForm.deliveryMethod}\n` +
        `• Target Waktu: ${hardwareForm.expectedCompletion || "..."}\n` +
        `• Backup Data : ${
          hardwareForm.acceptsDataDisclaimer ? "Sudah disetujui" : "Belum"
        }\n\n` +
        `Mohon dicek estimasi biaya dan ketersediaan slotnya, terima kasih!`
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
          deadline: taskForm.deadline,
          includeLearnPackage: taskForm.includeLearnPackage,
        });
      } else {
        result = await createHardwareServiceOrder({
          name: hardwareForm.name,
          issue: hardwareForm.issue,
          laptopModel: hardwareForm.laptopModel,
          deliveryMethod: hardwareForm.deliveryMethod,
          expectedCompletion: hardwareForm.expectedCompletion,
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

      // Open WhatsApp
      const adminPhone =
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
        process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ||
        "6281234567890";
      const encoded = encodeURIComponent(finalMsg);
      window.open(`https://wa.me/${adminPhone}?text=${encoded}`, "_blank");
    } catch (err) {
      console.error("Order submit error:", err);
      // Fallback: still open WhatsApp
      const finalMsg = generateMessageText();
      const adminPhone =
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
        process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ||
        "6281234567890";
      window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(finalMsg)}`, "_blank");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="format-pemesanan" className="py-20 bg-white border-b-2 border-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Outer Card with Royal Blue Header from Figma */}
        <div className="neo-box overflow-hidden shadow-neo-lg">
          
          {/* Royal Blue Header */}
          <div className="bg-neo-blue p-6 sm:p-8 border-b-2 border-black flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
            <div>
              <div className="inline-block bg-neo-lime text-black font-mono font-black text-[11px] px-2.5 py-0.5 border border-black rounded shadow-neo-sm mb-2">
                FITUR CEPAT
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
                Generator Format Order Otomatis ke WhatsApp
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xs font-medium leading-relaxed">
              Isi form di bawah, teks rapi akan ter-generate otomatis secara instan.
            </p>
          </div>

          {/* Body Section */}
          <div className="p-6 sm:p-8 bg-white">
            
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                type="button"
                onClick={() => {
                  setOrderType("task");
                  setRegisteredOrderCode(null);
                  setErrorMessage(null);
                }}
                className={`neo-btn text-xs sm:text-sm font-black flex items-center gap-2 ${
                  orderType === "task"
                    ? "bg-neo-lime text-black shadow-neo"
                    : "bg-white text-slate-800 shadow-neo-sm"
                }`}
              >
                <FileCode className="h-4 w-4" />
                <span>Order Joki Tugas/Proyek</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOrderType("hardware");
                  setRegisteredOrderCode(null);
                  setErrorMessage(null);
                }}
                className={`neo-btn text-xs sm:text-sm font-black flex items-center gap-2 ${
                  orderType === "hardware"
                    ? "bg-neo-lime text-black shadow-neo"
                    : "bg-white text-slate-800 shadow-neo-sm"
                }`}
              >
                <Laptop className="h-4 w-4" />
                <span>Order Servis/Install Laptop</span>
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
                  <span>Pesanan berhasil tercatat di sistem:</span>
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

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Tenggat Waktu / Deadline Pasti *
                      </label>
                      <input
                        type="text"
                        value={taskForm.deadline}
                        onChange={(e) =>
                          setTaskForm({ ...taskForm, deadline: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-sm font-medium border-2 border-black rounded-lg bg-white focus:outline-none"
                      />
                    </div>

                    {/* Learn Package Row with REKOMENDASI Badge */}
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
                            Ambil Paket &quot;Sekalian Belajar&quot; (+Rp25k-50k)
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
                          Tenggat Waktu / Selesai Pasti *
                        </label>
                        <input
                          type="text"
                          value={hardwareForm.expectedCompletion}
                          onChange={(e) =>
                            setHardwareForm({
                              ...hardwareForm,
                              expectedCompletion: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2.5 text-sm font-medium border-2 border-black rounded-lg bg-white focus:outline-none"
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
                        className="mt-0.5 h-4 w-4 accent-black border-2 border-black rounded cursor-pointer shrink-0"
                      />
                      <p className="text-[11px] text-amber-950 font-medium leading-relaxed">
                        <strong>Disclaimer Kehilangan Data:</strong> Klien wajib membackup data penting secara mandiri sebelum servis. Bantuiin.id tidak bertanggung jawab atas data non-backup.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Right Column: Live WhatsApp Box from Figma */}
              <div className="lg:col-span-5 neo-box bg-neo-dark text-white p-5 sm:p-6 shadow-neo-lg">
                {/* Header */}
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

                {/* Button Salin & Buka WhatsApp Resmi with Server Action */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleActionWhatsApp}
                  className="w-full neo-btn-lime py-3.5 text-sm font-black flex items-center justify-center gap-2 group disabled:opacity-70"
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
                  Nomor resmi terverifikasi: +62 821-xxxx-xxxx (Respon kilat 24/7)
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
