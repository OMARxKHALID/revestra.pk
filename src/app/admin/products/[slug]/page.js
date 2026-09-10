import { notFound } from "next/navigation";
import Link from "next/link";
import { HangerIcon } from "@hugeicons/core-free-icons";
import PageLayout from "@/components/admin/page-layout";
import PageHeader from "@/components/admin/page-header";
import ProductForm from "@/components/admin/product-form";
import { listCategories } from "@/lib/api/categories";
import { Card, CardContent } from "@/components/ui/card";
import { getProduct, listImageLibrary } from "@/lib/api/admin/products";

export const dynamic = "force-dynamic";

const EditProductPage = async ({ params }) => {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const [categories, existingImages] = await Promise.all([
    listCategories({ includeInactive: true }),
    listImageLibrary(),
  ]);

  return (
    <PageLayout>
      <PageHeader
        title={product.name}
        icon={HangerIcon}
        description={
          <>
            {product.sku} ·{" "}
            <Link
              href={`/products/${product.slug}`}
              className="underline underline-offset-4"
            >
              View on the storefront
            </Link>
          </>
        }
      />

      <Card>
        <CardContent>
          <ProductForm
            categories={categories}
            product={product}
            existingImages={existingImages}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default EditProductPage;
