import { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { verifyAdminSession } from "@/lib/auth/assert-admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const auth = await verifyAdminSession();

  if (!auth.authorized) {
    redirect("/admin/login?error=unauthorized");
  }

  return (
    <div className="min-h-screen bg-neo-surface flex flex-col font-body">
      <AdminNav />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
