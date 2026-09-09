import { intakeSchema } from "@/lib/schemas/product";
import { createProduct, listInventory } from "@/lib/api/admin";
import { requireAdmin, forbidden } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export const GET = async () => {
  if (!(await requireAdmin())) return forbidden();

  return Response.json({ products: await listInventory() });
};

export const POST = async (request) => {
  if (!(await requireAdmin())) return forbidden();

  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = intakeSchema
    .safeParse({ ...payload, slug: payload.slug ?? "placeholder", sku: payload.sku ?? "GS-0000" });

  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid piece" },
      { status: 422 }
    );

  try {
    const result = await createProduct({ ...payload, slug: undefined, sku: undefined });

    if (!result.ok)
      return Response.json(
        { error: `A piece already exists at ${result.slug}` },
        { status: 409 }
      );

    return Response.json({ product: result.product }, { status: 201 });
  } catch (error) {
    console.error(`[admin] could not create a piece: ${error.message}`);

    return Response.json(
      { error: "We could not save that piece. Try again." },
      { status: 503 }
    );
  }
};
