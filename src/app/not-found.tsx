import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neo-surface flex items-center justify-center p-4 font-body">
      <div className="neo-box p-8 max-w-md w-full bg-white text-center shadow-neo-lg">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-neo-yellow border-2 border-black shadow-neo-sm mb-4">
          <AlertTriangle className="h-7 w-7 text-black" />
        </div>
        <div className="neo-tag bg-neo-lime text-black font-mono mb-3">
          ERROR 404
        </div>
        <h1 className="font-heading text-2xl font-black text-black mb-2">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mb-6 leading-relaxed">
          Halaman yang Anda tuju mungkin sudah dipindahkan atau URL yang dimasukkan salah.
        </p>
        <Link
          href="/"
          className="neo-btn-dark py-3 px-5 text-xs font-black inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
