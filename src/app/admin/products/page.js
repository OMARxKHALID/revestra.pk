import Link from "next/link";
import Image from "next/image";
import FilterBar from "@/components/admin/filter-bar";
import Pager from "@/components/admin/pager";
import StatusBadge from "@/components/admin/status-badge";
import DeleteProductButton from "@/components/admin/delete-product-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listProducts } from "@/lib/api/admin/products";
import { listQuerySchema } from "@/lib/schemas/admin";
import { AVAILABILITY, CATEGORIES } from "@/lib/schemas/product";
import { formatPrice } from "@/lib/utils/price";

export const dynamic = "force-dynamic";

const margin = (product) => {
  const retail = product.salePriceCents ?? product.priceCents;
  const cost = product.costCents ?? 0;

  if (!cost) return "—";

  return `${Math.round(((retail - cost) / retail) * 100)}%`;
};

const ProductsPage = async ({ searchParams }) => {
  const query = listQuerySchema.parse(await searchParams);
  const { products, total, page, perPage } = await listProducts(query);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>
              One row per piece. Every piece is one of one.
            </CardDescription>
          </div>

          <Button render={<Link href="/admin/products/new" />}>Add a piece</Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-5">
        <FilterBar
          placeholder="Name, brand, SKU, lot"
          filters={[
            {
              key: "status",
              label: "Any availability",
              options: AVAILABILITY.map((value) => ({ value, label: value })),
            },
            {
              key: "category",
              label: "Any category",
              options: CATEGORIES.map((value) => ({ value, label: value })),
            },
          ]}
        />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[54px]" />
                <TableHead>Piece</TableHead>
                <TableHead className="hidden md:table-cell">SKU</TableHead>
                <TableHead className="hidden lg:table-cell">Cost</TableHead>
                <TableHead className="hidden lg:table-cell">Margin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="w-[92px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {products.map((product) => (
                <TableRow key={product.slug}>
                  <TableCell>
                    <div className="relative size-10 overflow-hidden rounded border border-border bg-muted">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="40px"
                        className="object-contain p-0.5"
                      />
                    </div>
                  </TableCell>

                  <TableCell>
                    <Link
                      href={`/admin/products/${product.slug}`}
                      className="block max-w-[220px] truncate font-medium hover:underline"
                    >
                      {product.name}
                    </Link>
                    <span className="block max-w-[220px] truncate text-xs text-muted-foreground">
                      {product.brand} · {product.sizeLabel} · {product.condition}
                    </span>
                  </TableCell>

                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {product.sku}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell tabular-nums text-muted-foreground">
                    {product.costCents ? formatPrice(product.costCents) : "—"}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell tabular-nums text-muted-foreground">
                    {margin(product)}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={product.status} />
                  </TableCell>

                  <TableCell className="text-right tabular-nums">
                    {formatPrice(product.salePriceCents ?? product.priceCents)}
                  </TableCell>

                  <TableCell className="text-right">
                    <DeleteProductButton
                      slug={product.slug}
                      name={product.name}
                    />
                  </TableCell>
                </TableRow>
              ))}

              {products.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-12 text-center text-muted-foreground"
                  >
                    Nothing matches that.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Pager page={page} perPage={perPage} total={total} />
      </CardContent>
    </Card>
  );
};

export default ProductsPage;
