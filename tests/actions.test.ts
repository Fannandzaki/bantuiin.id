import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (key: string) => {
      if (key === "x-forwarded-for") return "127.0.0.1";
      return null;
    },
  }),
  cookies: async () => ({
    get: () => undefined,
    set: () => {},
  }),
}));

// Mock Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: null }, error: new Error("No user") }),
    },
    from: () => ({
      insert: async () => ({ error: null }),
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: new Error("Not found") }),
        }),
      }),
    }),
  }),
}));

import { createDigitalTaskOrder } from "@/app/actions/orders";
import { getAdminOrders, updateOrderStatusAction, createQuotationAction } from "@/app/actions/admin-orders";

describe("MODUL E: Server Actions & Security Guard Testing", () => {
  describe("1. Order Creation Server Action", () => {
    it("should reject invalid order input before database interaction", async () => {
      const invalidData = {
        name: "", // Invalid: < 2 chars
        category: "Coding",
        outputFormat: "ZIP",
        instructions: "Too short", // < 5 chars
        deadline: "Besok",
        includeLearnPackage: false,
      };

      // @ts-expect-error - testing invalid shape
      const res = await createDigitalTaskOrder(invalidData);
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it("should process valid order, compute priority, and generate unique order code", async () => {
      const validData = {
        name: "Test Customer",
        contact: "081299998888",
        category: "Coding Web / Laravel / PHP",
        outputFormat: ".ZIP + Database SQL",
        instructions: "Tolong buatkan sistem inventaris barang mini dengan 3 tabel database.",
        deadline: new Date(Date.now() + 5 * 3600 * 1000).toISOString(), // 5h remaining = +10%
        includeLearnPackage: true,
        startTimePreference: "asap" as const,
      };

      const res = await createDigitalTaskOrder(validData);
      expect(res.success).toBe(true);
      expect(res.orderCode).toMatch(/^BANTU-\d{4}-[A-Z0-9]{4}$/);
      expect(res.totalSurchargePercent).toBeDefined();
    });
  });

  describe("2. Admin Privilege Guard Verification (Defense-in-Depth)", () => {
    it("TC-SEC-02: getAdminOrders must reject unauthenticated requests", async () => {
      const orders = await getAdminOrders();
      expect(orders).toEqual([]);
    });

    it("TC-SEC-04: updateOrderStatusAction must reject unauthenticated requests", async () => {
      const res = await updateOrderStatusAction("dummy-order-id", "in_progress");
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it("createQuotationAction must reject unauthenticated requests", async () => {
      const res = await createQuotationAction({
        orderId: "dummy-order-id",
        basePrice: 150000,
      });
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });
  });
});
