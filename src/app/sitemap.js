import { getSellableProducts } from "@/lib/api/products";
import { listCategories } from "@/lib/api/categories";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const sitemap = async () => {
  const products = await getSellableProducts().catch(() => []);
  const categories = await listCategories().catch(() => []);
  const lastModified = new Date();

  return [
    { url: `${BASE_URL}/`, lastModified, priority: 1 },
    { url: `${BASE_URL}/products`, lastModified, priority: 0.8 },
    { url: `${BASE_URL}/reviews`, lastModified, priority: 0.5 },
    ...categories.map(({ slug }) => ({
      url: `${BASE_URL}/products/category/${slug}`,
      lastModified,
      priority: 0.7,
    })),
    ...products
      .filter((product) => product.status !== "sold")
      .map(({ slug }) => ({
        url: `${BASE_URL}/products/${slug}`,
        lastModified,
        priority: 0.6,
      })),
  ];
};

export default sitemap;
