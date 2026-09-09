import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeader from "@/components/admin/admin-header";
import { auth } from "@/auth";
import { title } from "@/lib/brand";

export const metadata = {
  title: title("Back office"),
  robots: { index: false, follow: false },
};

const AdminLayout = async ({ children }) => {
  const session = await auth();

  if (!session?.user) redirect("/sign-in?callbackUrl=/admin");
  if (session.user.role !== "admin") redirect("/account");

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AdminSidebar name={session.user.name ?? session.user.email} />

        <SidebarInset className="bg-background text-foreground">
          <AdminHeader />

          <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
        </SidebarInset>

        <Toaster position="top-right" />
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default AdminLayout;
