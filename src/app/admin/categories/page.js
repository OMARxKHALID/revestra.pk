import { HangerIcon } from "@hugeicons/core-free-icons";
import PageLayout from "@/components/admin/page-layout";
import PageHeader from "@/components/admin/page-header";
import CategoryManager from "@/components/admin/category-manager";
import Pager from "@/components/admin/pager";
import { listCategories } from "@/lib/api/categories";
import { countProductsByCategory } from "@/lib/api/admin/products";
import { listQuerySchema } from "@/lib/schemas/admin";
import { title } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: title("Categories"),
  robots: { index: false, follow: false },
};

const CategoriesPage = async ({ searchParams }) => {
  const { page, perPage } = listQuerySchema.parse(await searchParams);

  const [categories, counts] = await Promise.all([
    listCategories({ includeInactive: true }),
    countProductsByCategory(),
  ]);

  const total = categories.length;
  const visible = categories.slice((page - 1) * perPage, page * perPage);

  return (
    <PageLayout>
      <PageHeader
        title="Categories"
        description="What a piece can be filed under, and which measurements each one demands."
        icon={HangerIcon}
      />

      <CategoryManager categories={visible} counts={counts} total={total} />

      <Pager page={page} perPage={perPage} total={total} />
    </PageLayout>
  );
};

export default CategoriesPage;
