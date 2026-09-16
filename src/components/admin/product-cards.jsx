import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import StatusBadge from "@/components/admin/status-badge";
import ProductActiveToggle from "@/components/admin/product-active-toggle";
import DeleteProductButton from "@/components/admin/delete-product-button";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatPrice } from "@/lib/utils/price";

const Line = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 py-1.5">
    <span className="text-xs text-muted-foreground">{label}</span>
    {children}
  </div>
);

const ProductCard = ({ product, margin }) => (
  <Collapsible className="w-full min-w-0 border-b border-border py-3 last:border-0">
    <CollapsibleTrigger className="group">
      <span className="relative size-10 shrink-0 overflow-hidden rounded border border-border bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="40px"
          className="object-contain p-0.5"
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{product.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {product.brand} · {product.sizeLabel}
        </span>
      </span>

      <StatusBadge status={product.status} />

      <HugeiconsIcon
        icon={ArrowDown01Icon}
        strokeWidth={2}
        className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]:rotate-180"
      />
    </CollapsibleTrigger>

    <CollapsiblePanel>
      <div className="pt-2">
        <Line label="SKU">
          <span className="text-muted-foreground">{product.sku}</span>
        </Line>

        <Line label="Cost">
          <span className="tabular-nums text-muted-foreground">
            {product.costCents ? formatPrice(product.costCents) : "—"}
          </span>
        </Line>

        <Line label="Margin">
          <span className="tabular-nums text-muted-foreground">{margin}</span>
        </Line>

        <Line label="Price">
          <span className="tabular-nums font-medium">
            {formatPrice(product.salePriceCents ?? product.priceCents)}
          </span>
        </Line>

        <Line label="Live">
          <ProductActiveToggle
            slug={product.slug}
            name={product.name}
            active={product.active !== false}
          />
        </Line>

        <div className="flex items-center justify-between gap-4 pt-2">
          <Link
            href={`/admin/products/${product.slug}`}
            className="text-sm underline underline-offset-4"
          >
            Edit this piece
          </Link>

          <DeleteProductButton slug={product.slug} name={product.name} />
        </div>
      </div>
    </CollapsiblePanel>
  </Collapsible>
);

const ProductCards = ({ products, margins }) => {
  if (products.length === 0)
    return (
      <p className="py-12 text-center text-muted-foreground lg:hidden">
        Nothing matches that.
      </p>
    );

  return (
    <div className="w-full min-w-0 lg:hidden">
      {products.map((product) => (
        <ProductCard
          key={product.slug}
          product={product}
          margin={margins[product.slug]}
        />
      ))}
    </div>
  );
};

export default ProductCards;
