"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { adminLogin, type AuthResult } from "@/app/actions/auth";
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (prevState: AuthResult | null, formData: FormData) => {
      const result = await adminLogin(prevState, formData);
      if (result.success) {
        router.push("/admin");
        router.refresh();
      }
      return result;
    },
    null
  );

  return (
    <div className="min-h-screen bg-neo-surface flex flex-col justify-center items-center p-4 sm:p-6 font-body">
      
      {/* Container Box */}
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex justify-center mb-3">
            <BrandLogo size="default" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="neo-tag bg-neo-yellow text-black font-mono text-[11px]">
              ADMINISTRATOR LOGIN
            </span>
            <span className="neo-tag bg-neo-lime text-black font-mono text-[11px] flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              RESTRICTED AREA
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="neo-box p-6 sm:p-8 bg-white shadow-neo-lg">
          <div className="mb-6">
            <h1 className="font-heading font-black text-2xl text-black">
              Masuk ke Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Kelola antrean tugas, penawaran harga, dan konfirmasi pembayaran BANTUIN.ID.
            </p>
          </div>

          {/* Error Alert */}
          {state?.error && (
            <div className="mb-5 p-3.5 border-2 border-black rounded-lg bg-red-100 text-red-900 flex items-start gap-2.5 text-xs font-bold shadow-neo-sm">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Form */}
          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-black uppercase text-slate-800 mb-1"
              >
                Email Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@bantuiin.id"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm font-medium border-2 border-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neo-lime"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-black uppercase text-slate-800 mb-1"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm font-medium border-2 border-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neo-lime"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full neo-btn-lime py-3 text-sm font-black flex items-center justify-center gap-2 mt-2 disabled:opacity-60 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                  <span>Memverifikasi Kredensial...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Masuk ke Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Return to Public Website */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <Link
              href="/"
              className="text-xs font-bold text-slate-600 hover:text-black hover:underline"
            >
              ← Kembali ke Beranda Website
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
