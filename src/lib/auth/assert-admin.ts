import { createClient } from "@/lib/supabase/server";

export interface AdminAuthVerification {
  authorized: boolean;
  userId?: string;
  role?: "admin" | "staff";
  error?: string;
}

/**
 * Server-side guard to verify user session and administrative role.
 * Enforces Defense-in-Depth for Server Actions and Server Components.
 */
export async function verifyAdminSession(): Promise<AdminAuthVerification> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl && !supabaseUrl.includes("placeholder-id");

  if (!isConfigured) {
    return {
      authorized: false,
      error: "Sistem database belum terkonfigurasi dengan benar.",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        authorized: false,
        error: "Sesi otentikasi tidak valid atau telah kedaluwarsa.",
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !profile ||
      (profile.role !== "admin" && profile.role !== "staff")
    ) {
      return {
        authorized: false,
        error: "Akses ditolak: akun tidak memiliki hak akses administratif.",
      };
    }

    return {
      authorized: true,
      userId: user.id,
      role: profile.role as "admin" | "staff",
    };
  } catch (err) {
    console.error("Verification error:", err);
    return {
      authorized: false,
      error: "Gagal memverifikasi kredensial administratif.",
    };
  }
}
