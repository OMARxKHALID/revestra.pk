import { guard, invalid } from "@/lib/api/admin/guard";
import { listOrders } from "@/lib/api/admin/orders";
import { listQuerySchema } from "@/lib/schemas/admin";

export const dynamic = "force-dynamic";

export const GET = async (request) => {
  const { response } = await guard(request);

  if (response) return response;

  const { searchParams } = new URL(request.url);
  const query = listQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!query.success) return invalid(query.error);

  return Response.json(await listOrders(query.data));
};
