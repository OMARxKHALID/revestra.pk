import "server-only";
import { markSold, releaseStock } from "@/lib/api/inventory";
import {
  CANCELLABLE_STATUSES,
  cancelOrderDocument,
  findOrderByReference,
  findStaleOrders,
  flagStockConflict,
} from "@/lib/api/orders";
import { PAYMENT_STATUS } from "@/lib/schemas/order";
import { recordRedemption, releaseRedemption } from "@/lib/api/promos";
import { captureServerEvent } from "@/lib/api/analytics";
import { ANALYTICS_EVENT, orderProperties } from "@/lib/analytics";

export const completeSale = async (order, lines = order.items) => {
  const sale = await markSold(lines, order.reference);

  if (!sale.sold) await flagStockConflict(order.reference, sale.contested);

  if (order.promo) await recordRedemption(order.promo.code, order.reference);

  return sale;
};

const releaseHolds = async (order) => {
  await releaseStock(order.items, order.reference);

  if (order.promo && order.promoRedeemed)
    await releaseRedemption(order.promo.code, order.reference);
};

export const cancelOrder = async (order, note, from) => {
  await releaseHolds(order);

  return cancelOrderDocument(order.reference, note, from);
};

export const cancelOwnOrder = async (reference) => {
  const order = await findOrderByReference(reference);

  if (!order) return { ok: false, error: "No such order" };

  if (order.payment?.status === PAYMENT_STATUS.paid)
    return {
      ok: false,
      error: "This order is paid. Write to us and we will refund it.",
    };

  if (!CANCELLABLE_STATUSES.includes(order.status))
    return {
      ok: false,
      error: `An order that is ${order.status} can no longer be cancelled here.`,
    };

  const { cancelled } = await cancelOrder(
    order,
    "cancelled by the customer",
    CANCELLABLE_STATUSES
  );

  if (!cancelled)
    return { ok: false, error: "That order could not be cancelled" };

  return { ok: true, order: { ...order, status: "cancelled" } };
};

export const releaseStaleOrders = async (minutes) => {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  const stale = await findStaleOrders(cutoff);
  const released = [];

  for (const order of stale) {
    const { cancelled } = await cancelOrder(
      order,
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
