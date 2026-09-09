import { getAllProducts } from "@/lib/api/products";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const sitemap = async () => {
  const products = await getAllProducts();
  const lastModified = new Date();

  return [
    { url: `${BASE_URL}/`, lastModified, priority: 1 },
    { url: `${BASE_URL}/products`, lastModified, priority: 0.8 },
    ...products.map(({ slug }) => ({
      url: `${BASE_URL}/products/${slug}`,
      lastModified,
      priority: 0.6,
    })),
  ];
};

export default sitemap;
