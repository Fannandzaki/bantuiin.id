"use server";

import { createClient } from "@/lib/supabase/server";
import { AdminOrder, OrderStatus, OrderType, QuotationRecord } from "@/types";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/assert-admin";
import { calculateOrderPricing } from "@/lib/pricing/priority-calculator";

export interface FetchOrdersParams {
  status?: OrderStatus | "all";
  type?: OrderType | "all";
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Fetch orders for admin console with filtering & search.
 * Protected by verifyAdminSession() guard.
 */
export async function getAdminOrders(params: FetchOrdersParams = {}): Promise<AdminOrder[]> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    console.warn("Unauthorized attempt to fetch admin orders.");
    return [];
  }

  const { status = "all", type = "all", search = "", limit = 100, offset = 0 } = params;

  try {
    const supabase = await createClient();
    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== "all") {
      query = query.eq("status", status);
    }
    if (type !== "all") {
      query = query.eq("order_type", type);
    }
    if (search) {
      query = query.or(
        `order_code.ilike.%${search}%,customer_name.ilike.%${search}%,service_category.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error("Fetch admin orders error:", error.message);
      return [];
    }

    return (data as AdminOrder[]) || [];
  } catch (err) {
    console.error("Unexpected fetch orders error:", err);
    return [];
  }
}

/**
 * Update an order's status and record audit log.
 * Enforces admin authorization and records who made the change.
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return {
      success: false,
      error: auth.error || "Akses ditolak: otorisasi administratif diperlukan.",
    };
  }

  try {
    const supabase = await createClient();

    // 1. Get current status
    const { data: currentOrder, error: fetchErr } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    if (fetchErr || !currentOrder) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }

    // 2. Update order status
    const { error: updateErr } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        internal_notes: note ? note : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    // 3. Insert audit log with authorized user ID
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      from_status: currentOrder.status,
      to_status: newStatus,
      note: note || `Status diperbarui menjadi ${newStatus}`,
      changed_by: auth.userId,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/pesanan");
    return { success: true };
  } catch (err) {
    console.error("Update status error:", err);
    return { success: false, error: "Gagal memperbarui status pesanan." };
  }
}

/**
 * Verifies or rejects emergency/priority request (< 2 hours or urgent after-hours).
 */
export async function verifyPriorityAction(
  orderId: string,
  decision: "approved" | "rejected",
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return {
      success: false,
      error: auth.error || "Akses ditolak: otorisasi administratif diperlukan.",
    };
  }

  try {
    const supabase = await createClient();

    const priorityStatus = decision === "approved" ? "priority_approved" : "priority_rejected";
    const note =
      decision === "approved"
        ? `Permintaan prioritas disetujui admin.`
        : `Permintaan prioritas ditolak admin: ${reason || "Slot pengerjaan penuh"}`;

    const { error: updateErr } = await supabase
      .from("orders")
      .update({
        priority_status: priorityStatus,
        priority_rejection_reason: decision === "rejected" ? reason : null,
        internal_notes: note,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    await supabase.from("order_status_history").insert({
      order_id: orderId,
      to_status: "under_review",
      note,
      changed_by: auth.userId,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/pesanan");
    return { success: true };
  } catch (err) {
    console.error("Verify priority error:", err);
    return { success: false, error: "Gagal memperbarui status prioritas." };
  }
}

/**
 * Creates an immutable official quotation snapshot for an order.
 * Calculates transparent pricing with the 25% cap and updates order total price.
 */
export async function createQuotationAction(params: {
  orderId: string;
  basePrice: number;
  adminSpecialAdjustment?: {
    percent?: number;
    amount?: number;
    reason: string;
  };
  notes?: string;
}): Promise<{ success: boolean; quotation?: QuotationRecord; error?: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return {
      success: false,
      error: auth.error || "Akses ditolak: otorisasi administratif diperlukan.",
    };
  }

  try {
    const supabase = await createClient();

    // 1. Fetch order details
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", params.orderId)
      .single();

    if (orderErr || !order) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }

    // 2. Perform safe server-side pricing calculation
    const deadlineToUse = order.requested_deadline || order.deadline;
    const calc = calculateOrderPricing({
      basePrice: params.basePrice,
      deadline: deadlineToUse,
      startTimePreference: order.start_time_preference || "asap",
      requestedStartTime: order.requested_start_time,
      adminSpecialAdjustment: params.adminSpecialAdjustment,
    });

    // 3. Generate unique quotation number (e.g., QUO-BANTU-YYYY-XXXX)
    const quotationNumber = `QUO-${order.order_code}`;

    // 4. Save quotation snapshot
    const { data: quotation, error: quoErr } = await supabase
      .from("quotations")
      .upsert(
        {
          order_id: params.orderId,
          quotation_number: quotationNumber,
          total_amount: calc.finalPrice,
          dp_amount: calc.dpAmount,
          final_amount: calc.finalAmount,
          items: calc,
          status: "sent",
          notes: params.notes || null,
          valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Valid 24 hours
        },
        { onConflict: "order_id" }
      )
      .select("*")
      .single();

    if (quoErr) {
      console.error("Create quotation error:", quoErr.message);
      return { success: false, error: quoErr.message };
    }

    // 5. Update order with total_price and status = 'quotation_sent'
    await supabase
      .from("orders")
      .update({
        total_price: calc.finalPrice,
        status: "quotation_sent",
        deadline_surcharge_percent: calc.deadlineSurchargePercent,
        after_hours_surcharge_percent: calc.afterHoursSurchargePercent,
        total_surcharge_percent: Math.min(25, calc.deadlineSurchargePercent + calc.afterHoursSurchargePercent),
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.orderId);

    // 6. Record audit log
    await supabase.from("order_status_history").insert({
      order_id: params.orderId,
      to_status: "quotation_sent",
      note: `Quotation resmi dibuat: Total ${calc.finalPrice} (DP ${calc.dpAmount})`,
      changed_by: auth.userId,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/pesanan");

    return {
      success: true,
      quotation: quotation as QuotationRecord,
    };
  } catch (err) {
    console.error("Quotation creation error:", err);
    return { success: false, error: "Gagal membuat quotation resmi." };
  }
}
