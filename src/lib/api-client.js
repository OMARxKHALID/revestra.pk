export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

const parse = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

export const request = async (url, options = {}) => {
  const { body, method, signal, headers, ...rest } = {
    body: undefined,
    method: undefined,
    signal: undefined,
    headers: undefined,
    ...options,
  };

  const response = await fetch(url, {
    ...rest,
    method: method ?? (body === undefined ? "GET" : "POST"),
    signal,
    headers:
      body === undefined
        ? headers
        : { "Content-Type": "application/json", ...Object(headers) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await parse(response);

  if (!response.ok)
    throw new ApiError(
      payload.error ?? "Something went wrong. Try again.",
      response.status,
      payload
    );

  return payload;
};
