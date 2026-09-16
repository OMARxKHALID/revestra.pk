import { wishlistSchema } from "@/lib/schemas/wishlist";
import { auth } from "@/auth";
import { getWishlist, setWishlist } from "@/lib/api/users";
import { getAllProducts, getStockBySlugs } from "@/lib/api/products";
import { createLimiter } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import { gateRequest } from "@/lib/api/request";

export const dynamic = "force-dynamic";

const limiter = createLimiter(RATE_LIMITS.wishlist);

export const GET = async () => {
  const session = await auth();

  if (!session?.user?.id)
    return Response.json({ error: "Sign in first" }, { status: 401 });

  return Response.json({ slugs: await getWishlist(session.user.id) });
};

export const PUT = async (request) => {
  const gated = await gateRequest(request, limiter);

  if (gated.response) return gated.response;

  const session = await auth();

  if (!session?.user?.id)
    return Response.json({ error: "Sign in first" }, { status: 401 });

  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = wishlistSchema.safeParse(payload);

  if (!parsed.success)
    return Response.json({ error: "Invalid wishlist" }, { status: 422 });

  const requested = [...new Set(parsed.data.slugs)];
  const [catalogue, stored] = await Promise.all([
    getAllProducts(),
    getStockBySlugs(requested),
  ]);
  const known = new Set([
    ...catalogue.map((product) => product.slug),
    ...stored.keys(),
  ]);
  const slugs = await setWishlist(
    session.user.id,
    requested.filter((slug) => known.has(slug))
  );

  return Response.json({ slugs });
};
