import { getAdminOrders } from "@/app/actions/admin-orders";
import { OrdersManager } from "@/components/admin/OrdersManager";

export const dynamic = "force-dynamic";

export default async function AdminPesananPage() {
  const orders = await getAdminOrders();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-black">
            Manajemen Antrean Pesanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Filter, tinjau brief, perbarui status pengerjaan, dan komunikasikan dengan klien.
          </p>
        </div>
      </div>

      <OrdersManager initialOrders={orders} />
    </div>
  );
}

