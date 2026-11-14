import { z } from "zod";

export const indonesianPhoneRegex = /^(?:\+62|62|0)8[1-9][0-9]{7,11}$/;

export function normalizeIndonesianPhone(phone?: string | null): string {
  if (!phone) return "WhatsApp Direct";
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    return "62" + cleaned.slice(1);
  }
  if (cleaned.startsWith("62")) {
    return cleaned;
  }
  if (cleaned.startsWith("8")) {
    return "62" + cleaned;
  }
  return cleaned || "WhatsApp Direct";
}

export const digitalTaskOrderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Nama panggilan minimal 2 karakter" })
    .max(100, { message: "Nama terlalu panjang" }),
  contact: z
    .string()
    .trim()
    .refine((val) => !val || indonesianPhoneRegex.test(val), {
      message: "Format nomor WhatsApp tidak valid (Contoh: 08123456789 atau 628123456789)",
    })
    .optional(),
  category: z
    .string()
    .min(1, { message: "Pilih kategori tugas" }),
  outputFormat: z
    .string()
    .trim()
    .min(1, { message: "Format output wajib diisi" }),
  instructions: z
    .string()
    .trim()
    .min(5, { message: "Instruksi minimal 5 karakter" })
    .max(3000, { message: "Instruksi maksimal 3000 karakter" }),
  deadline: z
    .string()
    .trim()
    .min(3, { message: "Tenggat waktu wajib diisi spesifik" }),
  includeLearnPackage: z.boolean().default(false),
  // New priority & after-hours fields
  requestedDeadline: z.string().optional(),
  startTimePreference: z.enum(["asap", "specific_time", "regular_hours"]).default("asap"),
  requestedStartTime: z.string().optional(),
});

export const hardwareServiceOrderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Nama panggilan minimal 2 karakter" })
    .max(100, { message: "Nama terlalu panjang" }),
  contact: z
    .string()
    .trim()
    .refine((val) => !val || indonesianPhoneRegex.test(val), {
      message: "Format nomor WhatsApp tidak valid (Contoh: 08123456789 atau 628123456789)",
    })
    .optional(),
  issue: z
    .string()
    .min(1, { message: "Pilih kendala/layanan servis" }),
  laptopModel: z
    .string()
    .trim()
    .min(2, { message: "Merk/Tipe laptop wajib diisi" }),
  deliveryMethod: z.string().default("Drop-off ke Lokasi Admin"),
  expectedCompletion: z
    .string()
    .trim()
    .min(3, { message: "Target waktu selesai wajib diisi" }),
  acceptsDataDisclaimer: z.boolean().default(false),
  // New priority & after-hours fields
  requestedDeadline: z.string().optional(),
  startTimePreference: z.enum(["asap", "specific_time", "regular_hours"]).default("asap"),
  requestedStartTime: z.string().optional(),
});

export type DigitalTaskOrderValues = z.infer<typeof digitalTaskOrderSchema>;
export type HardwareServiceOrderValues = z.infer<typeof hardwareServiceOrderSchema>;
