import {
  CalculatorServiceConfig,
  PriceCalculationResult,
  StartTimePreference,
} from "@/types";
import {
  calculateRemainingHours,
  calculateEffectiveStartTime,
  getDeadlineSurcharge,
  getAfterHoursSurcharge,
  formatJakartaDateTime,
} from "./priority-calculator";

export const CALCULATOR_CATEGORIES = [
  { id: "coding", name: "IT & Coding", badge: "HIGH-VALUE", icon: "Code2" },
  { id: "design", name: "Desain & UI/UX", badge: "TRENDING", icon: "Palette" },
  { id: "documents", name: "Dokumen & Akademik", badge: "FAST DELIVERY", icon: "FileText" },
  { id: "hardware", name: "IT Support & Servis", badge: "HARDWARE & OS", icon: "Wrench" },
] as const;

export const CALCULATOR_SERVICES: CalculatorServiceConfig[] = [
  // ---------------------------------------------------------------------------
  // A. Kategori IT, Coding & Data
  // ---------------------------------------------------------------------------
  {
    id: "algo-basic",
    categoryId: "coding",
    title: "Tugas Algoritma / Pemrograman Dasar",
    description: "Penyelesaian kasus C++, Java, atau Python dengan struktur data & OOP yang rapi.",
    pricingMethod: "per_unit",
    unitName: "Program / Studi Kasus",
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 10,
    minPrice: 50000,
    maxPrice: 150000,
    allowLearnPackage: true,
    estimatedDuration: "Est. 24 Jam",
    badgeLabel: "ALGORITMA",
  },
  {
    id: "database-erd",
    categoryId: "coding",
    title: "Database: ERD + Normalisasi + SQL",
    description: "Perancangan skema relasional, normalisasi 1NF-3NF, dan query JOIN SQL kompleks.",
    pricingMethod: "complexity_range",
    unitName: "Tabel (Kompleksitas)",
    defaultQuantity: 5,
    minQuantity: 1,
    maxQuantity: 25,
    minPrice: 75000,
    maxPrice: 250000,
    allowLearnPackage: true,
    estimatedDuration: "Est. 1–2 Hari",
    badgeLabel: "DATABASE",
    packageNote: "Jumlah tabel menjadi parameter evaluasi kompleksitas normalisasi dan relasi.",
    infoParams: [
      { label: "Catatan Relasi / Kasus", placeholder: "Misal: Sistem klinik gigi, 8 tabel, SQL JOIN & SP", defaultValue: "Sistem Transaksi Database" },
    ],
  },
  {
    id: "web-landing",
    categoryId: "coding",
    title: "Web Sederhana (3–5 Halaman, CRUD)",
    description: "Website responsif, mobile-friendly, clean semantic code, siap online.",
    pricingMethod: "complexity_range",
    unitName: "Halaman Web",
    defaultQuantity: 3,
    minQuantity: 1,
    maxQuantity: 10,
    minPrice: 150000,
    maxPrice: 450000,
    allowLearnPackage: true,
    estimatedDuration: "Est. 1–3 Hari",
    badgeLabel: "WEB DEV",
    packageNote: "Cakupan acuan: 3–5 halaman responsif dengan operasi CRUD standar.",
    infoParams: [
      { label: "Fitur / Scope Halaman", placeholder: "Misal: 3–5 halaman landing page / CRUD standar", defaultValue: "Paket 3–5 Halaman" },
    ],
  },
  {
    id: "web-crud",
    categoryId: "coding",
    title: "Web Menengah / Sistem Informasi Lengkap",
    description: "Sistem aplikasi web multi-role (Admin/User), database relasional, dan cetak laporan PDF/Excel.",
    pricingMethod: "complexity_range",
    unitName: "Role & Modul",
    defaultQuantity: 2,
    minQuantity: 1,
    maxQuantity: 10,
    minPrice: 500000,
    maxPrice: 1500000,
    allowLearnPackage: true,
    estimatedDuration: "Est. 3–7 Hari",
    badgeLabel: "SISTEM INFORMASI",
    packageNote: "Harga menyesuaikan kompleksitas modul, otorisasi multi-role, dan fitur cetak laporan.",
    infoParams: [
      { label: "Jumlah Role & Fitur Utama", placeholder: "Misal: 2 role + dashboard grafik + export PDF", defaultValue: "Multi-role + Export PDF" },
    ],
  },
  {
    id: "software-testing",
    categoryId: "coding",
    title: "Dokumen Software Testing & QA",
    description: "Penyusunan test case, matriks pengujian Blackbox, dan laporan bug reproduktif.",
    pricingMethod: "complexity_range",
    unitName: "Modul Uji",
    defaultQuantity: 3,
    minQuantity: 1,
    maxQuantity: 15,
    minPrice: 75000,
    maxPrice: 200000,
    allowLearnPackage: true,
    estimatedDuration: "Est. 1–2 Hari",
    badgeLabel: "TESTING / QA",
    packageNote: "Harga bergantung pada jumlah modul dan skenario pengujian yang diuji.",
    infoParams: [
      { label: "Fitur yang Diuji", placeholder: "Misal: Modul auth, checkout, dan laporan", defaultValue: "3 Modul Utama" },
    ],
  },

  // ---------------------------------------------------------------------------
  // B. Kategori Desain & Kreatif
  // ---------------------------------------------------------------------------
  {
    id: "design-poster-feed",
    categoryId: "design",
    title: "Poster / Infografis / Feed Instagram",
    description: "Desain visual tajam resolusi tinggi untuk event akademik, ormawa, atau media sosial bisnis.",
    pricingMethod: "per_unit",
    unitName: "Desain / Carousel",
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 20,
    minPrice: 35000,
    maxPrice: 100000,
    allowLearnPackage: false,
    estimatedDuration: "Est. 24 Jam",
    badgeLabel: "DESAIN GRAFIS",
  },
  {
    id: "design-presentation",
    categoryId: "design",
    title: "Slide Presentasi PPT / Canva",
    description: "Slide presentasi berkonsep modern, tipografi rapi, visualisasi data, siap untuk sidang/pitching.",
    pricingMethod: "per_package",
    unitName: "Slide",
    defaultQuantity: 10,
    minQuantity: 1,
    maxQuantity: 50,
    minPrice: 35000,
    maxPrice: 100000,
    packageLimit: 15,
    basePackageQuantity: 15,
    extraUnitPriceMin: 3000,
    extraUnitPriceMax: 5000,
    packageNote: "Paket standar mencakup 10–15 slide (Rp35k–Rp100k). Slide ekstra >15 dihitung +Rp3.000–Rp5.000/slide.",
    allowLearnPackage: false,
    estimatedDuration: "Est. 24–48 Jam",
    badgeLabel: "PRESENTASI",
  },
  {
    id: "design-ui-ux",
    categoryId: "design",
    title: "UI/UX Design Figma",
    description: "High-fidelity screen, user flow terstruktur, design system konsisten, dan clickable prototype.",
    pricingMethod: "per_unit",
    unitName: "Screen / Halaman",
    defaultQuantity: 3,
    minQuantity: 1,
    maxQuantity: 30,
    minPrice: 25000,
    maxPrice: 60000,
    allowLearnPackage: false,
    estimatedDuration: "Est. 1–3 Hari",
    badgeLabel: "UI/UX FIGMA",
  },
  {
    id: "design-logo",
    categoryId: "design",
    title: "Branding & Logo + Filosofi",
    description: "Pembuatan logo profesional, 2 opsi konsep visual, panduan warna & font, plus file master vector.",
    pricingMethod: "complexity_range",
    unitName: "Paket Konsep",
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 3,
    minPrice: 100000,
    maxPrice: 350000,
    allowLearnPackage: false,
    estimatedDuration: "Est. 2–3 Hari",
    badgeLabel: "BRANDING",
    packageNote: "Termasuk 2 opsi konsep visual alternatif dan file master vector .AI / .SVG.",
  },

  // ---------------------------------------------------------------------------
  // C. Kategori Dokumen & Akademik
  // ---------------------------------------------------------------------------
  {
    id: "doc-paper",
    categoryId: "documents",
    title: "Makalah / Esai / Laporan Praktikum",
    description: "Penulisan dan perapihan dokumen akademik dengan sitasi ilmiah valid dan bebas plagiasi.",
    pricingMethod: "per_document",
    unitName: "Halaman",
    defaultQuantity: 10,
    minQuantity: 1,
    maxQuantity: 100,
    minPrice: 40000,
    maxPrice: 75000, // Paket dasar 1-10 halaman
    basePackageQuantity: 10,
    extraUnitPriceMin: 3500, // +Rp3.500 / halaman ekstra > 10
    extraUnitPriceMax: 5000, // +Rp5.000 / halaman ekstra > 10
    hasReferencesInput: true,
    defaultReferences: 5,
    maxReferences: 30,
    baseIncludedReferences: 5,
    extraReferencePrice: 2500, // +Rp2.500 / referensi jurnal ekstra > 5
    allowLearnPackage: true,
    estimatedDuration: "Est. 1–2 Hari",
    badgeLabel: "AKADEMIK",
    packageNote: "Paket dasar mencakup 1–10 halaman & 5 referensi jurnal. Halaman ekstra +Rp3.5k–Rp5k/hal. Referensi ekstra +Rp2.5k/jurnal.",
  },
  {
    id: "doc-summary",
    categoryId: "documents",
    title: "Rangkuman Materi / Cheat Sheet",
    description: "Ringkasan poin penting kuliah, mind map, dan catatan praktis per bab materi.",
    pricingMethod: "per_unit",
    unitName: "Bab / Pertemuan",
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 10,
    minPrice: 25000,
    maxPrice: 50000,
    allowLearnPackage: true,
    estimatedDuration: "Est. 24 Jam",
    badgeLabel: "RANGKUMAN",
  },
  {
    id: "doc-formatting",
    categoryId: "documents",
    title: "Formatting Word & Sitasi",
    description: "Perapihan margin bab kampus (4-4-3-3), daftar isi/tabel otomatis, dan sinkronisasi Mendeley/Zotero.",
    pricingMethod: "per_unit",
    unitName: "Dokumen",
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 5,
    minPrice: 30000,
    maxPrice: 80000,
    allowLearnPackage: true,
    estimatedDuration: "Est. 24 Jam",
    badgeLabel: "FORMATTING",
    infoParams: [
      { label: "Cakupan Pekerjaan", placeholder: "Daftar isi, margin, sitasi", defaultValue: "Daftar Isi + Mendeley" },
    ],
  },
  {
    id: "doc-excel",
    categoryId: "documents",
    title: "Olah Data Lanjutan Microsoft Excel",
    description: "Pengolahan formula kompleks, VLOOKUP/XLOOKUP, Pivot Table, conditional formatting, dan dashboard.",
    pricingMethod: "manual_quotation",
    minPrice: 0,
    maxPrice: 0,
    allowLearnPackage: true,
    estimatedDuration: "Est. 1–2 Hari",
    badgeLabel: "EXCEL DATA",
    packageNote: "Harga berdasarkan konsultasi sesuai jumlah baris data dan kerumitan formula.",
    infoParams: [
      { label: "Kebutuhan Rumus / Fitur", placeholder: "Misal: Pivot Table + VLOOKUP 500 baris", defaultValue: "Pivot + Rumus" },
    ],
  },
  {
    id: "doc-translation",
    categoryId: "documents",
    title: "Translasi Jurnal (Inggris - Indonesia)",
    description: "Penerjemahan teks ilmiah bidang teknik, medis, atau sosial dengan gaya bahasa baku dan akurat.",
    pricingMethod: "manual_quotation",
    minPrice: 0,
    maxPrice: 0,
    allowLearnPackage: false,
    estimatedDuration: "Est. 1–3 Hari",
    badgeLabel: "TRANSLASI",
    packageNote: "Harga berdasarkan konsultasi sesuai jumlah kata dan terminologi bidang studi.",
    infoParams: [
      { label: "Estimasi Halaman / Kata", placeholder: "Misal: Abstrak atau 5 halaman jurnal", defaultValue: "Abstrak / Bab" },
    ],
  },

  // ---------------------------------------------------------------------------
  // D. Kategori IT Support & Perawatan Perangkat
  // ---------------------------------------------------------------------------
  {
    id: "hw-os-basic",
    categoryId: "hardware",
    title: "Instalasi OS Basic (Windows / Linux)",
    description: "Instalasi sistem operasi bersih tanpa bloatware, driver lengkap terupdate, dan siap pakai.",
    pricingMethod: "per_unit",
    unitName: "Perangkat",
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 5,
    minPrice: 75000,
    maxPrice: 100000,
    allowLearnPackage: false,
    estimatedDuration: "Est. 1 Hari",
    badgeLabel: "OS BASIC",
  },
  {
    id: "hw-os-full",
    categoryId: "hardware",
    title: "Instalasi OS Full Package",
    description: "OS original bersih + driver lengkap + paket aplikasi kuliah (Office, PDF, Browser, Zip).",
    pricingMethod: "per_unit",
    unitName: "Perangkat",
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 5,
    minPrice: 100000,
    maxPrice: 150000,
    allowLearnPackage: false,
    estimatedDuration: "Est. 1 Hari",
    badgeLabel: "OS FULL",
  },
  {
    id: "hw-upgrade",
    categoryId: "hardware",
    title: "Upgrade Hardware RAM / SSD / HDD",
    description: "Jasa bongkar pasang komponen baru, kloning partisi OS, dan pengujian kestabilan perangkat.",
    pricingMethod: "per_unit",
    unitName: "Perangkat",
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 5,
    minPrice: 50000,
    maxPrice: 100000,
    allowLearnPackage: false,
    estimatedDuration: "Est. 1 Hari",
    badgeLabel: "UPGRADE HW",
    packageNote: "Hanya biaya jasa bongkar pasang. Komponen hardware/SSD disediakan klien atau dibeli terpisah.",
  },
  {
    id: "hw-cleaning",
    categoryId: "hardware",
    title: "Cleaning Fan + Repaste Thermal Paste",
    description: "Pembersihan total debu kipas heatsink dan penggantian pasta termal berkualitas untuk atasi laptop panas.",
    pricingMethod: "per_unit",
    unitName: "Perangkat",
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 5,
    minPrice: 75000,
    maxPrice: 150000,
    allowLearnPackage: false,
    estimatedDuration: "Est. 2–4 Jam",
    badgeLabel: "CLEANING",
    packageNote: "Biaya menyesuaikan kompleksitas bongkar body laptop (regular vs slim/gaming).",
  },
  {
    id: "hw-troubleshoot",
    categoryId: "hardware",
    title: "Troubleshooting / Cek Kerusakan Laptop",
    description: "Diagnosa menyeluruh kerusakan hardware atau software (BSOD, gagal boot, mati daya).",
    pricingMethod: "complexity_range",
    unitName: "Pemeriksaan Perangkat",
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 3,
    minPrice: 25000,
    maxPrice: 50000,
    allowLearnPackage: false,
    estimatedDuration: "Est. 1 Hari",
    badgeLabel: "DIAGNOSA",
    packageNote: "Biaya jasa pengecekan & diagnosa masalah.",
    infoParams: [
      { label: "Gejala Kendala Laptop", placeholder: "Misal: Blue screen saat buka browser", defaultValue: "BSOD / Overheat" },
    ],
  },
];

export interface CalculateInteractivePriceParams {
  service: CalculatorServiceConfig;
  quantity?: number;
  referencesCount?: number;
  deadline: Date | string;
  startTimePreference?: StartTimePreference;
  requestedStartTime?: Date | string | null;
  includeLearnPackage?: boolean;
  referenceNow?: Date;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculates interactive price simulation based on service pricing method,
 * quantity, references, deadline surcharge, after-hours surcharge, and optional learn package.
 * Pure function: deterministic, reactive, zero side-effects.
 */
export function calculateInteractivePrice({
  service,
  quantity = 1,
  referencesCount = 0,
  deadline,
  startTimePreference = "asap",
  requestedStartTime = null,
  includeLearnPackage = false,
  referenceNow = new Date(),
}: CalculateInteractivePriceParams): PriceCalculationResult {
  // If manual quotation is required (e.g. translation, excel custom)
  if (service.pricingMethod === "manual_quotation") {
    return {
      isManualQuotation: true,
      isInvalidDeadline: false,
      baseMinPrice: 0,
      baseMaxPrice: 0,
      surchargePercent: 0,
      deadlineSurchargePercent: 0,
      afterHoursSurchargePercent: 0,
      surchargeMinAmount: 0,
      surchargeMaxAmount: 0,
      learnPackageMinAmount: 0,
      learnPackageMaxAmount: 0,
      totalMinPrice: 0,
      totalMaxPrice: 0,
      requiresAdminApproval: false,
      isOutsidePackage: false,
      packageWarning: undefined,
      priceRangeFormatted: "Harga berdasarkan konsultasi",
      deadlineTierLabel: "Menyesuaikan Kebutuhan",
      afterHoursTierLabel: "Menyesuaikan Waktu Pengerjaan",
      effectiveHoursRemaining: 0,
      baseCalculationDetail: "Manual Quotation Admin",
    };
  }

  // 1. Calculate Effective Start Time and Real Working Duration
  const effectiveStartTime = calculateEffectiveStartTime(
    startTimePreference,
    requestedStartTime,
    referenceNow
  );
  const hoursRemaining = calculateRemainingHours(deadline, effectiveStartTime);

  // 2. Evaluate Deadline Surcharge
  const deadlineResult = getDeadlineSurcharge(hoursRemaining);

  // If deadline is invalid (e.g. past deadline or negative hours)
  if (deadlineResult.isInvalid) {
    return {
      isManualQuotation: false,
      isInvalidDeadline: true,
      baseMinPrice: 0,
      baseMaxPrice: 0,
      surchargePercent: 0,
      deadlineSurchargePercent: 0,
      afterHoursSurchargePercent: 0,
      surchargeMinAmount: 0,
      surchargeMaxAmount: 0,
      learnPackageMinAmount: 0,
      learnPackageMaxAmount: 0,
      totalMinPrice: 0,
      totalMaxPrice: 0,
      requiresAdminApproval: false,
      isOutsidePackage: false,
      packageWarning: "Tenggat waktu harus berada setelah waktu mulai pengerjaan.",
      priceRangeFormatted: "Deadline Tidak Valid",
      deadlineTierLabel: deadlineResult.tierLabel,
      afterHoursTierLabel: "0%",
      effectiveHoursRemaining: hoursRemaining,
      effectiveStartTimeFormatted: formatJakartaDateTime(effectiveStartTime),
    };
  }

  // 3. Evaluate After-Hours Surcharge (applied based on effective start time)
  const afterHoursResult = getAfterHoursSurcharge(
    startTimePreference,
    effectiveStartTime,
    referenceNow
  );

  const safeQty = Math.max(1, quantity);
  let baseMin = 0;
  let baseMax = 0;
  let isOutsidePackage = false;
  let packageWarning: string | undefined = undefined;
  let baseCalculationDetail: string | undefined = undefined;

  // 4. Base Price Calculation based on Method & Approved Formulas
  switch (service.pricingMethod) {
    case "per_document": {
      // Makalah / Esai / Laporan: Base package (1-10 hal) + Extra pages + Extra references
      const basePackageLimit = service.basePackageQuantity || 10;
      baseMin = service.minPrice; // Rp40.000
      baseMax = service.maxPrice; // Rp75.000

      let extraPageText = "";
      if (safeQty > basePackageLimit) {
        const extraPages = safeQty - basePackageLimit;
        const extraMin = extraPages * (service.extraUnitPriceMin || 3500);
        const extraMax = extraPages * (service.extraUnitPriceMax || 5000);
        baseMin += extraMin;
        baseMax += extraMax;
        extraPageText = ` + ${extraPages} hal ekstra`;
      }

      let extraRefText = "";
      const safeRefs = Math.max(0, referencesCount);
      const includedRefs = service.baseIncludedReferences || 5;
      if (safeRefs > includedRefs) {
        const extraRefs = safeRefs - includedRefs;
        const refCost = extraRefs * (service.extraReferencePrice || 2500);
        baseMin += refCost;
        baseMax += refCost;
        extraRefText = ` + ${extraRefs} jurnal ekstra`;
      }

      baseCalculationDetail = `${safeQty} Halaman${safeRefs > 0 ? ` (${safeRefs} Referensi)` : ""}${extraPageText}${extraRefText}`;
      break;
    }

    case "per_package": {
      // Presentation Slides: Base package (1-15 slides) + Extra slides beyond 15
      const packageLimit = service.packageLimit || 15;
      baseMin = service.minPrice; // Rp35.000
      baseMax = service.maxPrice; // Rp100.000

      if (safeQty > packageLimit) {
        const extraSlides = safeQty - packageLimit;
        const extraMin = extraSlides * (service.extraUnitPriceMin || 3000);
        const extraMax = extraSlides * (service.extraUnitPriceMax || 5000);
        baseMin += extraMin;
        baseMax += extraMax;
        isOutsidePackage = true;
        packageWarning = `Paket standar mencakup 10–15 slide. ${extraSlides} slide ekstra dihitung +Rp3k–Rp5k/slide.`;
        baseCalculationDetail = `15 Slide Dasar + ${extraSlides} Slide Ekstra`;
      } else {
        baseCalculationDetail = `${safeQty} Slide (Dalam Paket 10–15 Slide)`;
      }
      break;
    }

    case "per_unit": {
      baseMin = service.minPrice * safeQty;
      baseMax = service.maxPrice * safeQty;
      baseCalculationDetail = `${safeQty} ${service.unitName || "unit"} × ${formatRupiah(service.minPrice)}–${formatRupiah(service.maxPrice)}`;
      break;
    }

    case "complexity_range":
    default: {
      baseMin = service.minPrice;
      baseMax = service.maxPrice;
      baseCalculationDetail = `Rentang Proyek: ${formatRupiah(service.minPrice)}–${formatRupiah(service.maxPrice)}`;
      break;
    }
  }

  // 5. Combined Surcharge & 25% Regular Cap
  const rawSurchargePercent = deadlineResult.percent + afterHoursResult.percent;
  const surchargePercent = Math.min(25, rawSurchargePercent);

  const surchargeMinAmount = Math.round(baseMin * (surchargePercent / 100));
  const surchargeMaxAmount = Math.round(baseMax * (surchargePercent / 100));

  // 6. Optional Learn Package (Sekalian Belajar)
  let learnPackageMinAmount = 0;
  let learnPackageMaxAmount = 0;
  if (includeLearnPackage && service.allowLearnPackage) {
    learnPackageMinAmount = 25000;
    learnPackageMaxAmount = 50000;
  }

  // 7. Final Estimated Range
  const totalMinPrice = baseMin + surchargeMinAmount + learnPackageMinAmount;
  const totalMaxPrice = baseMax + surchargeMaxAmount + learnPackageMaxAmount;

  const priceRangeFormatted =
    totalMinPrice === totalMaxPrice
      ? formatRupiah(totalMinPrice)
      : `${formatRupiah(totalMinPrice)} – ${formatRupiah(totalMaxPrice)}`;

  return {
    isManualQuotation: false,
    isInvalidDeadline: false,
    baseMinPrice: baseMin,
    baseMaxPrice: baseMax,
    surchargePercent,
    deadlineSurchargePercent: deadlineResult.percent,
    afterHoursSurchargePercent: afterHoursResult.percent,
    surchargeMinAmount,
    surchargeMaxAmount,
    learnPackageMinAmount,
    learnPackageMaxAmount,
    totalMinPrice,
    totalMaxPrice,
    requiresAdminApproval: deadlineResult.requiresAdminApproval,
    isOutsidePackage,
    packageWarning,
    priceRangeFormatted,
    deadlineTierLabel: deadlineResult.tierLabel,
    afterHoursTierLabel: afterHoursResult.tierLabel,
    effectiveHoursRemaining: hoursRemaining,
    effectiveStartTimeFormatted: formatJakartaDateTime(effectiveStartTime),
    baseCalculationDetail,
  };
}
