import "server-only";
import { markSold, releaseStock } from "@/lib/api/inventory";
import {
  cancelStaleOrder,
  findStaleOrders,
  flagStockConflict,
} from "@/lib/api/orders";
import { recordRedemption, releaseRedemption } from "@/lib/api/promos";
import { captureServerEvent } from "@/lib/api/analytics";
import { ANALYTICS_EVENT, orderProperties } from "@/lib/analytics";

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

const analyticsIdFor = (order) => order.distinctId || order.userId || null;

export const captureOrderCompleted = (order) =>
  captureServerEvent({
    distinctId: analyticsIdFor(order),
    event: ANALYTICS_EVENT.orderCompleted,
    properties: orderProperties(order),
  });

export const captureOrderCancelled = (order) =>
  captureServerEvent({
    distinctId: analyticsIdFor(order),
    event: ANALYTICS_EVENT.orderCancelled,
    properties: orderProperties(order),
  });
