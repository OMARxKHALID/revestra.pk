import { guard, readJson, invalid } from "@/lib/api/admin/guard";
import { deleteCategory, updateCategory } from "@/lib/api/categories";
import { categoryPatchSchema } from "@/lib/schemas/category";
import { onlyProvided } from "@/lib/utils/patch";

export const dynamic = "force-dynamic";

export const PATCH = async (request, { params }) => {
  const { response } = await guard(request, { mutation: true });

  if (response) return response;

  const body = await readJson(request);

  if (!body.ok) return body.response;

  const parsed = categoryPatchSchema.safeParse(body.payload);

  if (!parsed.success) return invalid(parsed.error);

  const { slug } = await params;
  const patch = onlyProvided(body.payload, parsed.data);

  if (Object.keys(patch).length === 0)
    return Response.json({ error: "Nothing to change" }, { status: 422 });

  const updated = await updateCategory(slug, patch);

  if (!updated.ok)
    return Response.json({ error: updated.error }, { status: 404 });

  return Response.json({ category: updated.category });
};

export const DELETE = async (request, { params }) => {
  const { response } = await guard(request, { mutation: true });

  if (response) return response;

  const { slug } = await params;
  const removed = await deleteCategory(slug);

  if (!removed.ok)
    return Response.json({ error: removed.error }, { status: 409 });

  return Response.json({ ok: true });
};
