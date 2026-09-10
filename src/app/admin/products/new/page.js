import { HangerIcon } from "@hugeicons/core-free-icons";
import PageLayout from "@/components/admin/page-layout";
import PageHeader from "@/components/admin/page-header";
import ProductForm from "@/components/admin/product-form";
import { listCategories } from "@/lib/api/categories";
import { Card, CardContent } from "@/components/ui/card";
import { listImageLibrary, nextSku } from "@/lib/api/admin/products";

export const dynamic = "force-dynamic";

const NewProductPage = async () => {
  const [sku, categories, existingImages] = await Promise.all([
    nextSku(),
    listCategories({ includeInactive: true }),
    listImageLibrary(),
  ]);

  return (
    <PageLayout>
      <PageHeader
        title="Add a piece"
        description="Measurements are required for most categories. Prices are in rupees."
        icon={HangerIcon}
      />

      <Card>
        <CardContent>
          <ProductForm
            categories={categories}
            suggestedSku={sku}
            existingImages={existingImages}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default NewProductPage;
