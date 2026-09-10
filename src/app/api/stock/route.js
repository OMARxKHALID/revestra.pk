import { stockQuerySchema } from "@/lib/schemas/product";
import { getSellableProducts } from "@/lib/api/products";

export const dynamic = "force-dynamic";

export const GET = async (request) => {
  const { searchParams } = new URL(request.url);
  const parsed = stockQuerySchema.safeParse({ slugs: searchParams.getAll("slug") });

  if (!parsed.success)
    return Response.json({ error: "Invalid request" }, { status: 422 });

  const products = await getSellableProducts();
  const known = new Map(products.map((product) => [product.slug, product]));

  return Response.json({
    stock: parsed.data.slugs.map((slug) => {
      const product = known.get(slug);

      if (!product) return { slug, status: "gone", reservedUntil: null };

      return {
        slug,
        status: product.status,
        reservedUntil: product.reservedUntil ?? null,
      };
    }),
  });
};
