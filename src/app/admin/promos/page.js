import { Coupon01Icon } from "@hugeicons/core-free-icons";
import PageLayout from "@/components/admin/page-layout";
import PageHeader from "@/components/admin/page-header";
import PromoManager from "@/components/admin/promo-manager";
import { Card, CardContent } from "@/components/ui/card";
import Pager from "@/components/admin/pager";
import { listPromos } from "@/lib/api/admin/promos";
import { listQuerySchema } from "@/lib/schemas/admin";

export const dynamic = "force-dynamic";

const PromosPage = async ({ searchParams }) => {
  const query = listQuerySchema.parse(await searchParams);
  const { promos, total, page, perPage } = await listPromos(query);

  return (
    <PageLayout>
      <PageHeader
        title="Promo codes"
        description="Saving a code that already exists updates it and keeps its redemption count."
        icon={Coupon01Icon}
      />

      <Card>
        <CardContent className="grid gap-4">
          <PromoManager promos={promos} />

          <Pager page={page} perPage={perPage} total={total} />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default PromosPage;
