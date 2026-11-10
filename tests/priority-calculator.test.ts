import { describe, it, expect } from "vitest";
import {
  calculateRemainingHours,
  getDeadlineSurcharge,
  getAfterHoursSurcharge,
  calculateOrderPricing,
  getJakartaHour,
} from "@/lib/pricing/priority-calculator";

describe("MODUL A: Priority & After-Hours Calculation Engine", () => {
  describe("1. Remaining Hours Calculation", () => {
    it("should calculate exact remaining hours between two dates", () => {
      const now = new Date("2026-11-10T10:00:00Z");
      const deadline = new Date("2026-11-10T14:30:00Z");
      const hours = calculateRemainingHours(deadline, now);
      expect(hours).toBe(4.5);
    });

    it("should handle ISO string deadlines correctly", () => {
      const now = new Date("2026-11-10T00:00:00Z");
      const hours = calculateRemainingHours("2026-11-10T02:00:00Z", now);
      expect(hours).toBe(2);
    });
  });

  describe("2. Deadline Surcharge Tiers (Aturan Biaya Deadline)", () => {
    it("TC-PRIO-01: >= 6 hours remaining should have 0% surcharge", () => {
      const tier12h = getDeadlineSurcharge(12);
      expect(tier12h.percent).toBe(0);
      expect(tier12h.requiresAdminApproval).toBe(false);

      const tier6h = getDeadlineSurcharge(6);
      expect(tier6h.percent).toBe(0);
      expect(tier6h.requiresAdminApproval).toBe(false);
    });

    it("TC-PRIO-02: 3 to < 6 hours remaining should have +10% surcharge", () => {
      const tier5h = getDeadlineSurcharge(5.5);
      expect(tier5h.percent).toBe(10);
      expect(tier5h.requiresAdminApproval).toBe(false);

      const tier3h = getDeadlineSurcharge(3);
      expect(tier3h.percent).toBe(10);
      expect(tier3h.requiresAdminApproval).toBe(false);
    });

    it("TC-PRIO-03: 2 to < 3 hours remaining should have +20% surcharge", () => {
      const tier2_5h = getDeadlineSurcharge(2.5);
      expect(tier2_5h.percent).toBe(20);
      expect(tier2_5h.requiresAdminApproval).toBe(false);

      const tier2h = getDeadlineSurcharge(2);
      expect(tier2h.percent).toBe(20);
      expect(tier2h.requiresAdminApproval).toBe(false);
    });

    it("TC-PRIO-04: < 2 hours remaining should have +25% surcharge and REQUIRE ADMIN APPROVAL", () => {
      const tier1_5h = getDeadlineSurcharge(1.5);
      expect(tier1_5h.percent).toBe(25);
      expect(tier1_5h.requiresAdminApproval).toBe(true);

      const tier0_5h = getDeadlineSurcharge(0.5);
      expect(tier0_5h.percent).toBe(25);
      expect(tier0_5h.requiresAdminApproval).toBe(true);
    });
  });

  describe("3. After-Hours Surcharge (Layanan di Luar Jam Operasional)", () => {
    it("TC-PRIO-08: should apply 0% surcharge when customer prefers regular business hours", () => {
      // Regardless of time, if regular_hours chosen, 0%
      const lateNightTime = new Date("2026-11-10T20:00:00Z"); // 03:00 WIB
      const res = getAfterHoursSurcharge("regular_hours", lateNightTime);
      expect(res.percent).toBe(0);
    });

    it("TC-PRIO-05: should apply +5% surcharge for late night (22.00–00.00 WIB)", () => {
      // 23:00 WIB = 16:00 UTC
      const date23Wib = new Date("2026-11-10T16:00:00Z");
      expect(getJakartaHour(date23Wib)).toBe(23);

      const res = getAfterHoursSurcharge("asap", null, date23Wib);
      expect(res.percent).toBe(5);
    });

    it("TC-PRIO-06: should apply +10% surcharge for early morning (00.00–06.00 WIB)", () => {
      // 03:00 WIB = 20:00 UTC previous day
      const date03Wib = new Date("2026-11-09T20:00:00Z");
      expect(getJakartaHour(date03Wib)).toBe(3);

      const res = getAfterHoursSurcharge("asap", null, date03Wib);
      expect(res.percent).toBe(10);
    });

    it("should apply 0% surcharge during regular business hours (06.00–22.00 WIB)", () => {
      // 10:00 WIB = 03:00 UTC
      const date10Wib = new Date("2026-11-10T03:00:00Z");
      expect(getJakartaHour(date10Wib)).toBe(10);

      const res = getAfterHoursSurcharge("asap", null, date10Wib);
      expect(res.percent).toBe(0);
    });
  });

  describe("4. Order Pricing Calculation & 25% Maximum Cap Rule", () => {
    it("TC-PRIO-07: should cap combined surcharges at exactly 25% of base price", () => {
      const now = new Date("2026-11-09T20:00:00Z"); // 03:00 WIB (+10% after-hours)
      const deadline = new Date("2026-11-09T22:30:00Z"); // 05:30 WIB (2.5 hours remaining = +20% deadline)

      const pricing = calculateOrderPricing({
        basePrice: 100000,
        deadline,
        startTimePreference: "asap",
        referenceNow: now,
      });

      expect(pricing.basePrice).toBe(100000);
      expect(pricing.deadlineSurchargePercent).toBe(20);
      expect(pricing.deadlineSurchargeAmount).toBe(20000);
      expect(pricing.afterHoursSurchargePercent).toBe(10);
      expect(pricing.afterHoursSurchargeAmount).toBe(10000);

      // Raw total would be 20k + 10k = 30k (+30%)
      // Because max regular surcharge is 25%, cap adjustment discount must be 5k!
      expect(pricing.capAdjustmentAmount).toBe(5000);
      expect(pricing.totalSurchargeAmount).toBe(25000);
      expect(pricing.finalPrice).toBe(125000);

      // DP 50% must be exact integer
      expect(pricing.dpAmount).toBe(62500);
      expect(pricing.finalAmount).toBe(62500);
    });

    it("TC-PRIO-09: should record custom admin adjustment with explicit reason", () => {
      const now = new Date("2026-11-10T03:00:00Z"); // 10:00 WIB (0% after-hours)
      const deadline = new Date("2026-11-10T13:00:00Z"); // 20:00 WIB (10h remaining = 0% deadline)

      const pricing = calculateOrderPricing({
        basePrice: 200000,
        deadline,
        startTimePreference: "regular_hours",
        referenceNow: now,
        adminSpecialAdjustment: {
          amount: 50000,
          reason: "Kebutuhan arsitektur microservices tingkat lanjut",
        },
      });

      expect(pricing.finalPrice).toBe(250000);
      expect(pricing.adminCustomAdjustment?.amount).toBe(50000);
      expect(pricing.adminCustomAdjustment?.reason).toBe(
        "Kebutuhan arsitektur microservices tingkat lanjut"
      );
      expect(pricing.dpAmount).toBe(125000);
      expect(pricing.finalAmount).toBe(125000);
    });
  });
});

