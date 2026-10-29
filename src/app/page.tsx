import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { PillarsSection } from "@/components/home/PillarsSection";
import { PricingCatalogSection } from "@/components/home/PricingCatalogSection";
import { WorkflowSection } from "@/components/home/WorkflowSection";
import { OrderGeneratorSection } from "@/components/home/OrderGeneratorSection";
import { TermsAndReferralSection } from "@/components/home/TermsAndReferralSection";
import { Footer } from "@/components/layout/Footer";
import {
  Send,
  Calculator,
  Lock,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Copy,
  Award,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-body">
      {/* 1. Header Navigation */}
      <Navbar />

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b-2 border-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7">
              {/* Security Pill Badge */}
              <div className="inline-flex items-center gap-2 neo-pill bg-white text-black text-xs font-mono mb-6">
                <Lock className="h-3.5 w-3.5 text-neo-blue" />
                <span>100% Privasi Terenkripsi &amp; Anti-Ghosting Terverifikasi</span>
              </div>

              {/* Main Headline with Space Grotesk */}
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-black mb-5">
                TUGAS BERES<br />
                <span className="inline-block bg-neo-lime px-3 py-1 my-1 border-2 border-black rounded shadow-neo transform -rotate-1">
                  TANPA STRES!
                </span>
                <br />
                <span className="text-neo-blue">
                  Asisten Proyek Digital,
                </span>
                <br />
                <span>Koding &amp; Riset Akademikmu.</span>
              </h1>

              {/* Description */}
              <p className="mt-4 text-base sm:text-lg text-slate-700 max-w-2xl leading-relaxed font-medium">
                Mulai dari pembuatan web fullstack Laravel &amp; Tailwind, UI/UX Figma prototyping,
                audit makalah Mendeley, hingga perbaikan &amp; repaste laptop overheat. Cepat,
                tuntas, dan bisa sekalian diajarin alur logikanya sampai siap sidang!
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="#format-pemesanan"
                  className="neo-btn-blue py-3.5 px-6 text-sm sm:text-base font-black flex items-center gap-2 group"
                >
                  <Send className="h-4 w-4" />
                  <span>Pesan Sekarang via WhatsApp</span>
                </Link>

                <Link
                  href="#katalog-harga"
                  className="neo-btn-white py-3.5 px-6 text-sm sm:text-base font-black flex items-center gap-2"
                >
                  <Calculator className="h-4 w-4 text-slate-700" />
                  <span>Simulasi &amp; Lihat Harga</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-6 text-xs sm:text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>450+ Mahasiswa Terbantu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span>Rata-rata Respon &lt; 5 Menit</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-neo-blue" />
                  <span>Bebas Plagiasi Turnitin</span>
                </div>
              </div>
            </div>

            {/* Right Column: Cards Graphic matching Figma */}
            <div className="lg:col-span-5 relative space-y-4">
              
              {/* Tilted Sticky Note Badge */}
              <div className="absolute -top-6 -right-2 z-20 bg-neo-yellow text-black font-black text-xs px-3.5 py-1.5 border-2 border-black rounded shadow-neo transform rotate-3 flex items-center gap-1.5 font-mono">
                <Award className="h-4 w-4" />
                <span>Garansi Revisi 2x24 Jam</span>
              </div>

              {/* Card 1: Status Proyek Aktif */}
              <div className="neo-box p-5 bg-white shadow-neo">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-black">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                    <span>STATUS PROYEK: AKTIF</span>
                  </div>
                  <span className="neo-tag bg-neo-lime text-black font-mono">
                    Nilai Prediksi: A
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Implementasi CRUD + Auth Sanctum</span>
                    <span className="text-emerald-700 font-mono">100% Selesai ✔</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-100 border-2 border-black rounded overflow-hidden">
                    <div className="h-full bg-neo-blue w-full"></div>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium pt-1">
                    Catatan: Dokumentasi API Postman &amp; DDL SQL sudah dibundel dalam arsip master.
                  </p>
                </div>
              </div>

              {/* Card 2: Dark Code Window */}
              <div className="neo-box bg-neo-dark text-white p-5 overflow-hidden shadow-neo-lg">
                {/* Header Dots & File Name */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500 border border-black inline-block"></span>
                    <span className="h-3 w-3 rounded-full bg-yellow-400 border border-black inline-block"></span>
                    <span className="h-3 w-3 rounded-full bg-green-500 border border-black inline-block"></span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    App/Services/BantuiinCore.php
                  </span>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </button>
                </div>

                {/* PHP Code from Figma */}
                <pre className="font-mono text-xs sm:text-[13px] leading-relaxed text-slate-300 overflow-x-auto">
                  <code>
                    <div><span className="text-pink-400">class</span> <span className="text-yellow-300">MahasiswaTerselamatkan</span> {"{"}</div>
                    <div className="pl-4"><span className="text-pink-400">public function</span> <span className="text-blue-400">eksekusiTugas</span>($deadline) {"{"}</div>
                    <div className="pl-8 text-slate-500">{"// Solusi bersih, clean code, siap sidang"}</div>
                    <div className="pl-8">$status = Bantuiin::<span className="text-blue-400">kerjakan</span>(</div>
                    <div className="pl-12">bebasPlagiasi: <span className="text-neo-lime">true</span>,</div>
                    <div className="pl-12">garansiRevisi: <span className="text-amber-300">&apos;2x24 Jam&apos;</span>,</div>
                    <div className="pl-12">sertakanPenjelasan: <span className="text-neo-lime">true</span></div>
                    <div className="pl-8">);</div>
                    <div className="pl-8"><span className="text-pink-400">return</span> $status-&gt;<span className="text-blue-400">kirimTepatWaktu</span>();</div>
                    <div className="pl-4">{"}"}</div>
                    <div>{"}"}</div>
                  </code>
                </pre>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3. Marquee Ticker Banner */}
      <section className="bg-neo-dark text-white border-b-2 border-black py-3 overflow-hidden">
        <div className="animate-marquee font-mono font-bold uppercase text-xs sm:text-sm tracking-wider flex items-center gap-8 whitespace-nowrap">
          <span className="flex items-center gap-2">⚡ WEB DEVELOPMENT &amp; FULLSTACK</span>
          <span className="text-neo-lime">•</span>
          <span className="flex items-center gap-2">🗄 DATABASE ERD &amp; SQL QUERY</span>
          <span className="text-neo-lime">•</span>
          <span className="flex items-center gap-2">🎨 UI/UX FIGMA &amp; WIREFRAME</span>
          <span className="text-neo-lime">•</span>
          <span className="flex items-center gap-2">📝 MAKALAH &amp; SITASI MENDELEY OTOMATIS</span>
          <span className="text-neo-lime">•</span>
          <span className="flex items-center gap-2">🔧 SERVIS &amp; UPGRADE HARDWARE LAPTOP</span>
          <span className="text-neo-lime">•</span>
          {/* Loop duplicates */}
          <span className="flex items-center gap-2">⚡ WEB DEVELOPMENT &amp; FULLSTACK</span>
          <span className="text-neo-lime">•</span>
          <span className="flex items-center gap-2">🗄 DATABASE ERD &amp; SQL QUERY</span>
          <span className="text-neo-lime">•</span>
          <span className="flex items-center gap-2">🎨 UI/UX FIGMA &amp; WIREFRAME</span>
          <span className="text-neo-lime">•</span>
          <span className="flex items-center gap-2">📝 MAKALAH &amp; SITASI MENDELEY OTOMATIS</span>
          <span className="text-neo-lime">•</span>
          <span className="flex items-center gap-2">🔧 SERVIS &amp; UPGRADE HARDWARE LAPTOP</span>
          <span className="text-neo-lime">•</span>
        </div>
      </section>

      {/* 4. Pilar Solusi & Add-ons */}
      <PillarsSection />

      {/* 5. Katalog Harga & Estimasi Pengerjaan */}
      <PricingCatalogSection />

      {/* 6. 5 Langkah Pasti Tanpa Drama (Workflow) */}
      <WorkflowSection />

      {/* 7. Generator Format Order Otomatis ke WhatsApp */}
      <OrderGeneratorSection />

      {/* 8. Aturan Main Adil & Transparan (ToS + Referral) */}
      <TermsAndReferralSection />

      {/* 9. Footer */}
      <Footer />
    </div>
  );
}
