"use server";

import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { revalidatePath } from "next/cache";
import { SERVICE_ITEMS } from "@/data/services";
import { verifyAdminSession } from "@/lib/auth/assert-admin";

export interface DbService {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  description: string;
  min_price: number;
  max_price: number;
  price_range_text: string;
  estimated_duration: string;
  badge_label: string | null;
  badge_color: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ServiceInput {
  title: string;
  category_id: string;
  description: string;
  price_range_text: string;
  min_price: number;
  max_price: number;
  estimated_duration: string;
  badge_label?: string;
  badge_color?: string;
  is_active?: boolean;
}

/**
 * Fetch active services for public website with fallback.
 * Publicly accessible (anon).
 */
export async function getDynamicServices(): Promise<DbService[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      // Fallback to static items if DB has no data
      return SERVICE_ITEMS.map((item, idx) => ({
        id: item.id,
        category_id: item.categoryId,
        title: item.title,
        slug: item.id,
        description: item.description,
        min_price: item.minPrice,
        max_price: item.maxPrice,
        price_range_text: item.priceRange,
        estimated_duration: item.estimatedDuration,
        badge_label: item.categoryLabel,
        badge_color: item.tagColor,
        sort_order: idx + 1,
        is_active: true,
      }));
    }

    return data as DbService[];
  } catch (err) {
    console.error("Error fetching dynamic services:", err);
    return SERVICE_ITEMS.map((item, idx) => ({
      id: item.id,
      category_id: item.categoryId,
      title: item.title,
      slug: item.id,
      description: item.description,
      min_price: item.minPrice,
      max_price: item.maxPrice,
      price_range_text: item.priceRange,
      estimated_duration: item.estimatedDuration,
      badge_label: item.categoryLabel,
      badge_color: item.tagColor,
      sort_order: idx + 1,
      is_active: true,
    }));
  }
}

/**
 * Fetch all services (active + inactive) for admin dashboard.
 * Requires admin or staff authorization.
 */
export async function getAllServicesForAdmin(): Promise<DbService[]> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    console.warn("Unauthorized attempt to fetch all services for admin.");
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return getDynamicServices();
    }

    return data as DbService[];
  } catch (err) {
    console.error("Error fetching admin services:", err);
    return getDynamicServices();
  }
}

/**
 * Update an existing service in Supabase and revalidate pages.
 * Requires admin authorization.
 */
export async function updateServiceAction(
  serviceId: string,
  input: Partial<ServiceInput>
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

    const { error } = await supabase
      .from("services")
      .update({
        ...input,
      })
      .eq("id", serviceId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Revalidate public homepage and admin services catalog
    revalidatePath("/");
    revalidatePath("/admin/layanan");

    return { success: true };
  } catch (err) {
    console.error("Update service error:", err);
    return { success: false, error: "Gagal memperbarui data layanan." };
  }
}

/**
 * Create a new service in Supabase.
 * Requires admin authorization.
 */
export async function createServiceAction(
  input: ServiceInput
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

    const slug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const newId = `srv-${Date.now()}`;

    const { error } = await supabase.from("services").insert({
      id: newId,
      category_id: input.category_id,
      title: input.title,
      slug,
      description: input.description,
      min_price: input.min_price,
      max_price: input.max_price,
      price_range_text: input.price_range_text,
      estimated_duration: input.estimated_duration,
      badge_label: input.badge_label || "LAYANAN",
      badge_color: input.badge_color || "bg-blue-100 text-blue-900",
      sort_order: 99,
      is_active: input.is_active ?? true,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/layanan");

    return { success: true };
  } catch (err) {
    console.error("Create service error:", err);
    return { success: false, error: "Gagal menambahkan layanan baru." };
  }
}

/**
 * Delete a service from Supabase.
 * Requires admin authorization.
 */
export async function deleteServiceAction(
  serviceId: string
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

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId);

    if (error) {
      console.error("Delete service error from Supabase:", error);
      return { success: false, error: error.message };
    }

    // Revalidate both public homepage and admin catalog
    revalidatePath("/");
    revalidatePath("/admin/layanan");

    return { success: true };
  } catch (err) {
    console.error("Delete service error:", err);
    return { success: false, error: "Gagal menghapus layanan dari database." };
  }
}
