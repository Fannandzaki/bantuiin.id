import {
  PriorityStatus,
  StartTimePreference,
  QuotationCalculationSnapshot,
} from "@/types";

/**
 * Returns current date/time converted to Asia/Jakarta timezone.
 */
export function getJakartaHour(date: Date = new Date()): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "numeric",
    hour12: false,
  });
  const hourStr = formatter.format(date);
  return parseInt(hourStr, 10);
}

/**
 * Calculates remaining hours from reference time (now or effective start time) to deadline.
 */
export function calculateRemainingHours(
  deadline: Date | string,
  fromTime: Date = new Date()
): number {
  const deadlineMs = typeof deadline === "string" ? new Date(deadline).getTime() : deadline.getTime();
  const fromMs = fromTime.getTime();
  const diffHours = (deadlineMs - fromMs) / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100;
}

/**
 * Calculates the effective start time of work based on preference and current time in WIB.
 */
export function calculateEffectiveStartTime(
  preference: StartTimePreference = "asap",
  requestedStartTime?: Date | string | null,
  referenceNow: Date = new Date()
): Date {
  if (preference === "asap") {
    return referenceNow;
  }

  if (preference === "specific_time" && requestedStartTime) {
    const parsed = typeof requestedStartTime === "string" ? new Date(requestedStartTime) : requestedStartTime;
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    return referenceNow;
  }

  if (preference === "regular_hours") {
    const jakartaHour = getJakartaHour(referenceNow);
    // Regular business hours: 06.00 to 21.59 WIB
    if (jakartaHour >= 6 && jakartaHour < 22) {
      return referenceNow;
    }

    // Outside regular hours: next window starts at 06.00 WIB
    const nextStart = new Date(referenceNow);
    if (jakartaHour >= 22) {
      nextStart.setDate(nextStart.getDate() + 1);
    }

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(nextStart);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    const next06WibIso = `${year}-${month}-${day}T06:00:00+07:00`;
    const parsed06 = new Date(next06WibIso);
    return isNaN(parsed06.getTime()) ? nextStart : parsed06;
  }

  return referenceNow;
}

/**
 * Evaluates deadline surcharge percentage and determines whether admin approval is mandatory.
 *
 * Rules:
 * - <= 0 hours: 0% (Deadline tidak valid / sudah lewat)
 * - >= 6 hours: 0% (Normal)
 * - 3 to < 6 hours: +10%
 * - 2 to < 3 hours: +20%
 * - < 2 hours: +25% (Requires mandatory admin verification)
 */
export function getDeadlineSurcharge(hoursRemaining: number): {
  percent: number;
  requiresAdminApproval: boolean;
  tierLabel: string;
  isInvalid?: boolean;
} {
  if (hoursRemaining <= 0) {
    return {
      percent: 0,
      requiresAdminApproval: false,
      tierLabel: "Deadline Tidak Valid (Waktu Telah Lewat)",
      isInvalid: true,
    };
  } else if (hoursRemaining >= 6) {
    return { percent: 0, requiresAdminApproval: false, tierLabel: "Normal (>= 6 Jam)", isInvalid: false };
  } else if (hoursRemaining >= 3) {
    return { percent: 10, requiresAdminApproval: false, tierLabel: "Prioritas 3–6 Jam (+10%)", isInvalid: false };
  } else if (hoursRemaining >= 2) {
    return { percent: 20, requiresAdminApproval: false, tierLabel: "Mendesak 2–3 Jam (+20%)", isInvalid: false };
  } else {
    // Under 2 hours
    return {
      percent: 25,
      requiresAdminApproval: true,
      tierLabel: "Darurat < 2 Jam (+25% Wajib Review Admin)",
      isInvalid: false,
    };
  }
}

/**
 * Evaluates after-hours surcharge based on requested start time and customer preference.
 *
 * Rules:
 * - 06.00 – 22.00 WIB: 0%
 * - 22.00 – 00.00 WIB: +5%
 * - 00.00 – 06.00 WIB: +10%
 *
 * IMPORTANT: Only applies if the customer explicitly requests work to start during these hours
 * and admin confirms team availability.
 */
export function getAfterHoursSurcharge(
  preference: StartTimePreference,
  requestedStartTime?: Date | string | null,
  referenceNow: Date = new Date()
): {
  percent: number;
  tierLabel: string;
} {
  // If customer is fine with regular business hours, no surcharge applies
  if (preference === "regular_hours") {
    return { percent: 0, tierLabel: "Jam Operasional Reguler (0%)" };
  }

  // Determine the target time to check
  let targetDate = referenceNow;
  if (preference === "specific_time" && requestedStartTime) {
    targetDate = typeof requestedStartTime === "string" ? new Date(requestedStartTime) : requestedStartTime;
  }

  const jakartaHour = getJakartaHour(targetDate);

  if (jakartaHour >= 0 && jakartaHour < 6) {
    return { percent: 10, tierLabel: "Dini Hari 00.00–06.00 (+10%)" };
  } else if (jakartaHour >= 22 && jakartaHour < 24) {
    return { percent: 5, tierLabel: "Larut Malam 22.00–00.00 (+5%)" };
  } else {
    return { percent: 0, tierLabel: "Jam Kerja 06.00–22.00 (0%)" };
  }
}

export interface CalculateOrderPricingParams {
  basePrice: number;
  deadline: Date | string;
  startTimePreference?: StartTimePreference;
  requestedStartTime?: Date | string | null;
  referenceNow?: Date;
  adminSpecialAdjustment?: {
    percent?: number;
    amount?: number;
    reason: string;
  };
}

/**
 * Calculates complete transparent pricing snapshot with safe integer math and strict 25% cap.
 */
export function calculateOrderPricing({
  basePrice,
  deadline,
  startTimePreference = "asap",
  requestedStartTime,
  referenceNow = new Date(),
  adminSpecialAdjustment,
}: CalculateOrderPricingParams): QuotationCalculationSnapshot & {
  hoursRemaining: number;
  priorityStatus: PriorityStatus;
  deadlineTierLabel: string;
  afterHoursTierLabel: string;
} {
  const safeBasePrice = Math.max(0, Math.round(basePrice));
  const effectiveStartTime = calculateEffectiveStartTime(startTimePreference, requestedStartTime, referenceNow);
  const hoursRemaining = calculateRemainingHours(deadline, effectiveStartTime);

  // 1. Deadline surcharge
  const deadlineResult = getDeadlineSurcharge(hoursRemaining);
  const deadlineSurchargePercent = deadlineResult.percent;
  const deadlineSurchargeAmount = Math.round((safeBasePrice * deadlineSurchargePercent) / 100);

  // 2. After-hours surcharge
  const afterHoursResult = getAfterHoursSurcharge(startTimePreference, effectiveStartTime, referenceNow);
  const afterHoursSurchargePercent = afterHoursResult.percent;
  const afterHoursSurchargeAmount = Math.round((safeBasePrice * afterHoursSurchargePercent) / 100);

  // 3. Uncapped vs Capped Regular Surcharge (Max 25%)
  const uncappedSumPercent = deadlineSurchargePercent + afterHoursSurchargePercent;
  const uncappedSumAmount = deadlineSurchargeAmount + afterHoursSurchargeAmount;

  // Regular Cap: max 25% of base price
  const cappedPercent = Math.min(25, uncappedSumPercent);
  const cappedAmount = Math.round((safeBasePrice * cappedPercent) / 100);

  // Reduction amount if cap was exceeded (e.g. 20% + 10% = 30% -> reduced by 5%)
  const capAdjustmentAmount = uncappedSumAmount - cappedAmount;

  let totalSurchargeAmount = cappedAmount;
  let finalPrice = safeBasePrice + totalSurchargeAmount;

  // 4. Admin special adjustment (if any, with documented operational reason)
  if (adminSpecialAdjustment?.reason) {
    if (adminSpecialAdjustment.amount !== undefined) {
      totalSurchargeAmount = Math.max(0, adminSpecialAdjustment.amount);
      finalPrice = safeBasePrice + totalSurchargeAmount;
    } else if (adminSpecialAdjustment.percent !== undefined) {
      totalSurchargeAmount = Math.round((safeBasePrice * adminSpecialAdjustment.percent) / 100);
      finalPrice = safeBasePrice + totalSurchargeAmount;
    }
  }

  const dpAmount = Math.round(finalPrice * 0.5);
  const finalAmount = finalPrice - dpAmount;

  const priorityStatus: PriorityStatus = deadlineResult.requiresAdminApproval
    ? "priority_pending_admin"
    : uncappedSumPercent > 0
    ? "priority_approved"
    : "normal";

  return {
    basePrice: safeBasePrice,
    deadlineSurchargePercent,
    deadlineSurchargeAmount,
    afterHoursSurchargePercent,
    afterHoursSurchargeAmount,
    capAdjustmentAmount,
    totalSurchargeAmount,
    finalPrice,
    dpAmount,
    finalAmount,
    adminCustomAdjustment: adminSpecialAdjustment,
    hoursRemaining,
    priorityStatus,
    deadlineTierLabel: deadlineResult.tierLabel,
    afterHoursTierLabel: afterHoursResult.tierLabel,
  };
}

/**
 * Formats ISO Date to a human readable Indonesian date in Asia/Jakarta timezone.
 * Example: "Senin, 3 Nov 2026, 15.00 WIB"
 */
export function formatJakartaDateTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "-";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d) + " WIB";
  } catch {
    return String(dateInput);
  }
}

