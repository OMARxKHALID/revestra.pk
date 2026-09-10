import "server-only";
import { PostHog } from "posthog-node";
import errorMessage from "@/lib/utils/error-message";

const token = () => process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim() || "";

const host = () =>
  process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://eu.i.posthog.com";

// ponytail: a client per call, flushed at once — right for request-scoped
// handlers, revisit if a long-lived worker ever sends these
const withClient = async (label, send) => {
  const key = token();

  if (!key) return { captured: false };

  const client = new PostHog(key, {
    host: host(),
    flushAt: 1,
    flushInterval: 0,
  });

  try {
    send(client);
    await client.shutdown();

    return { captured: true };
  } catch (error) {
    console.error(`[analytics] could not send ${label}: ${errorMessage(error)}`);

    return { captured: false };
  }
};

export const captureServerEvent = async ({ distinctId, event, properties }) => {
  if (!distinctId) return { captured: false };

  return withClient(event, (client) =>
    client.capture({ distinctId, event, properties })
  );
};

export const captureServerException = async (error, context = {}) => {
  const { distinctId, ...properties } = context;

  return withClient("an exception", (client) =>
    client.captureException(error, distinctId || undefined, properties)
  );
};
