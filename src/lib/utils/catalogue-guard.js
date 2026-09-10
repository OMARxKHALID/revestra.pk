export const isCatalogueUnavailable = (error) =>
  Boolean(error) && Reflect.get(Object(error), "name") === "DatabaseUnavailableError";
