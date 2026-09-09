import { auth } from "@/auth";

export const requireAdmin = async () => {
  const session = await auth().catch(() => null);

  if (session?.user?.role !== "admin") return null;

  return session;
};

export const forbidden = () =>
  Response.json({ error: "Not allowed" }, { status: 403 });
