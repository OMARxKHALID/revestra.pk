import { z } from "zod";
import { guard, readJson, invalid } from "@/lib/api/admin/guard";
import { sendNewsletter } from "@/lib/api/admin/newsletters";
import { findUserById } from "@/lib/api/users";

export const dynamic = "force-dynamic";

const newsletterSchema = z.object({
  subject: z.string().trim().min(3, "Give the newsletter a subject").max(120),
  body: z.string().trim().min(20, "Write a little more").max(10_000),
  test: z.boolean().default(false),
});

export const POST = async (request) => {
  const { response, adminId } = await guard(request, { mutation: true });

  if (response) return response;

  const body = await readJson(request);

  if (!body.ok) return body.response;

  const parsed = newsletterSchema.safeParse(body.payload);

  if (!parsed.success) return invalid(parsed.error);

  const admin = parsed.data.test ? await findUserById(adminId) : null;

  if (parsed.data.test && !admin?.email)
    return Response.json(
      { error: "Your account has no email to send the test to" },
      { status: 409 }
    );

  const result = await sendNewsletter({
    subject: parsed.data.subject,
    body: parsed.data.body,
    testTo: parsed.data.test ? admin.email : null,
    adminId,
  });

  if (!result.ok) return Response.json({ error: result.error }, { status: 503 });

  return Response.json(result);
};
