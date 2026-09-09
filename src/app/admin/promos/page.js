import PromoManager from "@/components/admin/promo-manager";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listPromos } from "@/lib/api/admin/promos";

export const dynamic = "force-dynamic";

const PromosPage = async () => {
  const promos = await listPromos();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Promo codes</CardTitle>
        <CardDescription>
          Saving a code that already exists updates it and keeps its redemption
          count.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <PromoManager promos={promos} />
      </CardContent>
    </Card>
  );
};

export default PromosPage;
