"use client";

import { useState } from "react";
import { ChevronDown, Share2, Shield, DollarSign, Infinity as InfinityIcon } from "lucide-react";

export function TermsAndReferralSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const policies = [
    {
      title: "1. Sistem DP 50% & Pembayaran Fleksibel",
      content:
        "Klien wajib membayarkan DP minimal 50% di awal sebagai tanda jadi sebelum pengerjaan dimulai. Untuk transaksi di bawah Rp50.000 atau kategori kilat (< 12 jam), wajib melakukan Full Payment (100%). Pesanan baru dimasukkan ke antrean pengerjaan segera setelah bukti pembayaran diverifikasi admin.",
    },
    {
      title: "2. Gratis Revisi Minor 2–3x (Klaim 2x24 Jam)",
      content:
        "Setiap pesanan berhak atas garansi revisi minor 2–3 kali (perbaikan salah ketik, penyesuaian warna, pergeseran layout ringan) yang mengacu pada brief instruksi awal. Penambahan fitur baru di luar kesepakatan awal dikenakan biaya revisi mayor. Masa klaim garansi berlaku 2x24 jam sejak file hasil/preview dikirimkan.",
    },
    {
      title: "3. Kebijakan Refund 100% Jika Gagal Penuhi Deadline",
      content:
        "Jika pembatalan atau keterlambatan terjadi murni karena kendala internal dari tim Bantuiin.id (misalnya gagal memenuhi deadline yang disepakati bersama), maka dana klien akan dikembalikan 100% (Full Refund) tanpa potongan apapun.",
    },
    {
      title: "4. Jaminan Kerahasiaan Klien 100% (Non-Disclosure)",
      content:
        "Seluruh data pribadi klien, nomor telepon, nama kampus/instansi, serta isi dokumen tugas dijamin kerahasiaannya 100%. Kami tidak pernah mempublikasikan tugas atau identitas Anda ke portofolio media sosial publik tanpa persetujuan tertulis eksplisit dari Anda.",
    },
    {
      title: "5. Garansi Servis Laptop & Software Selama 7 Hari",
      content:
        "Bantuiin.id memberikan garansi sistem (software) selama 7 hari pasca serah-terima perangkat. Klien wajib melakukan backup data penting secara mandiri sebelum servis. Garansi komponen keras (hardware) mengikuti masa garansi resmi dari toko/distributor terkait.",
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="aturan-garansi" className="py-20 bg-white border-b-2 border-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="neo-tag bg-white text-black font-mono mb-3">
            [KEBIJAKAN &amp; GARANSI]
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight mb-3">
            Aturan Main Adil &amp; Transparan
          </h2>
          <p className="text-sm sm:text-base text-slate-700 font-medium">
            Standar Operasional Prosedur (SOP) yang jelas untuk melindungi kepuasan klien dan menjaga kualitas hasil pengerjaan.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Accordion */}
          <div className="lg:col-span-7 space-y-3">
            {policies.map((policy, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="neo-box overflow-hidden bg-white transition-all shadow-neo-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-heading font-black text-sm sm:text-base text-black hover:bg-slate-50 transition-colors"
                  >
                    <span>{policy.title}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-black shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-neo-blue" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed border-t border-slate-100">
                      {policy.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Referral Program Card */}
          <div className="lg:col-span-5 neo-box p-6 sm:p-8 bg-white shadow-neo-lg relative overflow-hidden flex flex-col justify-between">
            <div>
              {/* Title with Emoji from Figma */}
              <h3 className="font-heading font-black text-xl text-black mb-4 flex items-center gap-2">
                <span>🎁</span>
                <span>Program Referral Teman</span>
              </h3>

              {/* Yellow Highlight Box */}
              <div className="p-3.5 border-2 border-black rounded-lg bg-neo-yellow text-black font-heading font-black text-sm sm:text-base leading-snug mb-5 shadow-neo-sm">
                Dapatkan Diskon Rp10.000 – Rp25.000 atau Komisi 10% Cash!
              </div>

              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-6">
                Punya teman satu kelas atau kelompok tugas yang lagi pusing dikejar deadline? Ajak mereka order tugas di bantuiin.id!
              </p>

              <ul className="space-y-3.5 text-xs sm:text-sm font-bold text-slate-800 mb-8">
                <li className="flex items-start gap-2.5">
                  <Shield className="h-4 w-4 text-neo-blue shrink-0 mt-0.5" />
                  <span>Temanmu dapat diskon langsung saat order pertama.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <DollarSign className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Kamu dapat cashback komisi 10% yang langsung cair ke e-wallet.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <InfinityIcon className="h-4 w-4 text-neo-blue shrink-0 mt-0.5" />
                  <span>Berlaku kelipatan tanpa batas kuota teman!</span>
                </li>
              </ul>
            </div>

            {/* Button */}
            <button
              type="button"
              onClick={() => {
                const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "6282100000000";
                const msg = encodeURIComponent(
                  "Halo Admin Bantuiin.id, saya mau klaim / dapatkan link referral teman!"
                );
                window.open(`https://wa.me/${adminPhone}?text=${msg}`, "_blank");
              }}
              className="w-full neo-btn-blue py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 group"
            >
              <Share2 className="h-4 w-4" />
              <span>Dapatkan Link Referral Kamu</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
