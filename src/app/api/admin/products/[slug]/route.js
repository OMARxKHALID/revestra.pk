import { z } from "zod";
import { deleteProduct, setStatus, updateProduct } from "@/lib/api/admin";
import { AVAILABILITY } from "@/lib/schemas/product";
import { requireAdmin, forbidden } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

const statusSchema = z.object({ status: z.enum(AVAILABILITY) });

export const PATCH = async (request, { params }) => {
  if (!(await requireAdmin())) return forbidden();

  const { slug } = await params;

  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request" }, { status: 400 });
  }

  const asStatus = statusSchema.safeParse(payload);

  try {
    const result = asStatus.success
      ? await setStatus(slug, asStatus.data.status)
      : await updateProduct(slug, payload);

    if (!result.ok)
      return Response.json({ error: "No such piece" }, { status: 404 });

    return Response.json({ ok: true, product: result.product ?? null });
  } catch (error) {
    console.error(`[admin] could not update ${slug}: ${error.message}`);

    return Response.json(
      { error: "We could not save that change." },
      { status: 503 }
    );
  }
};

export const DELETE = async (_request, { params }) => {
  if (!(await requireAdmin())) return forbidden();

  const { slug } = await params;

  try {
    const result = await deleteProduct(slug);

    if (result.reason === "on-order")
      return Response.json(
        {
          error: `That piece is on order ${result.reference} — mark it sold instead`,
        },
        { status: 409 }
      );

    if (!result.ok)
      return Response.json({ error: "No such piece" }, { status: 404 });

    return Response.json({ ok: true });
  } catch (error) {
    console.error(`[admin] could not delete ${slug}: ${error.message}`);

    return Response.json(
      { error: "We could not delete that piece." },
      { status: 503 }
    );
  }
};
