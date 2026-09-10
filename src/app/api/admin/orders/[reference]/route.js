import { guard, readJson, invalid } from "@/lib/api/admin/guard";
import { getOrder, setOrderStatus } from "@/lib/api/admin/orders";
import { orderStatusSchema } from "@/lib/schemas/admin";
import { orderSecret } from "@/lib/api/orders";
import { signOrderToken } from "@/lib/utils/order-token";
import { sendOrderStatusUpdate } from "@/lib/email";
import { siteUrl } from "@/lib/payments/config";

export const dynamic = "force-dynamic";

export const GET = async (request, { params }) => {
  const { response } = await guard(request);

  if (response) return response;

  const { reference } = await params;
  const order = await getOrder(reference);

  if (!order) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ order });
};

export const PATCH = async (request, { params }) => {
  const { response, adminId } = await guard(request, { mutation: true });

  if (response) return response;

  const body = await readJson(request);

  if (!body.ok) return body.response;

  const parsed = orderStatusSchema.safeParse(body.payload);

  if (!parsed.success) return invalid(parsed.error);

  const { reference } = await params;

  const updated = await setOrderStatus({
    reference,
    ...parsed.data,
    adminId,
  });

  if (!updated.ok)
    return Response.json({ error: updated.error }, { status: 409 });

  if (updated.order) {
    const token = signOrderToken(reference, orderSecret());
    const trackUrl = `${siteUrl()}/orders/${reference}?t=${encodeURIComponent(token)}`;

    await sendOrderStatusUpdate(updated.order, trackUrl);
  }

  return Response.json({ order: updated.order });
};
