import { notFound } from "next/navigation";
import Link from "next/link";
import ProductForm from "@/components/admin/product-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProduct } from "@/lib/api/admin/products";

export const dynamic = "force-dynamic";

const EditProductPage = async ({ params }) => {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>
          {product.sku} ·{" "}
          <Link
            href={`/products/${product.slug}`}
            className="underline underline-offset-4"
          >
            View on the storefront
          </Link>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ProductForm product={product} />
      </CardContent>
    </Card>
  );
};

export default EditProductPage;
