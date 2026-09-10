import "server-only";
import { PostHog } from "posthog-node";
import errorMessage from "@/lib/utils/error-message";

const token = () => process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim() || "";

const host = () =>
  process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://eu.i.posthog.com";

export const captureServerEvent = async ({ distinctId, event, properties }) => {
  const key = token();

  if (!key || !distinctId) return { captured: false };

  // ponytail: a client per call, flushed at once — right for request-scoped
  // handlers, revisit if a long-lived worker ever sends these
  const client = new PostHog(key, {
    host: host(),
    flushAt: 1,
    flushInterval: 0,
  });

  try {
    client.capture({ distinctId, event, properties });
    await client.shutdown();

    return { captured: true };
  } catch (error) {
    console.error(
      `[analytics] could not send ${event}: ${errorMessage(error)}`
    );

    return { captured: false };
  }
};
