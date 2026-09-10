import { HangerIcon } from "@hugeicons/core-free-icons";
import PageLayout from "@/components/admin/page-layout";
import PageHeader from "@/components/admin/page-header";
import CategoryManager from "@/components/admin/category-manager";
import { listCategories } from "@/lib/api/categories";
import { countProductsByCategory } from "@/lib/api/admin/products";
import { title } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: title("Categories"),
  robots: { index: false, follow: false },
};

const CategoriesPage = async () => {
  const [categories, counts] = await Promise.all([
    listCategories({ includeInactive: true }),
    countProductsByCategory(),
  ]);

  return (
    <PageLayout>
      <PageHeader
        title="Categories"
        description="What a piece can be filed under, and which measurements each one demands."
        icon={HangerIcon}
      />

      <CategoryManager categories={categories} counts={counts} />
    </PageLayout>
  );
};

export default CategoriesPage;
