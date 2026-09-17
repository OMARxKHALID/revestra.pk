import { guard, readJson, invalid } from "@/lib/api/admin/guard";
import { recordRefund } from "@/lib/api/admin/orders";
import { refundSchema } from "@/lib/schemas/admin";

export const dynamic = "force-dynamic";

export const POST = async (request, { params }) => {
  const { response, adminId } = await guard(request, { mutation: true });

  if (response) return response;

  const body = await readJson(request);

  if (!body.ok) return body.response;

  const parsed = refundSchema.safeParse(body.payload);

  if (!parsed.success) return invalid(parsed.error);

  const { reference } = await params;
  const result = await recordRefund({
    reference,
    amountCents: Math.round(parsed.data.amount * 100),
    method: parsed.data.method,
    refundReference: parsed.data.reference,
    note: parsed.data.note,
    adminId,
  });

  if (!result.ok) return Response.json({ error: result.error }, { status: 409 });

  return Response.json({ ok: true, refundedCents: result.order.refundedCents });
};
