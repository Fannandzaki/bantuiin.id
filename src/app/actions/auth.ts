"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

export interface AuthResult {
  success: boolean;
  error?: string;
  isMockFallback?: boolean;
}

/**
 * Validates and logs in an admin user using Supabase Auth.
 * Adheres to SYSTEM_RULES: No hardcoded credentials.
 */
export async function adminLogin(
  prevState: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Input tidak valid",
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured =
    supabaseUrl && !supabaseUrl.includes("placeholder-id");

  if (!isSupabaseConfigured) {
    return {
      success: false,
      error:
        "Supabase belum terhubung. Konfigurasikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY pada .env.local terlebih dahulu.",
    };
  }

  try {
    const supabase = await createClient();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || "Email atau password salah",
      };
    }

    // Verify user has admin or staff role in public.profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile || (profile.role !== "admin" && profile.role !== "staff")) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Akses ditolak. Akun Anda tidak memiliki hak akses admin.",
      };
    }

    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (err) {
    console.error("Login unexpected error:", err);
    return {
      success: false,
      error: "Terjadi kesalahan internal pada server autentikasi.",
    };
  }
}

/**
 * Logs out the current admin user session.
 */
export async function adminLogout(): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (err) {
    console.error("Logout error:", err);
    return { success: false };
  }
}

/**
 * Check if current user is an authenticated admin/staff.
 */
export async function getAdminUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured =
    supabaseUrl && !supabaseUrl.includes("placeholder-id");

  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: profile.full_name,
      role: profile.role,
    };
  } catch {
    return null;
  }
}

