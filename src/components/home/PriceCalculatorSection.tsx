"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Code2,
  Palette,
  FileText,
  Wrench,
  Calculator,
  Zap,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MessageCircle,
  Info,
  Check,
  Sparkles,
  BookOpen,
} from "lucide-react";
import {
  CALCULATOR_CATEGORIES,
  CALCULATOR_SERVICES,
  calculateInteractivePrice,
  formatRupiah,
} from "@/lib/pricing/pricing-engine";
import { formatJakartaDateTime } from "@/lib/pricing/priority-calculator";
import {
  CalculatorServiceConfig,
  ServiceCategoryKey,
  StartTimePreference,
  CalculatorPrefillEventData,
} from "@/types";
import {
  buildWhatsAppUrl,
  generateCalculatorWhatsAppMessage,
} from "@/lib/whatsapp";

// Helper for default deadline: 48 hours from now in local YYYY-MM-DDTHH:mm format
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

export function PriceCalculatorSection() {
  // Category Selection
  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCategoryKey>("coding");

  // Filter services for current category
  const categoryServices = useMemo(() => {
    return CALCULATOR_SERVICES.filter(
      (s) => s.categoryId === selectedCategory
    );
  }, [selectedCategory]);

  // Selected Service
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    categoryServices[0]?.id || "algo-basic"
  );

  // When category changes, reset selected service to first in category
  useEffect(() => {
    const firstInCat = CALCULATOR_SERVICES.find(
      (s) => s.categoryId === selectedCategory
    );
    if (firstInCat) {
      setSelectedServiceId(firstInCat.id);
    }
  }, [selectedCategory]);

  const activeService: CalculatorServiceConfig = useMemo(() => {
    return (
      CALCULATOR_SERVICES.find((s) => s.id === selectedServiceId) ||
      CALCULATOR_SERVICES[0]
    );
  }, [selectedServiceId]);

  // Quantity input state (Price-Impacting)
  const [quantity, setQuantity] = useState<number>(
    activeService.defaultQuantity || 1
  );

  // References count state (Price-Impacting for documents)
  const [referencesCount, setReferencesCount] = useState<number>(
    activeService.defaultReferences || 5
  );

  // When active service changes, synchronize quantity and references
  useEffect(() => {
    setQuantity(activeService.defaultQuantity || 1);
    setReferencesCount(activeService.defaultReferences || 5);
  }, [activeService]);

  // Non-price-impacting info parameters (stored purely as brief notes)
  const [infoNotes, setInfoNotes] = useState<string>("");

  // Schedule & Deadline states (Price-Impacting)
  const [deadlineInput, setDeadlineInput] = useState<string>(
    getDefaultDeadlineLocal()
  );
  const [startTimePref, setStartTimePref] =
    useState<StartTimePreference>("asap");
  const [requestedStartTime, setRequestedStartTime] = useState<string>("");

  // Optional Add-on (Price-Impacting)
  const [includeLearnPackage, setIncludeLearnPackage] =
    useState<boolean>(false);

  // Copy feedback
  const [copied, setCopied] = useState<boolean>(false);

  // Real-time calculation result (Pure derived state)
  const calculationResult = useMemo(() => {
    try {
      const parsedDeadline = new Date(deadlineInput);
      return calculateInteractivePrice({
        service: activeService,
        quantity,
        referencesCount,
        deadline: isNaN(parsedDeadline.getTime()) ? new Date() : parsedDeadline,
        startTimePreference: startTimePref,
        requestedStartTime: requestedStartTime || null,
        includeLearnPackage,
      });
    } catch {
      return null;
    }
  }, [
    activeService,
    quantity,
    referencesCount,
    deadlineInput,
    startTimePref,
    requestedStartTime,
    includeLearnPackage,
  ]);

  // Stepper handlers for quantity
  const handleQuantityDecrement = () => {
    const min = activeService.minQuantity || 1;
    setQuantity((prev) => Math.max(min, prev - 1));
  };

  const handleQuantityIncrement = () => {
    const max = activeService.maxQuantity || 100;
    setQuantity((prev) => Math.min(max, prev + 1));
  };

  // Stepper handlers for references
  const handleReferencesDecrement = () => {
    setReferencesCount((prev) => Math.max(0, prev - 1));
  };

  const handleReferencesIncrement = () => {
    const max = activeService.maxReferences || 30;
    setReferencesCount((prev) => Math.min(max, prev + 1));
  };

  // Category Icon helper
  const getCategoryIcon = (key: string) => {
    switch (key) {
      case "coding":
        return <Code2 className="h-4 w-4 sm:h-5 sm:w-5" />;
      case "design":
        return <Palette className="h-4 w-4 sm:h-5 sm:w-5" />;
      case "documents":
        return <FileText className="h-4 w-4 sm:h-5 sm:w-5" />;
      case "hardware":
        return <Wrench className="h-4 w-4 sm:h-5 sm:w-5" />;
      default:
        return <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  // Surcharge text for WhatsApp & invoice
  const surchargeSummaryText = useMemo(() => {
    if (!calculationResult || calculationResult.isManualQuotation) {
      return "0% (Normal)";
    }
    if (calculationResult.isInvalidDeadline) {
      return "Deadline Tidak Valid";
    }
    if (calculationResult.surchargePercent === 0) {
      return "0% (Reguler / Normal)";
    }
    return `+${calculationResult.surchargePercent}% (${calculationResult.deadlineTierLabel}${
      calculationResult.afterHoursSurchargePercent > 0
        ? ` + ${calculationResult.afterHoursTierLabel}`
        : ""
    })`;
  }, [calculationResult]);

  const startTimeSummaryLabel = useMemo(() => {
    if (startTimePref === "asap") return "Mulai Secepatnya / Standby";
    if (startTimePref === "regular_hours")
      return "Jam Kerja Reguler (06.00–22.00 WIB)";
    return `Jadwal Khusus: ${requestedStartTime ? formatJakartaDateTime(requestedStartTime) : "Ditentukan kemudian"}`;
  }, [startTimePref, requestedStartTime]);

  // Action 1: Forward to Order Form with Prefill
  const handleProceedToOrderForm = () => {
    const orderType: "task" | "hardware" =
      selectedCategory === "hardware" ? "hardware" : "task";

    const eventData: CalculatorPrefillEventData = {
      orderType,
      categoryId: selectedCategory,
      serviceId: activeService.id,
      serviceTitle: activeService.title,
      quantity,
      unitName: activeService.unitName,
      referencesCount: activeService.hasReferencesInput ? referencesCount : undefined,
      deadlineIso: new Date(deadlineInput).toISOString(),
      deadlineFormatted: formatJakartaDateTime(deadlineInput),
      startTimePreference: startTimePref,
      requestedStartTime: requestedStartTime || undefined,
      includeLearnPackage: activeService.allowLearnPackage ? includeLearnPackage : false,
      priceEstimateText: calculationResult?.priceRangeFormatted || "Konsultasi",
      surchargeSummaryText,
      infoNotes: infoNotes.trim() || undefined,
    };

    if (typeof window !== "undefined") {
      const evt = new CustomEvent("bantuiin:prefill-order", {
        detail: eventData,
      });
      window.dispatchEvent(evt);

      const el = document.getElementById("order-generator") || document.getElementById("format-pemesanan");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Action 2: Open Direct WhatsApp Consultation
  const handleWhatsAppConsultation = () => {
    const catName =
      CALCULATOR_CATEGORIES.find((c) => c.id === selectedCategory)?.name ||
      "Layanan";

    const msg = generateCalculatorWhatsAppMessage({
      categoryName: catName,
      serviceTitle: activeService.title,
      quantity,
      unitName: activeService.unitName,
      referencesCount: activeService.hasReferencesInput ? referencesCount : undefined,
      deadlineFormatted: formatJakartaDateTime(deadlineInput),
      startTimeLabel: startTimeSummaryLabel,
      priceEstimateText: calculationResult?.priceRangeFormatted || "Berdasarkan Konsultasi",
      surchargeSummaryText,
      includeLearnPackage: activeService.allowLearnPackage ? includeLearnPackage : false,
      infoNotes: infoNotes.trim() || undefined,
    });

    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);

    const waUrl = buildWhatsAppUrl(msg);
    window.open(waUrl, "_blank");
  };

  return (
    <section
      id="kalkulator-harga"
      className="py-12 sm:py-16 md:py-20 bg-slate-50 border-b-2 border-black relative overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 neo-tag bg-neo-yellow text-black font-mono text-[10px] sm:text-xs mb-2 sm:mb-3">
            <Calculator className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>SIMULASI HARGA INTERAKTIF</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-black tracking-tight mb-2 sm:mb-3">
            Kalkulator &amp; Estimasi Biaya Real-time
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-700 font-medium px-2 max-w-xl mx-auto leading-relaxed">
            Geser slider untuk melihat perubahan perkiraan harga secara langsung. Transparan, adil,
            dan bebas mark-up tersembunyi!
          </p>
        </div>

        {/* STEP 1: PILIH KATEGORI (Segmented Neo Buttons) */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono font-black text-slate-800 uppercase tracking-wide">
            <span className="h-2 w-2 bg-neo-blue rounded-full"></span>
            <span>Langkah 1: Pilih Kategori Layanan</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {CALCULATOR_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as ServiceCategoryKey)}
                  className={`neo-box p-3 sm:p-4 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-neo-blue text-white shadow-neo translate-x-0.5 -translate-y-0.5"
                      : "bg-white text-slate-900 hover:bg-slate-100 shadow-neo-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`p-1.5 rounded border border-black ${
                        isSelected ? "bg-neo-yellow text-black" : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {getCategoryIcon(cat.id)}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-black ${
                        isSelected ? "bg-white text-black" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {cat.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-xs sm:text-sm leading-snug">
                      {cat.name}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN CALCULATOR GRID: Two Columns (Controls on Left, Mini Invoice on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: Steps 2, 3, 4 (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* STEP 2: PILIH LAYANAN */}
            <div className="neo-box bg-white p-4 sm:p-5 shadow-neo">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <span className="text-xs font-mono font-black text-black uppercase">
                  Langkah 2: Pilih Layanan Spesifik
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {categoryServices.length} opsi tersedia
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {categoryServices.map((srv) => {
                  const isSelected = selectedServiceId === srv.id;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => setSelectedServiceId(srv.id)}
                      className={`w-full p-2.5 sm:p-3 text-left border-2 rounded transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "border-black bg-neo-lime/30 text-black shadow-neo-sm font-bold"
                          : "border-slate-200 bg-white hover:border-black text-slate-700"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {srv.badgeLabel && (
                            <span className="text-[9px] font-mono font-bold bg-white px-1 border border-black rounded">
                              {srv.badgeLabel}
                            </span>
                          )}
                          <p className="font-heading font-black text-xs sm:text-sm truncate text-black">
                            {srv.title}
                          </p>
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-600 line-clamp-1">
                          {srv.description}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="font-mono text-[10px] sm:text-xs font-black text-neo-blue block">
                          {srv.pricingMethod === "manual_quotation"
                            ? "Konsultasi"
                            : srv.pricingMethod === "per_unit"
                            ? `${formatRupiah(srv.minPrice)} / unit`
                            : srv.pricingMethod === "per_document"
                            ? `${formatRupiah(srv.minPrice)}+`
                            : `${formatRupiah(srv.minPrice)}+`}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          {srv.estimatedDuration}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: INPUT JUMLAH PEKERJAAN (SLIDER HORIZONTAL + STEPPER) */}
            <div className="neo-box bg-white p-4 sm:p-5 shadow-neo space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-mono font-black text-black uppercase">
                  Langkah 3: Jumlah &amp; Parameter Pekerjaan
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                  ⚡ Memengaruhi Estimasi Real-time
                </span>
              </div>

              {/* SLIDER UTAMA: QUANTITY */}
              {activeService.pricingMethod !== "manual_quotation" ? (
                <div className="p-3.5 bg-slate-50 border-2 border-black rounded-lg space-y-3">
                  
                  {/* Top Header: Label & Live Value Badge */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase text-slate-600 block">
                        PERKIRAAN JUMLAH {activeService.unitName?.toUpperCase() || "UNIT"}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Rentang: {activeService.minQuantity || 1} – {activeService.maxQuantity || 50} {activeService.unitName || "unit"}
                      </span>
                    </div>

                    {/* Prominent Live Value Badge */}
                    <div className="neo-tag bg-neo-yellow text-black font-heading font-black text-xs sm:text-sm px-3 py-1 border-2 border-black shadow-neo-sm">
                      {quantity} {activeService.unitName || "Unit"}
                    </div>
                  </div>

                  {/* Horizontal Slider Controls with Stepper Minus & Plus */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleQuantityDecrement}
                      disabled={quantity <= (activeService.minQuantity || 1)}
                      className="w-9 h-9 rounded border-2 border-black bg-white hover:bg-neo-yellow/40 active:translate-y-0.5 flex items-center justify-center font-black text-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-neo-sm"
                      aria-label="Kurang satu unit"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <div className="flex-1 relative flex items-center">
                      <input
                        type="range"
                        min={activeService.minQuantity || 1}
                        max={activeService.maxQuantity || 50}
                        step={1}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                        className="w-full h-3 bg-slate-200 border-2 border-black rounded-lg appearance-none cursor-pointer accent-neo-blue"
                        aria-label={`Jumlah ${activeService.unitName || "pekerjaan"}`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleQuantityIncrement}
                      disabled={quantity >= (activeService.maxQuantity || 50)}
                      className="w-9 h-9 rounded border-2 border-black bg-white hover:bg-neo-yellow/40 active:translate-y-0.5 flex items-center justify-center font-black text-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-neo-sm"
                      aria-label="Tambah satu unit"
                    >
                      <Plus className="h-4 w-4" />
                    </button>

                    {/* Direct numeric input box */}
                    <input
                      type="number"
                      min={activeService.minQuantity || 1}
                      max={activeService.maxQuantity || 100}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) setQuantity(val);
                      }}
                      className="w-14 h-9 text-center font-heading font-black text-xs sm:text-sm border-2 border-black rounded bg-white focus:outline-none focus:ring-2 focus:ring-neo-blue"
                    />
                  </div>

                  {/* Package Notes / Explanations */}
                  {activeService.packageNote && (
                    <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium pt-1">
                      💡 {activeService.packageNote}
                    </p>
                  )}

                  {/* Warning if outside package limit */}
                  {calculationResult?.isOutsidePackage && (
                    <div className="p-2.5 rounded bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      <p>{calculationResult.packageWarning}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 bg-blue-50 border-2 border-blue-300 rounded-lg text-xs text-blue-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info className="h-4 w-4 text-neo-blue shrink-0" />
                    <span>Layanan Estimasi Berdasarkan Konsultasi</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    {activeService.packageNote ||
                      "Layanan ini belum memiliki tarif baku per unit. Admin akan menghitung penawaran resmi yang adil sesuai detail brief Anda."}
                  </p>
                </div>
              )}

              {/* SLIDER KEDUA: REFERENSI JURNAL (Untuk Layanan Dokumen / Makalah) */}
              {activeService.hasReferencesInput && (
                <div className="p-3.5 bg-emerald-50/60 border-2 border-black rounded-lg space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase text-slate-700 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
                        JUMLAH REFERENSI JURNAL (OPSIONAL)
                      </span>
                      <span className="text-[10px] text-slate-600">
                        1–5 jurnal sudah termasuk gratis dalam paket. Ekstra: +Rp2.500/jurnal.
                      </span>
                    </div>

                    <div className="neo-tag bg-white text-emerald-900 font-heading font-black text-xs px-2.5 py-1 border border-black shadow-neo-sm">
                      {referencesCount} Jurnal {referencesCount > 5 ? `(+${referencesCount - 5} Ekstra)` : "(Gratis)"}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleReferencesDecrement}
                      disabled={referencesCount <= 0}
                      className="w-8 h-8 rounded border-2 border-black bg-white hover:bg-slate-100 flex items-center justify-center font-black text-black cursor-pointer disabled:opacity-40 shadow-neo-sm"
                      aria-label="Kurang referensi"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex-1 relative flex items-center">
                      <input
                        type="range"
                        min={0}
                        max={activeService.maxReferences || 30}
                        step={1}
                        value={referencesCount}
                        onChange={(e) => setReferencesCount(parseInt(e.target.value, 10) || 0)}
                        className="w-full h-2.5 bg-slate-200 border-2 border-black rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        aria-label="Jumlah referensi jurnal"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleReferencesIncrement}
                      disabled={referencesCount >= (activeService.maxReferences || 30)}
                      className="w-8 h-8 rounded border-2 border-black bg-white hover:bg-slate-100 flex items-center justify-center font-black text-black cursor-pointer disabled:opacity-40 shadow-neo-sm"
                      aria-label="Tambah referensi"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>

                    <input
                      type="number"
                      min={0}
                      max={activeService.maxReferences || 30}
                      value={referencesCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) setReferencesCount(val);
                      }}
                      className="w-12 h-8 text-center font-heading font-black text-xs border-2 border-black rounded bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* INPUT NON-HARGA: INFORMASI & BRIEF TAMBAHAN */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Catatan Brief / Topik Pekerjaan (Opsional)
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    Tidak memengaruhi harga
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={infoNotes}
                  onChange={(e) => setInfoNotes(e.target.value)}
                  placeholder="Misal: Topik makalah Sistem Operasi, framework Laravel 11, atau merk laptop ROG G14..."
                  className="w-full p-2.5 text-xs border border-black rounded focus:outline-none focus:ring-1 focus:ring-neo-blue font-medium bg-white"
                ></textarea>
              </div>

            </div>

            {/* STEP 4: WAKTU MULAI & DEADLINE (Aturan Biaya Prioritas & Lembur) */}
            <div className="neo-box bg-white p-4 sm:p-5 shadow-neo space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-mono font-black text-black uppercase">
                  Langkah 4: Waktu Mulai &amp; Target Deadline
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Asia/Jakarta (WIB)
                </span>
              </div>

              {/* Start Time Preference Selector */}
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1.5">
                  Waktu Mulai Pengerjaan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setStartTimePref("asap")}
                    className={`p-2.5 rounded border-2 text-left font-bold transition-all cursor-pointer ${
                      startTimePref === "asap"
                        ? "border-black bg-neo-yellow text-black shadow-neo-sm"
                        : "border-slate-200 bg-white hover:border-black text-slate-700"
                    }`}
                  >
                    <span>⚡ Secepatnya</span>
                    <span className="block text-[10px] font-normal text-slate-600 mt-0.5">
                      Standby langsung
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStartTimePref("regular_hours")}
                    className={`p-2.5 rounded border-2 text-left font-bold transition-all cursor-pointer ${
                      startTimePref === "regular_hours"
                        ? "border-black bg-neo-yellow text-black shadow-neo-sm"
                        : "border-slate-200 bg-white hover:border-black text-slate-700"
                    }`}
                  >
                    <span>🕒 Jam Reguler (0%)</span>
                    <span className="block text-[10px] font-normal text-slate-600 mt-0.5">
                      06.00 – 22.00 WIB
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStartTimePref("specific_time")}
                    className={`p-2.5 rounded border-2 text-left font-bold transition-all cursor-pointer ${
                      startTimePref === "specific_time"
                        ? "border-black bg-neo-yellow text-black shadow-neo-sm"
                        : "border-slate-200 bg-white hover:border-black text-slate-700"
                    }`}
                  >
                    <span>📅 Jadwal Khusus</span>
                    <span className="block text-[10px] font-normal text-slate-600 mt-0.5">
                      Pilih jam mulai
                    </span>
                  </button>
                </div>

                {/* Specific time input if selected */}
                {startTimePref === "specific_time" && (
                  <div className="mt-2.5 p-2.5 bg-slate-50 border border-black rounded">
                    <label className="text-[11px] font-mono font-bold text-slate-700 block mb-1">
                      Tentukan Tanggal &amp; Jam Mulai Pengerjaan:
                    </label>
                    <input
                      type="datetime-local"
                      value={requestedStartTime}
                      onChange={(e) => setRequestedStartTime(e.target.value)}
                      className="w-full py-1.5 px-3 text-xs border border-black rounded focus:outline-none font-mono bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Deadline Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-900">
                    Tenggat Waktu Selesai (Deadline):
                  </label>
                  {calculationResult && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-black ${
                        calculationResult.isInvalidDeadline
                          ? "bg-red-200 text-red-950 animate-pulse"
                          : calculationResult.requiresAdminApproval
                          ? "bg-red-100 text-red-900"
                          : calculationResult.deadlineSurchargePercent > 0
                          ? "bg-amber-100 text-amber-900"
                          : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {calculationResult.deadlineTierLabel}
                    </span>
                  )}
                </div>

                <input
                  type="datetime-local"
                  value={deadlineInput}
                  onChange={(e) => setDeadlineInput(e.target.value)}
                  className="w-full py-2 px-3 text-xs sm:text-sm border-2 border-black rounded focus:outline-none font-mono shadow-neo-sm bg-white"
                />

                {/* Warning / Error Notices */}
                {calculationResult?.isInvalidDeadline ? (
                  <div className="mt-2 p-2.5 rounded bg-red-100 border border-red-400 text-red-900 text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>
                      Deadline tidak valid: waktu selesai berada sebelum atau tepat sama dengan waktu mulai pengerjaan. Mohon periksa kembali jadwal Anda.
                    </span>
                  </div>
                ) : calculationResult?.requiresAdminApproval ? (
                  <div className="mt-2 p-2 rounded bg-red-50 border border-red-300 text-red-900 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>
                      Deadline &lt; 2 jam merupakan permintaan darurat yang memerlukan persetujuan ketersediaan slot programmer/teknisi.
                    </span>
                  </div>
                ) : null}
              </div>

              {/* STEP 5: ADD-ON PAKET SEKALIAN BELAJAR */}
              {activeService.allowLearnPackage && (
                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-start gap-2.5 p-2.5 rounded border-2 border-black bg-neo-lime/20 cursor-pointer hover:bg-neo-lime/30 transition-all">
                    <input
                      type="checkbox"
                      checked={includeLearnPackage}
                      onChange={(e) => setIncludeLearnPackage(e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-neo-blue rounded border-black focus:ring-0 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-heading font-black text-black flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                        Tambah Paket &quot;Sekalian Belajar&quot; (+Rp25.000 – Rp50.000)
                      </span>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Dapatkan penjelasan alur logika kode, catatan per baris, dan panduan presentasi hingga siap sidang.
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: REAL-TIME SUMMARY PANEL (MINI INVOICE) (lg:col-span-5) */}
          <div className="lg:col-span-5">
            <div className="neo-box bg-white p-5 sm:p-6 shadow-neo-lg sticky top-20 border-2 border-black">
              
              {/* Invoice Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
                <div>
                  <span className="neo-tag bg-neo-lime text-black font-mono text-[9px] uppercase">
                    RINGKASAN SIMULASI
                  </span>
                  <h3 className="font-heading font-black text-base sm:text-lg text-black mt-1">
                    Invoice Estimasi Real-time
                  </h3>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-500">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                  <span>LIVE REAKTIF</span>
                </div>
              </div>

              {/* Service Line Item */}
              <div className="space-y-3 pb-4 mb-4 border-b border-dashed border-slate-300 text-xs sm:text-sm">
                <div>
                  <p className="font-heading font-black text-black text-sm sm:text-base">
                    {activeService.title}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Kategori: {CALCULATOR_CATEGORIES.find((c) => c.id === selectedCategory)?.name}
                  </p>
                  {calculationResult?.baseCalculationDetail && (
                    <p className="text-[11px] font-mono text-slate-700 font-bold mt-1 bg-slate-100 p-1.5 rounded border border-slate-200">
                      Rincian: {calculationResult.baseCalculationDetail}
                    </p>
                  )}
                </div>

                {/* Breakdown Items */}
                {!calculationResult?.isManualQuotation && !calculationResult?.isInvalidDeadline ? (
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Harga Dasar Pekerjaan:</span>
                      <span className="font-mono font-bold text-black">
                        {formatRupiah(calculationResult?.baseMinPrice || 0)} – {formatRupiah(calculationResult?.baseMaxPrice || 0)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span>Biaya Prioritas Deadline:</span>
                      <span className="font-mono font-bold text-amber-700">
                        {calculationResult?.deadlineSurchargePercent
                          ? `+${calculationResult.deadlineSurchargePercent}% (+${formatRupiah(Math.round((calculationResult.baseMinPrice * calculationResult.deadlineSurchargePercent) / 100))})`
                          : "0% (Normal)"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span>Layanan di Luar Jam Reguler:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {calculationResult?.afterHoursSurchargePercent
                          ? `+${calculationResult.afterHoursSurchargePercent}% (+${formatRupiah(Math.round((calculationResult.baseMinPrice * calculationResult.afterHoursSurchargePercent) / 100))})`
                          : "0% (Reguler)"}
                      </span>
                    </div>

                    {includeLearnPackage && activeService.allowLearnPackage && (
                      <div className="flex items-center justify-between text-emerald-800">
                        <span>Paket Sekalian Belajar:</span>
                        <span className="font-mono font-bold">
                          +Rp25.000 – Rp50.000
                        </span>
                      </div>
                    )}
                  </div>
                ) : calculationResult?.isInvalidDeadline ? (
                  <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
                    <p className="font-bold">⚠️ Periksa Tanggal &amp; Waktu Deadline</p>
                    <p className="text-[11px] text-red-800 leading-relaxed">
                      Waktu tenggat yang dipilih telah terlewati. Mohon geser deadline ke jam atau tanggal yang akan datang.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                    <p className="font-bold">Manual Quotation Admin</p>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Layanan ini membutuhkan peninjauan brief khusus sebelum admin menetapkan penawaran harga resmi.
                    </p>
                  </div>
                )}
              </div>

              {/* Total Estimation Box */}
              <div className="p-3.5 bg-neo-yellow/30 border-2 border-black rounded mb-5">
                <span className="text-[10px] font-mono font-bold text-slate-700 uppercase block mb-1">
                  ESTIMASI TOTAL BIAYA:
                </span>
                <p className={`font-heading font-black text-xl sm:text-2xl ${calculationResult?.isInvalidDeadline ? "text-red-600" : "text-neo-blue"}`}>
                  {calculationResult?.priceRangeFormatted || "Berdasarkan Konsultasi"}
                </p>
                <p className="text-[10px] text-slate-600 mt-1 leading-normal font-medium">
                  *Estimasi awal transparan berdasarkan volume pekerjaan &amp; deadline yang dipilih.
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={calculationResult?.isInvalidDeadline}
                  onClick={handleProceedToOrderForm}
                  className="w-full neo-btn-lime py-3 px-4 text-xs sm:text-sm font-black flex items-center justify-center gap-2 group cursor-pointer shadow-neo disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Lanjutkan ke Form Pesanan</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  disabled={calculationResult?.isInvalidDeadline}
                  onClick={handleWhatsAppConsultation}
                  className="w-full neo-btn-white py-2.5 px-4 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-neo-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Format Disalin &amp; Membuka WhatsApp...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                      <span>Konsultasi Langsung via WhatsApp</span>
                    </>
                  )}
                </button>
              </div>

              {/* Trust Badges in Mini Invoice */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  Anti-Ghosting
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                  Respon &lt; 5 Menit
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
