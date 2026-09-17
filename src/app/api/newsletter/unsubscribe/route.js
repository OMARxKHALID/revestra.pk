import { redirect } from "next/navigation";
import { unsubscribe } from "@/lib/api/subscribers";
import { authSecret } from "@/lib/secrets";
import { verifySubscriber } from "@/lib/utils/subscriber-token";

export const dynamic = "force-dynamic";

export const GET = async (request) => {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  if (!verifySubscriber(email, token, authSecret()))
    redirect("/newsletter/unsubscribed?ok=0");

  await unsubscribe(email);

  redirect("/newsletter/unsubscribed?ok=1");
};
