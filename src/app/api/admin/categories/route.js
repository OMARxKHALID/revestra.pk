import { guard, readJson, invalid } from "@/lib/api/admin/guard";
import { createCategory, listCategories } from "@/lib/api/categories";
import { categorySchema } from "@/lib/schemas/category";
import slugify from "@/lib/utils/slugify";

export const dynamic = "force-dynamic";

export const GET = async (request) => {
  const { response } = await guard(request);

  if (response) return response;

  return Response.json({
    categories: await listCategories({ includeInactive: true }),
  });
};

export const POST = async (request) => {
  const { response } = await guard(request, { mutation: true });

  if (response) return response;

  const body = await readJson(request);

  if (!body.ok) return body.response;

  const parsed = categorySchema.safeParse({
    ...body.payload,
    slug: body.payload.slug || slugify(body.payload.name ?? ""),
  });

  if (!parsed.success) return invalid(parsed.error);

  const created = await createCategory(parsed.data);

  if (!created.ok)
    return Response.json({ error: created.error }, { status: 409 });

  return Response.json({ category: created.category }, { status: 201 });
};
