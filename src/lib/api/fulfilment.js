import "server-only";
import { markSold, releaseStock } from "@/lib/api/inventory";
import {
  cancelStaleOrder,
  findStaleOrders,
  flagStockConflict,
} from "@/lib/api/orders";
import { recordRedemption, releaseRedemption } from "@/lib/api/promos";

export const completeSale = async (order, lines = order.items) => {
  const sale = await markSold(lines, order.reference);

  if (!sale.sold) await flagStockConflict(order.reference, sale.contested);

  if (order.promo) await recordRedemption(order.promo.code, order.reference);

  return sale;
};

export const releaseStaleOrders = async (minutes) => {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  const stale = await findStaleOrders(cutoff);
  const released = [];

  for (const order of stale) {
    await releaseStock(order.items, order.reference);

    if (order.promo && order.promoRedeemed)
      await releaseRedemption(order.promo.code, order.reference);

    const { cancelled } = await cancelStaleOrder(
      order.reference,
      `abandoned for over ${minutes} minutes, stock released`
    );

    if (cancelled)
      released.push({ reference: order.reference, lines: order.items.length });
  }

  return { minutes, examined: stale.length, released };
};
