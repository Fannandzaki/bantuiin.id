"use server";

import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/auth/assert-admin";
import { revalidatePath } from "next/cache";
import { PaymentRecord, PaymentType } from "@/types";

/**
 * Fetch all payment records for an order.
 * Requires admin or staff authorization.
 */
export async function getOrderPayments(orderId: string): Promise<PaymentRecord[]> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    console.warn("Unauthorized attempt to fetch order payments.");
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payment_records")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch payments error:", error.message);
      return [];
    }

    return (data as PaymentRecord[]) || [];
  } catch (err) {
    console.error("Unexpected fetch payments error:", err);
    return [];
  }
}

/**
 * Record a new payment transaction (DP, pelunasan, or full).
 * Requires admin authorization.
 */
export async function recordPaymentAction(params: {
  orderId: string;
  quotationId?: string | null;
  paymentType: PaymentType;
  amount: number;
  paymentMethod: string;
  proofUrl?: string | null;
  note?: string;
}): Promise<{ success: boolean; payment?: PaymentRecord; error?: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return {
      success: false,
      error: auth.error || "Akses ditolak: otorisasi administratif diperlukan.",
    };
  }

  if (params.amount <= 0) {
    return { success: false, error: "Nominal pembayaran harus lebih dari 0." };
  }

  try {
    const supabase = await createClient();

    // 1. Verify order exists
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, status, total_price")
      .eq("id", params.orderId)
      .single();

    if (orderErr || !order) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }

    // 2. Insert payment record with pending status
    const { data: payment, error: payErr } = await supabase
      .from("payment_records")
      .insert({
        order_id: params.orderId,
        quotation_id: params.quotationId || null,
        payment_type: params.paymentType,
        amount: Math.round(params.amount),
        payment_method: params.paymentMethod || "QRIS",
        proof_url: params.proofUrl || null,
        status: "pending",
      })
      .select("*")
      .single();

    if (payErr) {
      console.error("Record payment error:", payErr.message);
      return { success: false, error: payErr.message };
    }

    // 3. Record audit log
    await supabase.from("order_status_history").insert({
      order_id: params.orderId,
      to_status: order.status,
      note: `Pencatatan pembayaran ${params.paymentType.toUpperCase()} sejumlah Rp${params.amount.toLocaleString("id-ID")} via ${params.paymentMethod} dimasukkan (Menunggu Verifikasi)`,
      changed_by: auth.userId,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/pesanan");

    return {
      success: true,
      payment: payment as PaymentRecord,
    };
  } catch (err) {
    console.error("Record payment unexpected error:", err);
    return { success: false, error: "Gagal mencatat transaksi pembayaran." };
  }
}

/**
 * Verify or reject a payment transaction.
 * Requires admin authorization.
 */
export async function verifyPaymentAction(
  paymentId: string,
  decision: "verified" | "rejected",
  orderId: string,
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

    // 1. Update payment record status
    const { data: updatedPayment, error: updateErr } = await supabase
      .from("payment_records")
      .update({
        status: decision,
        verified_by: auth.userId,
        verified_at: new Date().toISOString(),
      })
      .eq("id", paymentId)
      .select("*")
      .single();

    if (updateErr || !updatedPayment) {
      return { success: false, error: updateErr?.message || "Gagal memperbarui status pembayaran." };
    }

    // 2. Fetch order details to evaluate status progression
    const { data: order } = await supabase
      .from("orders")
      .select("id, status, total_price")
      .eq("id", orderId)
      .single();

    const auditNote =
      decision === "verified"
        ? `Pembayaran ${updatedPayment.payment_type.toUpperCase()} Rp${updatedPayment.amount.toLocaleString("id-ID")} DIVERIFIKASI admin.`
        : `Pembayaran ${updatedPayment.payment_type.toUpperCase()} Rp${updatedPayment.amount.toLocaleString("id-ID")} DITOLAK: ${note || "Bukti tidak valid"}`;

    // 3. Record audit log
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      to_status: order?.status || "under_review",
      note: auditNote,
      changed_by: auth.userId,
    });

    // 4. If DP is verified and order was awaiting_dp, advance to in_progress
    if (decision === "verified" && order && order.status === "awaiting_dp") {
      await supabase
        .from("orders")
        .update({
          status: "in_progress",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      await supabase.from("order_status_history").insert({
        order_id: orderId,
        from_status: "awaiting_dp",
        to_status: "in_progress",
        note: "DP terverifikasi, pesanan otomatis dinaikkan ke antrean pengerjaan aktif (in_progress).",
        changed_by: auth.userId,
      });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/pesanan");

    return { success: true };
  } catch (err) {
    console.error("Verify payment unexpected error:", err);
    return { success: false, error: "Gagal memproses verifikasi pembayaran." };
  }
}
