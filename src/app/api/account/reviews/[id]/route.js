import { accountGuard } from "@/lib/api/account-guard";
import { deleteReviewForUser } from "@/lib/api/reviews";

export const dynamic = "force-dynamic";

export const DELETE = async (request, { params }) => {
  const { response, userId } = await accountGuard(request);

  if (response) return response;

  const { id } = await params;
  const removed = await deleteReviewForUser(id, userId);

  if (!removed.ok)
    return Response.json({ error: removed.error }, { status: 404 });

  return Response.json({ ok: true });
};
