import PillButton from "@/components/ui/pill-button";
import InventoryRow from "@/components/inventory-row";
import cn from "@/lib/utils/cn";
import { META, TITLE } from "@/lib/type";
import { title } from "@/lib/brand";
import { formatPrice } from "@/lib/utils/price";
import { adminIsAvailable, inventoryStats, listInventory } from "@/lib/api/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: title("Inventory"),
  robots: { index: false, follow: false },
};

const Stat = ({ label, value, tone = "text-black" }) => (
  <div className="border border-black/10 px-4 py-4">
    <p className={cn(META, "text-black/45")}>{label}</p>
    <p className={cn(TITLE, "mt-2", tone)}>{value}</p>
  </div>
);

const AdminPage = async () => {
  if (!adminIsAvailable())
    return (
      <div className="grid gap-2">
        <h1 className="text-xl font-medium">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Listing needs a database. This deployment has none configured.
        </p>
      </div>
    );

  const products = await listInventory();
  const stats = inventoryStats(products);

  return (
    <div>
      <h1 className="text-xl font-medium">Inventory</h1>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="In stock" value={stats.available} />
        <Stat label="On hold" value={stats.reserved} />
        <Stat label="Sold" value={stats.sold} />
        <Stat
          label="Margin on sold"
          value={formatPrice(stats.marginCents)}
          tone={stats.marginCents >= 0 ? "text-blurple" : "text-sale"}
        />
      </div>

      <p className={cn(META, "mt-4 text-black/45")}>
        {formatPrice(stats.spendCents)} spent across {stats.total} pieces ·{" "}
        {formatPrice(stats.revenueCents)} taken
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <PillButton href="/admin/new">List a new piece</PillButton>
        <PillButton href="/products" size="sm">
          View the shop
        </PillButton>
      </div>

      {products.length === 0 ? (
        <p className={cn(TITLE, "mt-16 text-black/70")}>
          Nothing listed yet.
        </p>
      ) : (
        <ul className="mt-12 divide-y divide-black/10 border-y border-black/10">
          {products.map((product) => (
            <InventoryRow key={product.slug} product={product} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminPage;
