import { guard } from "@/lib/api/admin/guard";
import { releaseStaleOrders } from "@/lib/api/fulfilment";
import { getSettings } from "@/lib/api/settings";

export const dynamic = "force-dynamic";

export const POST = async (request) => {
  const { response } = await guard(request, { mutation: true });

  if (response) return response;

  const { commerce } = await getSettings();
  const result = await releaseStaleOrders(commerce.holdMinutes);

  return Response.json({ released: result.released.length });
};
