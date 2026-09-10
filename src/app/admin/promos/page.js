import { Coupon01Icon } from "@hugeicons/core-free-icons";
import PageLayout from "@/components/admin/page-layout";
import PageHeader from "@/components/admin/page-header";
import PromoManager from "@/components/admin/promo-manager";
import { Card, CardContent } from "@/components/ui/card";
import { listPromos } from "@/lib/api/admin/promos";

export const dynamic = "force-dynamic";

const PromosPage = async () => {
  const promos = await listPromos();

  return (
    <PageLayout>
      <PageHeader
        title="Promo codes"
        description="Saving a code that already exists updates it and keeps its redemption count."
        icon={Coupon01Icon}
      />

      <Card>
        <CardContent>
          <PromoManager promos={promos} />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default PromosPage;
