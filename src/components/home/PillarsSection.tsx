import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Database,
  FileCode,
  ShieldAlert,
  Palette,
  Presentation,
  Bookmark,
  Image as ImageIcon,
  FileText,
  BookOpen,
  LineChart,
  Globe,
  Monitor,
  Wrench,
  Cpu,
  Flame,
  Zap,
  Check,
} from "lucide-react";

export function PillarsSection() {
  const pillars = [
    {
      id: "coding",
      title: "IT & Coding",
      badge: "HIGH-VALUE",
      badgeBg: "bg-neo-lime text-black",
      headerBg: "bg-neo-blue text-white",
      desc: "Solusi kode bersih, rapi, dan terstruktur untuk proyek kampus atau prototipe bisnis.",
      buttonText: "Pesan Joki Koding",
      items: [
        { icon: Code2, text: "Web Fullstack (HTML, Tailwind, PHP, Laravel)" },
        { icon: Database, text: "Database (ERD, Normalisasi 1NF-BCNF, SQL)" },
        { icon: FileCode, text: "Algoritma & OOP (Python, Java, C++)" },
        { icon: ShieldAlert, text: "Software Testing & Bug Fixing Kilat" },
      ],
    },
    {
      id: "design",
      title: "Desain & UI",
      badge: "TRENDING",
      badgeBg: "bg-slate-200 text-slate-800",
      headerBg: "bg-neo-yellow text-black",
      desc: "Tampilan visual modern standar industri kreatif dengan file master siap pakai.",
      buttonText: "Pesan Desain",
      items: [
        { icon: Palette, text: "UI/UX Design Figma + Prototype Interaktif" },
        { icon: Presentation, text: "Slide Presentasi Sidang & Pitch Deck Estetik" },
        { icon: Bookmark, text: "Branding, Logo + Lembar Filosofi Makna" },
        { icon: ImageIcon, text: "Poster Ilmiah, Flyer & Feed Instagram" },
      ],
    },
    {
      id: "documents",
      title: "Dokumen Riset",
      badge: "FAST DELIVERY",
      badgeBg: "bg-neo-lime text-black",
      headerBg: "bg-neo-lavender text-black",
      desc: "Penulisan presisi, sitasi valid, dan layout rapi bebas revisi format dosen pembimbing.",
      buttonText: "Pesan Dokumen",
      items: [
        { icon: FileText, text: "Makalah, Esai, Resume & Laporan Praktikum" },
        { icon: BookOpen, text: "Formatting Word & Sitasi Mendeley/Zotero" },
        { icon: LineChart, text: "Pengolahan Data Excel & Visualisasi Grafik" },
        { icon: Globe, text: "Translasi Jurnal Internasional + Parafrase" },
      ],
    },
    {
      id: "hardware",
      title: "IT Support",
      badge: "HARDWARE & OS",
      badgeBg: "bg-neo-dark text-yellow-300",
      headerBg: "bg-neo-mint text-black",
      desc: "Perawatan laptop lemot, install software kuliah, dan optimasi performa mesin kerja.",
      buttonText: "Pesan Servis Laptop",
      items: [
        { icon: Monitor, text: "Install Ulang Windows/Linux + Office, SPSS, CAD" },
        { icon: Wrench, text: "Cleaning Debu Fan & Ganti Thermal Paste" },
        { icon: Cpu, text: "Upgrade SSD/RAM + Clone Sistem Operasi" },
        { icon: ShieldAlert, text: "Troubleshoot Blue Screen (BSOD) & Malware" },
      ],
    },
  ];

  return (
    <section id="layanan" className="py-20 bg-white border-b-2 border-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="neo-tag bg-white text-black font-mono mb-3">
              [LAYANAN LENGKAP BANTUIIN.ID]
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight">
              Pilar Solusi: Dari Kodingan Rumit<br className="hidden sm:inline" /> Sampai Servis Mesin
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
            Setiap pekerjaan dikerjakan oleh mentor &amp; teknisi praktisi langsung, bukan calo operan. Standard mutu terukur dan transparan.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {pillars.map((pillar) => (
            <div
              key={pillar.id}
              className="neo-box overflow-hidden flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-neo-lg"
            >
              <div>
                {/* Card Header */}
                <div
                  className={`p-4 border-b-2 border-black flex items-center justify-between ${pillar.headerBg}`}
                >
                  <h3 className="font-heading font-black text-xl tracking-tight">
                    {pillar.title}
                  </h3>
                  <span className={`neo-tag font-mono text-[10px] ${pillar.badgeBg}`}>
                    {pillar.badge}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <p className="text-xs text-slate-600 font-medium mb-5 leading-relaxed">
                    {pillar.desc}
                  </p>
                  <ul className="space-y-3.5">
                    {pillar.items.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <li key={idx} className="flex items-start gap-2.5 text-xs font-bold text-slate-900">
                          <Icon className="h-4 w-4 text-slate-700 shrink-0 mt-0.5" />
                          <span>{item.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="p-5 pt-0">
                <Link
                  href="#format-pemesanan"
                  className="w-full neo-btn-white py-2.5 text-xs font-black flex items-center justify-center gap-1.5 group"
                >
                  <span>{pillar.buttonText}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* 2 Special Add-on Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card Add-on 1: Paket Sekalian Belajar */}
          <div className="neo-box p-6 sm:p-8 bg-white relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-500" />
                  <h4 className="font-heading font-black text-xl text-black">
                    Paket &quot;Sekalian Belajar&quot;
                  </h4>
                </div>
                <span className="neo-tag bg-neo-blue text-white font-mono text-[10px]">
                  FAVORIT MAHASISWA
                </span>
              </div>

              <div className="inline-block bg-neo-yellow px-2.5 py-1 border-2 border-black rounded shadow-neo-sm font-mono text-xs font-black text-black mb-4">
                +Rp25.000 s/d Rp50.000 / Proyek
              </div>

              <p className="text-xs sm:text-sm text-slate-700 font-medium mb-4">
                Bukan cuma dikasih file jadi terus bingung waktu dosen nanya! Kamu dapat:
              </p>

              <ul className="space-y-3 text-xs sm:text-sm font-bold text-slate-900 mb-6">
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-blue-100 border border-black text-neo-blue">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span>Full komentar (commenting) penjelas di setiap baris atau blok kode logika.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-blue-100 border border-black text-neo-blue">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span>Panduan instalasi langkah-demi-langkah (XAMPP, Composer, import database .sql).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-blue-100 border border-black text-neo-blue">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span>Voice note atau screencast video penjelasan alur kerja sistem biar lancar saat presentasi sidang!</span>
                </li>
              </ul>
            </div>

            {/* Quote Box */}
            <div className="p-3.5 border-2 border-black rounded-lg bg-slate-50 text-xs font-mono font-medium text-slate-800 italic">
              &quot;Mahasiswa jadi paham logika aplikasinya dan nggak gelagapan depan dosen penguji.&quot;
            </div>
          </div>

          {/* Card Add-on 2: Biaya Kilat / SKS */}
          <div className="neo-box p-6 sm:p-8 bg-white relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-neo-blue fill-neo-blue" />
                  <h4 className="font-heading font-black text-xl text-black">
                    Biaya Kilat / SKS (Sistem Kebut Semalam)
                  </h4>
                </div>
                <span className="neo-tag bg-neo-lime text-black font-mono text-[10px]">
                  STANDBY 24/7
                </span>
              </div>

              <div className="inline-block bg-neo-lime px-2.5 py-1 border-2 border-black rounded shadow-neo-sm font-mono text-xs font-black text-black mb-4">
                Solusi Panik Menjelang Deadline Subuh
              </div>

              <p className="text-xs sm:text-sm text-slate-700 font-medium mb-4">
                Dosen tiba-tiba majuin deadline? Tugas kelompok ditinggal teman kabur? Kami punya tim shift malam khusus:
              </p>

              <div className="space-y-3 mb-4">
                <div className="p-3 border-2 border-black rounded-lg bg-slate-50 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-black">Deadline &lt; 24 Jam</p>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Pengerjaan prioritas siang-malam berlanjut
                    </p>
                  </div>
                  <span className="neo-tag bg-blue-100 text-neo-blue font-black font-mono">
                    +30% – 50%
                  </span>
                </div>

                <div className="p-3 border-2 border-black rounded-lg bg-red-50/50 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-black">Deadline &lt; 12 Jam (Ultra Kilat)</p>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Eksekusi non-stop instan oleh lead dev/writer
                    </p>
                  </div>
                  <span className="neo-tag bg-red-100 text-red-700 font-black font-mono">
                    +50% – 100%
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-mono">
              *Estimasi penambahan dihitung dari harga dasar tugas setelah brief diverifikasi lengkap.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
