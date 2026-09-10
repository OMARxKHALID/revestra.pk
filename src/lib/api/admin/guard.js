import "server-only";
import { auth } from "@/auth";
import { ROLE } from "@/lib/roles";
import { sameOrigin } from "@/lib/api/origin";

const notFound = () => Response.json({ error: "Not found" }, { status: 404 });

export const isAdmin = (session) => session?.user?.role === ROLE.admin;

export const adminSession = async () => {
  const session = await auth();

  return isAdmin(session) ? session : null;
};

export const guard = async (request, { mutation = false } = {}) => {
  const session = await adminSession();

  if (!session) return { response: notFound() };

  if (mutation && !sameOrigin(request)) return { response: notFound() };

  return { session, adminId: session.user?.id ?? null };
};

export const readJson = async (request) => {
  try {
    return { ok: true, payload: await request.json() };
  } catch {
    return {
      ok: false,
      response: Response.json({ error: "Malformed request" }, { status: 400 }),
    };
  }
};

export const invalid = (error) =>
  Response.json(
    { error: error.issues[0]?.message ?? "Invalid request" },
    { status: 422 }
  );
