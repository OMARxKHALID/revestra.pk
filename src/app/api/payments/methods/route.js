import { listMethods } from "@/lib/payments";

export const dynamic = "force-dynamic";

export const GET = async () => Response.json({ methods: listMethods() });
