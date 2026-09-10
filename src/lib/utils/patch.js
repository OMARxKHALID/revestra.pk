export const onlyProvided = (payload, parsed) =>
  Object.fromEntries(
    Object.entries(parsed).filter(([key]) =>
      Object.prototype.hasOwnProperty.call(payload ?? {}, key)
    )
  );
