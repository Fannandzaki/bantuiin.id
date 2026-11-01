"use server";

import { createClient } from "@/lib/supabase/server";
import {
  digitalTaskOrderSchema,
  hardwareServiceOrderSchema,
  type DigitalTaskOrderValues,
  type HardwareServiceOrderValues,
} from "@/lib/validations/order";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/security/rate-limit";

// Generate unique human-readable order code (e.g., BANTU-2026-X8K9)
function generateOrderCode(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BANTU-${year}-${randomPart}`;
}

async function getClientIp(): Promise<string> {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "client-anon"
  );
}

export interface CreateOrderResult {
  success: boolean;
  orderCode?: string;
  error?: string;
}

/**
 * Server action to record a digital task order.
 * Protected by rate limiting (max 10 orders/min per IP) to prevent flooding.
 */
export async function createDigitalTaskOrder(
  values: DigitalTaskOrderValues
): Promise<CreateOrderResult> {
  const ip = await getClientIp();
  const rateLimit = checkRateLimit(`task-order-${ip}`, 10, 60000);
  if (!rateLimit.success) {
    return {
      success: false,
      error:
        "Terlalu banyak permintaan pemesanan dalam waktu singkat. Mohon tunggu 1 menit.",
    };
  }

  const validation = digitalTaskOrderSchema.safeParse(values);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "Data formulir tidak valid",
    };
  }

  const data = validation.data;
  const orderCode = generateOrderCode();

  try {
    const supabase = await createClient();

    const isConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-id");

    if (isConfigured) {
      const { error } = await supabase.from("orders").insert({
        order_code: orderCode,
        order_type: "digital_task",
        customer_name: data.name,
        customer_contact: data.contact || "WhatsApp Direct",
        service_category: data.category,
        format_output: data.outputFormat,
        instructions: data.instructions,
        deadline: data.deadline,
        include_learn_package: data.includeLearnPackage,
        status: "new_inquiry",
      });

      if (error) {
        console.error("Supabase insert error (digital task):", error.message);
        // Fallback: still return orderCode so the WhatsApp transaction isn't blocked
        return { success: true, orderCode };
      }
    }

    return {
      success: true,
      orderCode,
    };
  } catch (err) {
    console.error("Unexpected error creating order:", err);
    return {
      success: true,
      orderCode,
    };
  }
}

/**
 * Server action to record a hardware service order.
 * Protected by rate limiting (max 10 orders/min per IP).
 */
export async function createHardwareServiceOrder(
  values: HardwareServiceOrderValues
): Promise<CreateOrderResult> {
  const ip = await getClientIp();
  const rateLimit = checkRateLimit(`hw-order-${ip}`, 10, 60000);
  if (!rateLimit.success) {
    return {
      success: false,
      error:
        "Terlalu banyak permintaan pemesanan dalam waktu singkat. Mohon tunggu 1 menit.",
    };
  }

  const validation = hardwareServiceOrderSchema.safeParse(values);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "Data formulir tidak valid",
    };
  }

  const data = validation.data;
  const orderCode = generateOrderCode();

  try {
    const supabase = await createClient();

    const isConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-id");

    if (isConfigured) {
      const { error } = await supabase.from("orders").insert({
        order_code: orderCode,
        order_type: "hardware_service",
        customer_name: data.name,
        customer_contact: data.contact || "WhatsApp Direct",
        service_category: data.issue,
        instructions: `Servis laptop ${data.laptopModel}. Kendala: ${data.issue}`,
        deadline: data.expectedCompletion,
        hardware_details: {
          laptop_model: data.laptopModel,
          issue: data.issue,
          delivery_method: data.deliveryMethod,
          accepts_data_disclaimer: data.acceptsDataDisclaimer,
        },
        status: "new_inquiry",
      });

      if (error) {
        console.error("Supabase insert error (hardware):", error.message);
        return { success: true, orderCode };
      }
    }

    return {
      success: true,
      orderCode,
    };
  } catch (err) {
    console.error("Unexpected error creating hardware order:", err);
    return {
      success: true,
      orderCode,
    };
  }
}
