import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit } from "@/lib/security/rate-limit";

describe("MODUL C: Rate Limiting & Resource Protection Testing", () => {
  it("TC-SEC-03: should allow requests within the specified limit", () => {
    const ip = "192.168.1.10";
    const limit = 5;
    const windowMs = 60000;

    for (let i = 0; i < limit; i++) {
      const res = checkRateLimit(`test-allow-${ip}`, limit, windowMs);
      expect(res.success).toBe(true);
      expect(res.remaining).toBe(limit - 1 - i);
    }
  });

  it("TC-ORD-06: should reject requests once the threshold limit is exceeded", () => {
    const ip = "192.168.1.99";
    const limit = 3;
    const windowMs = 60000;

    // Send 3 requests (all allowed)
    for (let i = 0; i < limit; i++) {
      const res = checkRateLimit(`test-block-${ip}`, limit, windowMs);
      expect(res.success).toBe(true);
    }

    // 4th request must be rejected
    const blockedRes = checkRateLimit(`test-block-${ip}`, limit, windowMs);
    expect(blockedRes.success).toBe(false);
    expect(blockedRes.remaining).toBe(0);
    expect(blockedRes.resetInMs).toBeGreaterThan(0);
  });

  it("should isolate limits per client identifier", () => {
    const ipA = "10.0.0.1";
    const ipB = "10.0.0.2";
    const limit = 2;

    // Exhaust ipA
    checkRateLimit(`ip-${ipA}`, limit, 60000);
    checkRateLimit(`ip-${ipA}`, limit, 60000);
    const blockedA = checkRateLimit(`ip-${ipA}`, limit, 60000);
    expect(blockedA.success).toBe(false);

    // ipB must still be allowed
    const allowedB = checkRateLimit(`ip-${ipB}`, limit, 60000);
    expect(allowedB.success).toBe(true);
  });
});

