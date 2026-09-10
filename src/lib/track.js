import posthog from "posthog-js";

const enabled = Boolean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);

export const track = (event, properties = {}) => {
  if (!enabled) return;

  posthog.capture(event, properties);
};

export const reportError = (error, properties = {}) => {
  if (!enabled) return;

  posthog.captureException(error, properties);
};

export const identifyViewer = (id, properties) => {
  if (!enabled || !id) return;

  posthog.identify(id, properties);
};

export const forgetViewer = () => {
  if (!enabled) return;

  posthog.reset();
};

export const viewerId = () => (enabled ? posthog.get_distinct_id() : null);

export const consentStatus = () =>
  enabled ? posthog.get_explicit_consent_status() : "granted";

export const grantConsent = () => {
  if (!enabled) return;

  posthog.opt_in_capturing();
};

export const denyConsent = () => {
  if (!enabled) return;

  posthog.opt_out_capturing();
};

export const stopRecording = () => {
  if (!enabled) return;

  posthog.stopSessionRecording();
};
