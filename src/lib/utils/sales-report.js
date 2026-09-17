const UNKNOWN = "Unknown";

const monthKey = (date) => new Date(date).toISOString().slice(0, 7);

const bump = (map, key, values) => {
  const current = map.get(key) ?? {
    name: key,
    itemsSold: 0,
    revenueCents: 0,
    marginCents: 0,
  };

  map.set(key, {
    name: key,
    itemsSold: current.itemsSold + 1,
    revenueCents: current.revenueCents + values.revenueCents,
    marginCents: current.marginCents + values.marginCents,
  });
};

const byRevenue = (map) =>
  [...map.values()].sort((a, b) => b.revenueCents - a.revenueCents);

export const buildSalesReport = ({ orders = [], products = new Map() } = {}) => {
  const months = new Map();
  const categories = new Map();
  const brands = new Map();

  let revenueCents = 0;
  let discountCents = 0;
  let shippingCents = 0;
  let itemsSold = 0;
  let costCents = 0;
  let itemsWithoutCost = 0;

  for (const order of orders) {
    revenueCents += order.totals?.totalCents ?? 0;
    discountCents += order.totals?.discountCents ?? 0;
    shippingCents += order.totals?.shippingCents ?? 0;

    const month = monthKey(order.createdAt);
    const seen = months.get(month) ?? { month, revenueCents: 0, orders: 0 };

    months.set(month, {
      month,
      revenueCents: seen.revenueCents + (order.totals?.totalCents ?? 0),
      orders: seen.orders + 1,
    });

    for (const item of order.items ?? []) {
      const product = products.get(item.slug);
      const cost = product?.costCents ?? null;
      const revenue = item.unitCents ?? 0;
      const margin = cost === null ? 0 : revenue - cost;

      itemsSold += 1;

      if (cost === null) itemsWithoutCost += 1;
      else costCents += cost;

      bump(categories, product?.category ?? UNKNOWN, {
        revenueCents: revenue,
        marginCents: margin,
      });
      bump(brands, product?.brand ?? UNKNOWN, {
        revenueCents: revenue,
        marginCents: margin,
      });
    }
  }

  const soldValueCents = [...categories.values()].reduce(
    (total, entry) => total + entry.revenueCents,
    0
  );
  const marginCents = soldValueCents - costCents;

  return {
    orders: orders.length,
    revenueCents,
    averageOrderCents: orders.length
      ? Math.round(revenueCents / orders.length)
      : 0,
    discountCents,
    shippingCents,
    itemsSold,
    costCents,
    marginCents,
    marginPercent: soldValueCents
      ? Math.round((marginCents / soldValueCents) * 1000) / 10
      : 0,
    itemsWithoutCost,
    months: [...months.values()].sort((a, b) => a.month.localeCompare(b.month)),
    categories: byRevenue(categories),
    brands: byRevenue(brands),
  };
};
