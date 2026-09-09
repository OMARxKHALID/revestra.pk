import ProductForm from "@/components/admin/product-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { nextSku } from "@/lib/api/admin/products";

export const dynamic = "force-dynamic";

const NewProductPage = async () => {
  const sku = await nextSku();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a piece</CardTitle>
        <CardDescription>
          Measurements are required for most categories. Prices are in rupees.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ProductForm suggestedSku={sku} />
      </CardContent>
    </Card>
  );
};

export default NewProductPage;
