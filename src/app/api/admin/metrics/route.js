import { guard } from "@/lib/api/admin/guard";
import { getMetrics } from "@/lib/api/admin/metrics";

export const dynamic = "force-dynamic";

export const GET = async (request) => {
  const { response } = await guard(request);

  if (response) return response;

  return Response.json(await getMetrics());
};
