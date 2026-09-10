import { guard, readJson, invalid } from "@/lib/api/admin/guard";
import { getSettings, saveSettings } from "@/lib/api/settings";
import { settingsSchema } from "@/lib/schemas/settings";

export const dynamic = "force-dynamic";

export const GET = async (request) => {
  const { response } = await guard(request);

  if (response) return response;

  return Response.json({ settings: await getSettings() });
};

export const PUT = async (request) => {
  const { response, adminId } = await guard(request, { mutation: true });

  if (response) return response;

  const body = await readJson(request);

  if (!body.ok) return body.response;

  const parsed = settingsSchema.safeParse(body.payload);

  if (!parsed.success) return invalid(parsed.error);

  const saved = await saveSettings(parsed.data, adminId);

  if (!saved.ok) return Response.json({ error: saved.error }, { status: 503 });

  return Response.json({ settings: saved.settings });
};
