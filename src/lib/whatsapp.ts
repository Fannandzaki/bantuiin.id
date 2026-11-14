/**
 * WhatsApp Helper Utility for BANTUIIN.ID
 * Centralizes phone number resolution and message encoding.
 */

export function getAdminWhatsAppNumber(): string {
  const raw =
    process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    "6285117783515";
  return raw.replace(/[^0-9]/g, "");
}

export function buildWhatsAppUrl(message: string): string {
  const phone = getAdminWhatsAppNumber();
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export interface CalculatorWhatsAppPayload {
  categoryName: string;
  serviceTitle: string;
  quantity?: number;
  unitName?: string;
  referencesCount?: number;
  deadlineFormatted: string;
  startTimeLabel: string;
  priceEstimateText: string;
  surchargeSummaryText: string;
  includeLearnPackage: boolean;
  infoNotes?: string;
}

export function generateCalculatorWhatsAppMessage(
  data: CalculatorWhatsAppPayload
): string {
  let qtyLine = "";
  if (data.quantity && data.unitName) {
    qtyLine = `• Jumlah       : ${data.quantity} ${data.unitName}\n`;
  }

  let refLine = "";
  if (data.referencesCount && data.referencesCount > 0) {
    refLine = `• Referensi    : ${data.referencesCount} Jurnal Ilmiah\n`;
  }

  let noteLine = "";
  if (data.infoNotes && data.infoNotes.trim()) {
    noteLine = `• Keterangan   : ${data.infoNotes.trim()}\n`;
  }

  const learnLine = data.includeLearnPackage
    ? `• Paket Belajar: YA (Tambah Paket Sekalian Belajar Rp25k–Rp50k)\n`
    : `• Paket Belajar: Tidak\n`;

  return (
    `Halo Tim bantuiin.id, saya ingin konsultasi dan menanyakan estimasi harga pesanan:\n\n` +
    `• Kategori     : ${data.categoryName}\n` +
    `• Layanan      : ${data.serviceTitle}\n` +
    qtyLine +
    refLine +
    noteLine +
    `• Target Waktu : ${data.deadlineFormatted}\n` +
    `• Waktu Mulai  : ${data.startTimeLabel}\n` +
    `• Biaya Tambah : ${data.surchargeSummaryText}\n` +
    learnLine +
    `• Estimasi Biaya: ${data.priceEstimateText}\n\n` +
    `Apakah slot pengerjaan masih tersedia dan bagaimana prosedur pemesanan selanjutnya? Terima kasih!`
  );
}
