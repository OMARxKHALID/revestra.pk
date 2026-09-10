import PageLayout from "@/components/admin/page-layout";
import Spinner from "@/components/ui/spinner";

const AdminLoader = ({ label = "Loading" }) => (
  <PageLayout>
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4"
    >
      <Spinner size="lg" className="text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  </PageLayout>
);

export default AdminLoader;
