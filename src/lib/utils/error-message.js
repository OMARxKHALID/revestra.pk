const errorMessage = (error, fallback = "Something went wrong") => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;

  return fallback;
};

export default errorMessage;
