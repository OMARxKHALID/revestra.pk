import Link from "next/link";
import { FileImportIcon } from "@hugeicons/core-free-icons";
import PageLayout from "@/components/admin/page-layout";
import PageHeader from "@/components/admin/page-header";
import ProductImport from "@/components/admin/product-import";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const ImportPage = () => (
  <PageLayout>
    <PageHeader
      title="Import pieces"
      description="Add a whole bale at once from a spreadsheet. Check the file first, then import the rows that pass."
      icon={FileImportIcon}
    >
      <Button variant="outline" render={<Link href="/admin/products" />}>
        Back to inventory
      </Button>
    </PageHeader>

    <ProductImport />
  </PageLayout>
);

export default ImportPage;
