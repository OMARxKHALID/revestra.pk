import { cronGuard } from "@/lib/api/service-auth";
import { releaseStaleOrders } from "@/lib/api/fulfilment";
import { staleReleaseSchema } from "@/lib/schemas/admin";
import { readJson, invalid } from "@/lib/api/admin/guard";

export const dynamic = "force-dynamic";

export const POST = async (request) => {
  const { response } = cronGuard(request);

  if (response) return response;

  const body = await readJson(request);
  const parsed = staleReleaseSchema.safeParse(body.ok ? body.payload : {});

  if (!parsed.success) return invalid(parsed.error);

  const result = await releaseStaleOrders(parsed.data.minutes);

  return Response.json(result);
};
