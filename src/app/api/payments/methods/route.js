import { listMethods } from "@/lib/payments";
import { getSettings } from "@/lib/api/settings";

export const dynamic = "force-dynamic";

export const GET = async () =>
  Response.json({ methods: listMethods(await getSettings()) });
