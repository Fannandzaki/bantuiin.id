"use server";

import { createClient } from "@/lib/supabase/server";
import { AdminOrder, OrderStatus, OrderType } from "@/types";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/assert-admin";

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
