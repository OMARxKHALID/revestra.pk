import { guard, readJson, invalid } from "@/lib/api/admin/guard";
import {
  deleteProduct,
  getProduct,
  setStatus,
  updateProduct,
} from "@/lib/api/admin/products";
import { adminProductPatchSchema } from "@/lib/schemas/admin";
import { productStatusSchema } from "@/lib/schemas/product";
import { categoryNames } from "@/lib/api/categories";
import { onlyProvided } from "@/lib/utils/patch";

export const dynamic = "force-dynamic";

export const GET = async (request, { params }) => {
  const { response } = await guard(request);

  if (response) return response;

  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ product });
};

export const PATCH = async (request, { params }) => {
  const { response } = await guard(request, { mutation: true });

  if (response) return response;

  const body = await readJson(request);

  if (!body.ok) return body.response;

  const { slug } = await params;
  const asStatus = productStatusSchema.safeParse(body.payload);

  if (!asStatus.success) {
    const parsed = adminProductPatchSchema.safeParse(body.payload);

    if (!parsed.success) return invalid(parsed.error);
  }

  const patch = asStatus.success
    ? null
    : onlyProvided(body.payload, adminProductPatchSchema.parse(body.payload));

  if (patch?.category) {
    const known = await categoryNames();

    if (!known.includes(patch.category))
      return Response.json(
        { error: `"${patch.category}" is not a category. Add it first.` },
        { status: 422 }
      );
  }

  try {
    const result = asStatus.success
      ? await setStatus(slug, asStatus.data.status)
      : await updateProduct(slug, patch);

    if (!result.ok)
      return Response.json({ error: result.error }, { status: 404 });

    return Response.json({ ok: true, product: result.product });
  } catch (error) {
    console.error(`[admin] could not update ${slug}: ${error.message}`);

    return Response.json(
      { error: "We could not save that change." },
      { status: 503 }
    );
  }
};

export const DELETE = async (request, { params }) => {
  const { response } = await guard(request, { mutation: true });

  if (response) return response;

  const { slug } = await params;

  try {
    const removed = await deleteProduct(slug);

    if (!removed.ok)
      return Response.json({ error: removed.error }, { status: 409 });

    return Response.json({ ok: true });
  } catch (error) {
    console.error(`[admin] could not delete ${slug}: ${error.message}`);

    return Response.json(
      { error: "We could not delete that piece." },
      { status: 503 }
    );
  }
};
