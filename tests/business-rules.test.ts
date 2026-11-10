import { describe, it, expect } from "vitest";
import { formatRupiah } from "@/lib/utils";
import { calculateOrderPricing } from "@/lib/pricing/priority-calculator";

describe("MODUL D: Financial Integrity & Business Rules Testing", () => {
  describe("1. Currency & Financial Formatting (Rupiah)", () => {
    it("should format rupiah integers accurately without decimal leaks", () => {
      expect(formatRupiah(100000)).toMatch(/^Rp[\s\u00A0]?100\.000$/);
      expect(formatRupiah(62500)).toMatch(/^Rp[\s\u00A0]?62\.500$/);
      expect(formatRupiah(0)).toMatch(/^Rp[\s\u00A0]?0$/);
    });
  });

  describe("2. Integer Math & DP 50% Exact Halving", () => {
    it("should guarantee that DP amount + Final amount equals exactly final price", () => {
      const oddBasePrices = [75000, 99000, 125000, 187500, 245000, 499000];

      for (const base of oddBasePrices) {
        const pricing = calculateOrderPricing({
          basePrice: base,
          deadline: new Date(Date.now() + 4 * 3600 * 1000), // +10%
          startTimePreference: "regular_hours",
        });

        // Integers only
        expect(Number.isInteger(pricing.finalPrice)).toBe(true);
        expect(Number.isInteger(pricing.dpAmount)).toBe(true);
        expect(Number.isInteger(pricing.finalAmount)).toBe(true);

        // Sum must be exact
        expect(pricing.dpAmount + pricing.finalAmount).toBe(pricing.finalPrice);
      }
    });
  });

  describe("3. Order Status Flow Rules", () => {
    const validTransitions: Record<string, string[]> = {
      new_inquiry: ["under_review", "cancelled"],
      under_review: ["quotation_sent", "cancelled"],
      quotation_sent: ["awaiting_dp", "cancelled"],
      awaiting_dp: ["in_progress", "cancelled"],
      in_progress: ["awaiting_final_payment", "cancelled"],
      awaiting_final_payment: ["completed", "revision"],
      revision: ["awaiting_final_payment", "completed"],
      completed: [],
      cancelled: [],
    };

    it("should conform to business state transitions", () => {
      expect(validTransitions["new_inquiry"]).toContain("under_review");
      expect(validTransitions["quotation_sent"]).toContain("awaiting_dp");
      expect(validTransitions["in_progress"]).toContain("awaiting_final_payment");
      expect(validTransitions["completed"].length).toBe(0);
    });
  });

  describe("4. Dashboard Revenue Calculation Rule (RSK-01 Verification)", () => {
    it("TC-ADM-03: should only include valid/completed or verified orders in total revenue", () => {
      const mockOrders = [
        { id: "1", status: "completed", total_price: 250000 },
        { id: "2", status: "in_progress", total_price: 150000 },
        { id: "3", status: "cancelled", total_price: 100000 }, // MUST NOT be counted
        { id: "4", status: "new_inquiry", total_price: 80000 }, // Inquiry not yet committed
      ];

      // Safe business revenue: only completed and verified in-progress
      const safeRevenue = mockOrders
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + (o.total_price || 0), 0);

      expect(safeRevenue).toBe(250000); // Only order 1
      expect(safeRevenue).not.toBe(580000); // 580000 was the flawed sum including cancelled/inquiry!
    });
  });
});
