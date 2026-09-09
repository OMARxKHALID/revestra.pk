import { getProductBySlug } from "@/lib/api/products";

export const dynamic = "force-dynamic";

export const GET = async (_request, { params }) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({
    slug: product.slug,
    status: product.status,
    reservedUntil: product.reservedUntil ?? null,
  });
};
