import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/requireRole";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const viewer = await requireAdmin();

  return (
    <AdminShell
      role={viewer.role}
      email={viewer.email}
      impersonating={viewer.impersonating}
    >
      {children}
    </AdminShell>
  );
}
