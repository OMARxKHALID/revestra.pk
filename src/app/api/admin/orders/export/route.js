import { guard } from "@/lib/api/admin/guard";
import { listOrders } from "@/lib/api/admin/orders";
import { listQuerySchema } from "@/lib/schemas/admin";
import { toCsv, csvResponse } from "@/lib/utils/csv";
import { majorUnits } from "@/lib/analytics";

export const dynamic = "force-dynamic";

const COLUMNS = [
  { header: "Reference", value: (order) => order.reference },
  { header: "Placed", value: (order) => new Date(order.createdAt).toISOString() },
  { header: "Status", value: (order) => order.status },
  { header: "Customer", value: (order) => order.shipping?.name },
  { header: "Email", value: (order) => order.email },
  { header: "Phone", value: (order) => order.shipping?.phone },
  { header: "City", value: (order) => order.shipping?.city },
  { header: "Method", value: (order) => order.payment?.method },
  { header: "Payment", value: (order) => order.payment?.status },
  { header: "Promo", value: (order) => order.promo?.code ?? "" },
  { header: "Items", value: (order) => order.items.length },
  { header: "Total", value: (order) => majorUnits(order.totals.totalCents) },
  { header: "Currency", value: (order) => order.currency },
];

export const GET = async (request) => {
  const { response } = await guard(request);

  if (response) return response;

  const query = listQuerySchema.parse(
    Object.fromEntries(new URL(request.url).searchParams)
  );

  // ponytail: one page of at most 1000, plenty at this volume — paginate the
  // export if the shop ever outgrows it
  const { orders } = await listOrders({ ...query, page: 1, perPage: 1000 });
  const stamp = new Date().toISOString().slice(0, 10);

  return csvResponse(`orders-${stamp}.csv`, toCsv(COLUMNS, orders));
};
