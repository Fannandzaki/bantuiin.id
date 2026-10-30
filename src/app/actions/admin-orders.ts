"use server";

import { createClient } from "@/lib/supabase/server";
import { AdminOrder, OrderStatus, OrderType } from "@/types";
import { revalidatePath } from "next/cache";

// Sample initial data for local development when Supabase live project is not yet connected
const FALLBACK_ORDERS: AdminOrder[] = [
  {
    id: "ord-sample-01",
    order_code: "BANTU-2026-X8K9",
    order_type: "digital_task",
    customer_name: "Mahasiswa Hebat",
    customer_contact: "6281234567890",
    service_category: "Coding Web / Laravel / PHP",
    format_output: ".ZIP (Source Code) + .SQL",
    instructions: "Bikin sistem kasir mini ada CRUD produk dan laporan transaksi harian.",
    deadline: "Besok lusa, pukul 18.00 WIB",
    include_learn_package: true,
    status: "new_inquiry",
    total_price: 350000,
    internal_notes: "Klien butuh penjelasan khusus untuk presentasi sidang.",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "ord-sample-02",
    order_code: "BANTU-2026-H4M2",
    order_type: "hardware_service",
    customer_name: "Rizky Firmansyah",
    customer_contact: "6289876543210",
    service_category: "Cleaning Fan + Repaste Thermal Paste Overheat",
    format_output: null,
    instructions: "Servis laptop Asus ROG Zephyrus. Kendala: Suhu tembus 92°C saat render.",
    deadline: "3 Hari lagi, pukul 16.00 WIB",
    include_learn_package: false,
    hardware_details: {
      laptop_model: "Asus ROG Zephyrus G14",
      issue: "Cleaning Fan + Repaste Thermal Paste Overheat",
      delivery_method: "Drop-off ke Lokasi Admin",
      accepts_data_disclaimer: true,
    },
    status: "in_progress",
    total_price: 120000,
    internal_notes: "Pasta Arctic MX-4 sudah diaplikasikan. Sedang running stress test AIDA64.",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: "ord-sample-03",
    order_code: "BANTU-2026-D9W1",
    order_type: "digital_task",
    customer_name: "Siti Nurhaliza",
    customer_contact: "6281357924680",
    service_category: "Formatting Word + Sitasi Mendeley",
    format_output: "Document .docx + Library .bib",
    instructions: "Format skripsi bab 1-5 sesuai pedoman penulisan Universitas Indonesia, daftar isi & tabel otomatis.",
    deadline: "Besok pagi jam 09.00 WIB (Rush Fee)",
    include_learn_package: false,
    status: "awaiting_final_payment",
    total_price: 85000,
    internal_notes: "Preview screenshot watermark sudah dikirim ke WhatsApp klien.",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 14400000).toISOString(),
  },
];

export interface FetchOrdersParams {
  status?: OrderStatus | "all";
  type?: OrderType | "all";
  search?: string;
}

/**
 * Fetch orders for admin console with filtering & search.
 */
export async function getAdminOrders(params: FetchOrdersParams = {}): Promise<AdminOrder[]> {
  const { status = "all", type = "all", search = "" } = params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured =
    supabaseUrl && !supabaseUrl.includes("placeholder-id");

  if (!isSupabaseConfigured) {
    // Return sample data filtered in memory
    return FALLBACK_ORDERS.filter((order) => {
      if (status !== "all" && order.status !== status) return false;
      if (type !== "all" && order.order_type !== type) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          order.order_code.toLowerCase().includes(q) ||
          order.customer_name.toLowerCase().includes(q) ||
          (order.service_category && order.service_category.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }

  try {
    const supabase = await createClient();
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

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
 * Update an order's status and write to audit trail.
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured =
    supabaseUrl && !supabaseUrl.includes("placeholder-id");

  if (!isSupabaseConfigured) {
    // In mock fallback mode, simulate success
    const item = FALLBACK_ORDERS.find((o) => o.id === orderId);
    if (item) {
      item.status = newStatus;
      item.updated_at = new Date().toISOString();
      if (note) item.internal_notes = note;
    }
    revalidatePath("/admin");
    revalidatePath("/admin/pesanan");
    return { success: true };
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

    // 3. Insert audit log
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      from_status: currentOrder.status,
      to_status: newStatus,
      note: note || `Status diperbarui menjadi ${newStatus}`,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/pesanan");
    return { success: true };
  } catch (err) {
    console.error("Update status error:", err);
    return { success: false, error: "Gagal memperbarui status pesanan." };
  }
}

