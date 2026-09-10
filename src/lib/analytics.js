import { CURRENCY } from "@/lib/utils/price";

export const ANALYTICS_EVENT = {
  productsSearched: "Products Searched",
  productListViewed: "Product List Viewed",
  productListFiltered: "Product List Filtered",
  productViewed: "Product Viewed",
  productAdded: "Product Added",
  productRemoved: "Product Removed",
  cartViewed: "Cart Viewed",
  checkoutStarted: "Checkout Started",
  paymentInfoEntered: "Payment Info Entered",
  orderCompleted: "Order Completed",
  orderCancelled: "Order Cancelled",
  couponApplied: "Coupon Applied",
  couponDenied: "Coupon Denied",
  productAddedToWishlist: "Product Added to Wishlist",
  productRemovedFromWishlist: "Product Removed from Wishlist",
  productReviewed: "Product Reviewed",
};

export const majorUnits = (cents) => Math.round(cents) / 100;

export const productProperties = (product) => ({
  product_id: product.slug,
  sku: product.sku ?? null,
  name: product.name,
  brand: product.brand ?? null,
  category: product.category ?? null,
  variant: product.sizeLabel ?? product.size ?? null,
  price: majorUnits(product.salePriceCents ?? product.priceCents ?? product.unitCents ?? 0),
  quantity: 1,
  currency: CURRENCY,
  url: `/products/${product.slug}`,
  image_url: product.image ?? null,
});

export const orderProperties = (order) => ({
  order_id: order.reference,
  currency: order.currency ?? CURRENCY,
  subtotal: majorUnits(order.totals.subtotalCents),
  total: majorUnits(order.totals.totalCents),
  revenue: majorUnits(order.totals.totalCents),
  shipping: majorUnits(order.totals.shippingCents),
  tax: majorUnits(order.totals.taxCents),
  discount: majorUnits(order.totals.discountCents),
  coupon: order.promo?.code ?? null,
  payment_method: order.payment?.method ?? null,
  products: order.items.map(productProperties),
});
