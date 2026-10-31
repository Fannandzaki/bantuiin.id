import { getAllServicesForAdmin } from "@/app/actions/services";
import { ServicesManager } from "@/components/admin/ServicesManager";

export const dynamic = "force-dynamic";

export default async function AdminLayananPage() {
  const services = await getAllServicesForAdmin();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-black">
            Manajemen Layanan &amp; Penyesuaian Harga
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Ubah rentang harga dasar, batas waktu estimasi, atau sembunyikan/tambahkan layanan baru. Perubahan langsung aktif di website publik.
          </p>
        </div>
      </div>

      {/* Interactive Manager */}
      <ServicesManager initialServices={services} />
    </div>
  );
}
