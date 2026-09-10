import { reviewStatusSchema } from "@/lib/schemas/review";
import { guard, readJson, invalid } from "@/lib/api/admin/guard";
import { listReviews, setReviewStatus } from "@/lib/api/admin/reviews";
import { listQuerySchema } from "@/lib/schemas/admin";

export const dynamic = "force-dynamic";

export const GET = async (request) => {
  const { response } = await guard(request);

  if (response) return response;

  const query = listQuerySchema.parse(
    Object.fromEntries(new URL(request.url).searchParams)
  );

  return Response.json(await listReviews(query));
};

export const PATCH = async (request) => {
  const { response } = await guard(request, { mutation: true });

  if (response) return response;

  const body = await readJson(request);

  if (!body.ok) return body.response;

  const parsed = reviewStatusSchema.safeParse(body.payload);

  if (!parsed.success) return invalid(parsed.error);

  const updated = await setReviewStatus(parsed.data);

  if (!updated.ok)
    return Response.json({ error: updated.error }, { status: 404 });

  return Response.json({ ok: true });
};
