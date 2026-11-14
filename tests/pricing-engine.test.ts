import { describe, it, expect } from "vitest";
import {
  CALCULATOR_SERVICES,
  calculateInteractivePrice,
  formatRupiah,
} from "@/lib/pricing/pricing-engine";
import {
  buildWhatsAppUrl,
  generateCalculatorWhatsAppMessage,
} from "@/lib/whatsapp";
import {
  calculateEffectiveStartTime,
  getJakartaHour,
} from "@/lib/pricing/priority-calculator";

describe("MODUL F: Interactive Price Calculator & Reactive Pricing Engine", () => {
  const getService = (id: string) => {
    const srv = CALCULATOR_SERVICES.find((s) => s.id === id);
    if (!srv) throw new Error(`Service ${id} not found`);
    return srv;
  };

  describe("1. Unit Multiplier Calculations (per_unit)", () => {
    it("TC-CALC-01: UI/UX Design multiplies min and max price by screen count", () => {
      const service = getService("design-ui-ux");
      const refNow = new Date("2026-11-14T03:00:00Z"); // 10:00 WIB
      const deadline = new Date("2026-11-16T03:00:00Z"); // 48h (0% surcharge)

      // 1 Screen: 25k - 60k
      const res1 = calculateInteractivePrice({
        service,
        quantity: 1,
        deadline,
        referenceNow: refNow,
      });
      expect(res1.baseMinPrice).toBe(25000);
      expect(res1.baseMaxPrice).toBe(60000);
      expect(res1.totalMinPrice).toBe(25000);
      expect(res1.totalMaxPrice).toBe(60000);

      // 3 Screens: 75k - 180k
      const res3 = calculateInteractivePrice({
        service,
        quantity: 3,
        deadline,
        referenceNow: refNow,
      });
      expect(res3.baseMinPrice).toBe(75000);
      expect(res3.baseMaxPrice).toBe(180000);
      expect(res3.totalMinPrice).toBe(75000);
      expect(res3.totalMaxPrice).toBe(180000);

      // 5 Screens: 125k - 300k
      const res5 = calculateInteractivePrice({
        service,
        quantity: 5,
        deadline,
        referenceNow: refNow,
      });
      expect(res5.baseMinPrice).toBe(125000);
      expect(res5.baseMaxPrice).toBe(300000);
    });

    it("TC-CALC-02: Tugas Algoritma multiplies by program/case count", () => {
      const service = getService("algo-basic");
      const refNow = new Date("2026-11-14T03:00:00Z");
      const deadline = new Date("2026-11-16T03:00:00Z");

      const res1 = calculateInteractivePrice({
        service,
        quantity: 1,
        deadline,
        referenceNow: refNow,
      });
      expect(res1.baseMinPrice).toBe(50000);
      expect(res1.baseMaxPrice).toBe(150000);

      const res2 = calculateInteractivePrice({
        service,
        quantity: 2,
        deadline,
        referenceNow: refNow,
      });
      expect(res2.baseMinPrice).toBe(100000);
      expect(res2.baseMaxPrice).toBe(300000);
    });

    it("TC-CALC-03: Desain Poster & Feed multiplies by design count", () => {
      const service = getService("design-poster-feed");
      const refNow = new Date("2026-11-14T03:00:00Z");
      const deadline = new Date("2026-11-16T03:00:00Z");

      const res4 = calculateInteractivePrice({
        service,
        quantity: 4,
        deadline,
        referenceNow: refNow,
      });
      expect(res4.baseMinPrice).toBe(140000);
      expect(res4.baseMaxPrice).toBe(400000);
    });

    it("TC-CALC-04: IT Support Cleaning multiplies by device count", () => {
      const service = getService("hw-cleaning");
      const refNow = new Date("2026-11-14T03:00:00Z");
      const deadline = new Date("2026-11-16T03:00:00Z");

      const res2 = calculateInteractivePrice({
        service,
        quantity: 2,
        deadline,
        referenceNow: refNow,
      });
      expect(res2.baseMinPrice).toBe(150000);
      expect(res2.baseMaxPrice).toBe(300000);
    });
  });

  describe("2. Document & Academic Dynamic Pricing (Makalah, Pages & References)", () => {
    it("TC-CALC-05: Makalah within base package (1–10 pages, <= 5 refs) keeps base package price", () => {
      const service = getService("doc-paper");
      const refNow = new Date("2026-11-14T03:00:00Z");
      const deadline = new Date("2026-11-16T03:00:00Z");

      // 10 pages, 5 references -> Base package Rp40.000–Rp75.000
      const res10 = calculateInteractivePrice({
        service,
        quantity: 10,
        referencesCount: 5,
        deadline,
        referenceNow: refNow,
      });
      expect(res10.baseMinPrice).toBe(40000);
      expect(res10.baseMaxPrice).toBe(75000);
      expect(res10.totalMinPrice).toBe(40000);
      expect(res10.totalMaxPrice).toBe(75000);
    });

    it("TC-CALC-06: Makalah with 20 pages calculates +10 extra pages at Rp3.500–Rp5.000/page", () => {
      const service = getService("doc-paper");
      const refNow = new Date("2026-11-14T03:00:00Z");
      const deadline = new Date("2026-11-16T03:00:00Z");

      // 20 pages (10 base + 10 extra * 3.5k–5k = +35k–50k) -> Rp75.000–Rp125.000
      const res20 = calculateInteractivePrice({
        service,
        quantity: 20,
        referencesCount: 5,
        deadline,
        referenceNow: refNow,
      });
      expect(res20.baseMinPrice).toBe(75000);
      expect(res20.baseMaxPrice).toBe(125000);
    });

    it("TC-CALC-07: Makalah with 100 pages scales dynamically without freezing", () => {
      const service = getService("doc-paper");
      const refNow = new Date("2026-11-14T03:00:00Z");
      const deadline = new Date("2026-11-16T03:00:00Z");

      // 100 pages (10 base + 90 extra * 3.5k–5k = +315k–450k) -> Rp355.000–Rp525.000
      const res100 = calculateInteractivePrice({
        service,
        quantity: 100,
        referencesCount: 5,
        deadline,
        referenceNow: refNow,
      });
      expect(res100.baseMinPrice).toBe(355000);
      expect(res100.baseMaxPrice).toBe(525000);
    });

    it("TC-CALC-08: Makalah adds Rp2.500 per extra reference beyond 5 journals", () => {
      const service = getService("doc-paper");
      const refNow = new Date("2026-11-14T03:00:00Z");
      const deadline = new Date("2026-11-16T03:00:00Z");

      // 10 pages + 10 references (5 extra refs * 2.5k = +12.5k)
      // Min: 40k + 12.5k = 52.5k, Max: 75k + 12.5k = 87.5k
      const resRefs = calculateInteractivePrice({
        service,
        quantity: 10,
        referencesCount: 10,
        deadline,
        referenceNow: refNow,
      });
      expect(resRefs.baseMinPrice).toBe(52500);
      expect(resRefs.baseMaxPrice).toBe(87500);
    });
  });

  describe("3. Slide Presentation Dynamic Pricing (per_package + extra slides)", () => {
    it("TC-CALC-09: Slide Presentasi within 10-15 slides keeps standard package price", () => {
      const service = getService("design-presentation");
      const refNow = new Date("2026-11-14T03:00:00Z");
      const deadline = new Date("2026-11-16T03:00:00Z");

      const res10 = calculateInteractivePrice({
        service,
        quantity: 10,
        deadline,
        referenceNow: refNow,
      });
      expect(res10.baseMinPrice).toBe(35000);
      expect(res10.baseMaxPrice).toBe(100000);
      expect(res10.isOutsidePackage).toBe(false);

      const res15 = calculateInteractivePrice({
        service,
        quantity: 15,
        deadline,
        referenceNow: refNow,
      });
      expect(res15.baseMinPrice).toBe(35000);
      expect(res15.baseMaxPrice).toBe(100000);
      expect(res15.isOutsidePackage).toBe(false);
    });

    it("TC-CALC-10: Slide Presentasi > 15 slides adds +Rp3.000–Rp5.000 per extra slide", () => {
      const service = getService("design-presentation");
      const refNow = new Date("2026-11-14T03:00:00Z");
      const deadline = new Date("2026-11-16T03:00:00Z");

      // 20 slides: 15 base + 5 extra * (3k–5k) = (+15k–25k) -> Rp50.000–Rp125.000
      const res20 = calculateInteractivePrice({
        service,
        quantity: 20,
        deadline,
        referenceNow: refNow,
      });
      expect(res20.isOutsidePackage).toBe(true);
      expect(res20.baseMinPrice).toBe(50000);
      expect(res20.baseMaxPrice).toBe(125000);
    });
  });

  describe("4. Effective Start Time & Real Working Window Calculation", () => {
    it("TC-CALC-11: Regular hours start time adjusts to next 06:00 WIB if scheduled at 03:00 WIB", () => {
      const refNow = new Date("2026-11-13T20:00:00Z"); // 03:00 WIB
      expect(getJakartaHour(refNow)).toBe(3);

      const effectiveStart = calculateEffectiveStartTime("regular_hours", null, refNow);
      expect(getJakartaHour(effectiveStart)).toBe(6);
    });

    it("TC-CALC-12: Specific start time evaluates deadline relative to scheduled start, not right now", () => {
      const service = getService("design-ui-ux");
      const refNow = new Date("2026-11-14T01:00:00Z"); // 08:00 WIB

      // Scheduled to start tomorrow at 10:00 WIB
      const tomorrowStart = new Date("2026-11-15T03:00:00Z"); // 10:00 WIB
      // Deadline set 2.5 hours after start (12:30 WIB) -> Mendesak +20%
      const deadline = new Date(tomorrowStart.getTime() + 2.5 * 3600 * 1000);

      const res = calculateInteractivePrice({
        service,
        quantity: 1, // 25k - 60k
        deadline,
        startTimePreference: "specific_time",
        requestedStartTime: tomorrowStart,
        referenceNow: refNow,
      });

      expect(res.effectiveHoursRemaining).toBe(2.5);
      expect(res.deadlineSurchargePercent).toBe(20);
      // 25k + 20% = 30k, 60k + 20% = 72k
      expect(res.totalMinPrice).toBe(30000);
      expect(res.totalMaxPrice).toBe(72000);
    });

    it("TC-CALC-13: Invalid deadline (before start time) flags isInvalidDeadline", () => {
      const service = getService("algo-basic");
      const refNow = new Date("2026-11-14T03:00:00Z");
      // Deadline 2 hours BEFORE now
      const pastDeadline = new Date(refNow.getTime() - 2 * 3600 * 1000);

      const res = calculateInteractivePrice({
        service,
        deadline: pastDeadline,
        referenceNow: refNow,
      });

      expect(res.isInvalidDeadline).toBe(true);
      expect(res.totalMinPrice).toBe(0);
      expect(res.totalMaxPrice).toBe(0);
      expect(res.priceRangeFormatted).toBe("Deadline Tidak Valid");
    });
  });

  describe("5. Surcharges & 25% Surcharge Cap", () => {
    it("TC-CALC-14: Emergency < 2h applies +25% and flags admin verification", () => {
      const service = getService("algo-basic");
      const refNow = new Date("2026-11-14T03:00:00Z");
      const deadline = new Date(refNow.getTime() + 1.5 * 3600 * 1000);

      const res = calculateInteractivePrice({
        service,
        quantity: 1, // 50k - 150k
        deadline,
        startTimePreference: "regular_hours",
        referenceNow: refNow,
      });

      expect(res.deadlineSurchargePercent).toBe(25);
      expect(res.requiresAdminApproval).toBe(true);
      expect(res.totalMinPrice).toBe(62500);
      expect(res.totalMaxPrice).toBe(187500);
    });

    it("TC-CALC-15: Combined surcharges capped at strictly 25%", () => {
      const service = getService("algo-basic");
      const refNow = new Date("2026-11-13T20:00:00Z"); // 03:00 WIB (after hours +10%)
      const deadline = new Date(refNow.getTime() + 2.5 * 3600 * 1000); // 2.5h (+20%)

      const res = calculateInteractivePrice({
        service,
        quantity: 1,
        deadline,
        startTimePreference: "asap",
        referenceNow: refNow,
      });

      // 20% deadline + 10% after hours = 30% -> CAPPED AT 25%
      expect(res.deadlineSurchargePercent).toBe(20);
      expect(res.afterHoursSurchargePercent).toBe(10);
      expect(res.surchargePercent).toBe(25);
      expect(res.totalMinPrice).toBe(62500);
    });
  });

  describe("6. Optional Learn Package (Sekalian Belajar)", () => {
    it("TC-CALC-16: Adds Rp25.000 to min and Rp50.000 to max on eligible services", () => {
      const service = getService("algo-basic");
      const refNow = new Date("2026-11-14T03:00:00Z");
      const deadline = new Date("2026-11-16T03:00:00Z");

      const withoutLearn = calculateInteractivePrice({
        service,
        quantity: 1,
        deadline,
        includeLearnPackage: false,
        referenceNow: refNow,
      });

      const withLearn = calculateInteractivePrice({
        service,
        quantity: 1,
        deadline,
        includeLearnPackage: true,
        referenceNow: refNow,
      });

      expect(withLearn.totalMinPrice).toBe(withoutLearn.totalMinPrice + 25000);
      expect(withLearn.totalMaxPrice).toBe(withoutLearn.totalMaxPrice + 50000);
    });
  });

  describe("7. Manual Quotation Services", () => {
    it("TC-CALC-17: Translasi Jurnal and Olah Data Excel return manual quotation status", () => {
      const translation = getService("doc-translation");
      const excel = getService("doc-excel");
      const refNow = new Date("2026-11-14T03:00:00Z");
      const deadline = new Date("2026-11-16T03:00:00Z");

      const resTrans = calculateInteractivePrice({
        service: translation,
        deadline,
        referenceNow: refNow,
      });
      expect(resTrans.isManualQuotation).toBe(true);
      expect(resTrans.priceRangeFormatted).toBe("Harga berdasarkan konsultasi");

      const resExcel = calculateInteractivePrice({
        service: excel,
        deadline,
        referenceNow: refNow,
      });
      expect(resExcel.isManualQuotation).toBe(true);
      expect(resExcel.priceRangeFormatted).toBe("Harga berdasarkan konsultasi");
    });
  });

  describe("8. WhatsApp Message Generation", () => {
    it("TC-CALC-18: Generates message with quantity, references, and price estimate", () => {
      const msg = generateCalculatorWhatsAppMessage({
        categoryName: "Dokumen & Akademik",
        serviceTitle: "Makalah / Esai / Laporan Praktikum",
        quantity: 20,
        unitName: "Halaman",
        referencesCount: 10,
        deadlineFormatted: "16 Nov 2026, 14.00 WIB",
        startTimeLabel: "Jam Kerja Reguler (06.00–22.00 WIB)",
        priceEstimateText: "Rp87.500 – Rp137.500",
        surchargeSummaryText: "0% (Reguler / Normal)",
        includeLearnPackage: true,
      });

      expect(msg).toContain("Makalah / Esai / Laporan Praktikum");
      expect(msg).toContain("20 Halaman");
      expect(msg).toContain("10 Jurnal Ilmiah");
      expect(msg).toContain("Rp87.500 – Rp137.500");
    });

    it("TC-CALC-19: buildWhatsAppUrl produces valid wa.me URL with clean digits", () => {
      const url = buildWhatsAppUrl("Halo Bantuiin");
      expect(url).toMatch(/^https:\/\/wa\.me\/[0-9]+\?text=Halo%20Bantuiin/);
    });
  });
});
