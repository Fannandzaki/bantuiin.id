import { z } from "zod";

export const digitalTaskOrderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Nama panggilan minimal 2 karakter" })
    .max(100, { message: "Nama terlalu panjang" }),
  contact: z
    .string()
    .trim()
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
  acceptsDataDisclaimer: z.boolean().refine((val) => val === true, {
    message: "Wajib menyetujui disclaimer backup data sebelum servis",
  }),
});

export type DigitalTaskOrderValues = z.input<typeof digitalTaskOrderSchema>;
export type HardwareServiceOrderValues = z.input<typeof hardwareServiceOrderSchema>;
