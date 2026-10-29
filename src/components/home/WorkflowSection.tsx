export function WorkflowSection() {
  const steps = [
    {
      number: "01",
      numberBg: "bg-neo-blue text-white",
      title: "Konsultasi & Format",
      desc: "Kirim instruksi, modul, dan deadline via generator di bawah.",
      footText: "Format Otomatis",
      footColor: "text-neo-blue",
    },
    {
      number: "02",
      numberBg: "bg-neo-lime text-black",
      title: "Analisis & Deal",
      desc: "Tim bedah tingkat kesulitan dan sepakati total harga fix.",
      footText: "No Hidden Cost",
      footColor: "text-amber-700",
    },
    {
      number: "03",
      numberBg: "bg-neo-yellow text-black",
      title: "DP 50% & Eksekusi",
      desc: "Transfer DP via QRIS/Bank, pengerjaan langsung jalan.",
      footText: "Progress Update",
      footColor: "text-amber-700",
    },
    {
      number: "04",
      numberBg: "bg-indigo-200 text-black",
      title: "Preview Hasil",
      desc: "Kami kirim video demo/screenshot bukti sebelum bayar sisa.",
      footText: "Transparan & Aman",
      footColor: "text-neo-blue",
    },
    {
      number: "05",
      numberBg: "bg-neo-lime text-black",
      title: "Pelunasan & Arsip",
      desc: "Terima file master .ZIP/.DOCX + aktif garansi revisi 2x24 jam.",
      footText: "Garansi Siap Pakai",
      footColor: "text-emerald-700",
    },
  ];

  return (
    <section id="cara-order" className="py-20 bg-white border-b-2 border-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Big Enclosing Container from Figma */}
        <div className="neo-box p-6 sm:p-10 lg:p-12 bg-white shadow-neo-lg">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="neo-tag bg-neo-lime text-black font-mono mb-3">
              [SOP PENGERJAAN]
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight mb-3">
              5 Langkah Pasti Tanpa Drama
            </h2>
            <p className="text-sm sm:text-base text-slate-700 font-medium">
              Sistem anti-ghosting dengan perlindungan privasi data tingkat tinggi.
            </p>
          </div>

          {/* 5 Steps Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="neo-box p-5 bg-white flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-neo"
              >
                <div>
                  {/* Number Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center justify-center h-8 w-8 rounded border-2 border-black font-mono font-black text-xs shadow-neo-sm ${step.numberBg}`}
                    >
                      {step.number}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-heading font-black text-sm text-black mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                    {step.desc}
                  </p>
                </div>

                {/* Footer Tag / Link */}
                <div className="pt-3 border-t border-slate-100">
                  <span className={`text-[11px] font-mono font-bold ${step.footColor}`}>
                    {step.footText}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
