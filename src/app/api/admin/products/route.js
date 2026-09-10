import { guard, readJson, invalid } from "@/lib/api/admin/guard";
import {
  createProduct,
  derive,
  listProducts,
  nextSku,
} from "@/lib/api/admin/products";
import { adminProductSchema, listQuerySchema } from "@/lib/schemas/admin";
import { categoryNames } from "@/lib/api/categories";

export const dynamic = "force-dynamic";

export const GET = async (request) => {
  const { response } = await guard(request);

  if (response) return response;

  const { searchParams } = new URL(request.url);
  const query = listQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!query.success) return invalid(query.error);

  const result = await listProducts(query.data);

  return Response.json({ ...result, nextSku: await nextSku() });
};

export const POST = async (request) => {
  const { response } = await guard(request, { mutation: true });

  if (response) return response;

  const body = await readJson(request);

  if (!body.ok) return body.response;

  const parsed = adminProductSchema.safeParse(await derive(body.payload));

  if (!parsed.success) return invalid(parsed.error);

  const known = await categoryNames();

  if (!known.includes(parsed.data.category))
    return Response.json(
      { error: `"${parsed.data.category}" is not a category. Add it first.` },
      { status: 422 }
    );

  try {
    const created = await createProduct(parsed.data);

    if (!created.ok)
      return Response.json({ error: created.error }, { status: 409 });

    return Response.json({ product: created.product }, { status: 201 });
  } catch (error) {
    console.error(`[admin] could not create a piece: ${error.message}`);

    return Response.json(
      { error: "We could not save that piece." },
      { status: 503 }
    );
  }
};
