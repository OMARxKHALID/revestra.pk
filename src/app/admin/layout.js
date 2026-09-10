import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeader from "@/components/admin/admin-header";
import { auth } from "@/auth";
import { ROLE } from "@/lib/roles";
import { title } from "@/lib/brand";

export const metadata = {
  title: title("Back office"),
  robots: { index: false, follow: false },
};

const AdminLayout = async ({ children }) => {
  const session = await auth();

  if (!session?.user) redirect("/sign-in?callbackUrl=/admin");
  if (session.user.role !== ROLE.admin) redirect("/account");

  return (
    <TooltipProvider>
      <SidebarProvider className="admin-theme min-h-svh bg-background font-sans">
        <AdminSidebar name={session.user.name ?? session.user.email} />

        <SidebarInset className="bg-background text-foreground">
          <AdminHeader />

          {children}
        </SidebarInset>

        <Toaster position="top-right" />
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default AdminLayout;
