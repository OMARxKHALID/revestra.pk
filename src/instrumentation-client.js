import posthog from "posthog-js";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (token) {
  posthog.init(token, {
    api_host: "/ph",
    ui_host: "https://eu.posthog.com",
    defaults: "2026-05-30",
    person_profiles: "identified_only",
    capture_exceptions: true,
    cookieless_mode: "on_reject",
    mask_personal_data_properties: true,
    custom_personal_data_properties: ["t"],
    session_recording: {
      maskAllInputs: true,
      maskInputOptions: { password: true, email: true, text: true },
    },
  });
}
