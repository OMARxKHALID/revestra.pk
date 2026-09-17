import "server-only";
import { getDb } from "@/lib/db";
import { authSecret } from "@/lib/secrets";
import { siteUrl } from "@/lib/payments/config";
import { sendBulkEmail } from "@/lib/email";
import { allSubscriberEmails } from "@/lib/api/subscribers";
import { signSubscriber } from "@/lib/utils/subscriber-token";

const COLLECTION = "newsletters";

export const unsubscribeLink = (email, base = siteUrl()) =>
  `${base}/api/newsletter/unsubscribe?email=${encodeURIComponent(
    email
  )}&token=${signSubscriber(email, authSecret())}`;

const messageFor = ({ email, subject, body }) => {
  const link = unsubscribeLink(email);

  return {
    to: email,
    subject,
    text: `${body}\n\n—\nTo stop receiving these, open ${link}`,
    headers: { "List-Unsubscribe": `<${link}>` },
  };
};

export const listNewsletters = async (limit = 10) => {
  const db = await getDb();

  if (!db) return [];

  return db
    .collection(COLLECTION)
    .find({}, { projection: { _id: 0, body: 0 } })
    .sort({ sentAt: -1 })
    .limit(limit)
    .toArray();
};

export const sendNewsletter = async ({ subject, body, testTo, adminId }) => {
  if (!authSecret())
    return { ok: false, error: "AUTH_SECRET is not set, so links cannot be signed" };

  const recipients = testTo ? [testTo] : await allSubscriberEmails();

  if (recipients.length === 0)
    return { ok: false, error: "There is nobody to send this to yet" };

  const result = await sendBulkEmail(
    recipients.map((email) => messageFor({ email, subject, body }))
  );

  if (!result.configured)
    return {
      ok: false,
      error: "Email is not configured. Set RESEND_API_KEY to send.",
    };

  if (testTo) return { ok: true, sent: result.sent, failed: result.failed, test: true };

  const db = await getDb();

  if (db)
    await db.collection(COLLECTION).insertOne({
      subject,
      body,
      recipients: recipients.length,
      sent: result.sent,
      failed: result.failed,
      sentAt: new Date(),
      sentBy: adminId ?? null,
    });

  return { ok: true, sent: result.sent, failed: result.failed, test: false };
};
