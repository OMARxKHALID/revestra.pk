const GENERIC = {
  title: "Something went wrong",
  message: "The fault is on our side, not yours. Try again in a moment.",
};

const BY_STATUS = {
  400: {
    title: "That request was not understood",
    message: "Check the details and try again.",
  },
  401: {
    title: "You need to sign in",
    message: "Sign in to your account to carry on.",
  },
  403: {
    title: "That could not be verified",
    message:
      "Your session may have expired. Reload the page and try once more.",
  },
  404: {
    title: "We could not find that",
    message: "It may have sold, or the link may be out of date.",
  },
  409: {
    title: "That piece has moved on",
    message:
      "Every piece here is one of one, so stock changes fast. Refresh to see what is left.",
  },
  422: {
    title: "Some details need another look",
    message: "Check the highlighted fields and try again.",
  },
  429: {
    title: "That was a few too many tries",
    message: "Wait a moment before trying again.",
  },
  503: {
    title: "We could not save that",
    message: "Nothing was charged. Try again shortly.",
  },
};

const isOffline = () =>
  typeof navigator !== "undefined" && navigator.onLine === false;

export const describeError = (error) => {
  if (isOffline())
    return {
      title: "You appear to be offline",
      message: "Check your connection and try again.",
    };

  if (!error) return GENERIC;

  if (error.name === "DatabaseUnavailableError")
    return {
      title: "The shop is catching its breath",
      message:
        "We could not reach our catalogue just now. Nothing in your cart was lost — try again in a moment.",
    };

  const status = Number(Reflect.get(Object(error), "status"));

  if (Number.isFinite(status) && BY_STATUS[status]) return BY_STATUS[status];
  if (Number.isFinite(status) && status >= 500) return GENERIC;

  const message = error instanceof Error ? error.message : "";

  if (message && error.name === "ApiError") return { ...GENERIC, message };

  return GENERIC;
};
