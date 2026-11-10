import { describe, it, expect } from "vitest";
import {
  digitalTaskOrderSchema,
  hardwareServiceOrderSchema,
} from "@/lib/validations/order";

describe("MODUL B: Input Validation & Boundary Security Testing", () => {
  describe("1. Digital Task Order Validation", () => {
    it("TC-ORD-01: should accept valid digital task order inputs", () => {
      const valid = {
        name: "Budi Santoso",
        contact: "081234567890",
        category: "Coding Web / Laravel",
        outputFormat: ".ZIP + Database SQL",
        instructions: "Mohon bantu buatkan fitur login dan dashboard admin sederhana.",
        deadline: "Besok lusa jam 17.00 WIB",
        includeLearnPackage: true,
        startTimePreference: "asap",
      };

      const result = digitalTaskOrderSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Budi Santoso");
        expect(result.data.category).toBe("Coding Web / Laravel");
      }
    });

    it("TC-ORD-02: should reject name with less than 2 characters", () => {
      const invalid = {
        name: "A",
        category: "Coding",
        outputFormat: "PDF",
        instructions: "Instruksi yang panjang lebih dari lima karakter",
        deadline: "Besok",
      };

      const result = digitalTaskOrderSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Nama panggilan minimal 2 karakter");
      }
    });

    it("TC-ORD-03: should reject instructions with less than 5 characters", () => {
      const invalid = {
        name: "Budi",
        category: "Coding",
        outputFormat: "PDF",
        instructions: "test", // 4 chars
        deadline: "Besok",
      };

      const result = digitalTaskOrderSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Instruksi minimal 5 karakter");
      }
    });

    it("should reject instructions exceeding 3000 characters", () => {
      const invalid = {
        name: "Budi",
        category: "Coding",
        outputFormat: "PDF",
        instructions: "A".repeat(3001),
        deadline: "Besok",
      };

      const result = digitalTaskOrderSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Instruksi maksimal 3000 karakter");
      }
    });

    it("TC-ORD-04: should parse and contain XSS strings safely without corruption", () => {
      const xssInput = {
        name: '<script>alert("XSS")</script>',
        category: "Coding Web",
        outputFormat: '"><svg onload=alert(1)>',
        instructions: "Normal instructions but with <img src=x onerror=alert(2)> text",
        deadline: "2026-11-15T10:00",
      };

      const result = digitalTaskOrderSchema.safeParse(xssInput);
      expect(result.success).toBe(true);
      if (result.success) {
        // Data parsed as literal string data, not executable
        expect(result.data.name).toContain("<script>");
      }
    });
  });

  describe("2. Hardware Service Order Validation", () => {
    it("TC-ORD-05: should validate hardware service requirements", () => {
      const valid = {
        name: "Fajar",
        issue: "Cleaning Fan + Repaste Thermal Paste Overheat",
        laptopModel: "Lenovo Legion 5",
        deliveryMethod: "Drop-off ke Lokasi Admin",
        expectedCompletion: "3 Jam Selesai",
        acceptsDataDisclaimer: true,
      };

      const result = hardwareServiceOrderSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject hardware order with empty laptop model", () => {
      const invalid = {
        name: "Fajar",
        issue: "Cleaning",
        laptopModel: " ",
        expectedCompletion: "Besok",
      };

      const result = hardwareServiceOrderSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});

