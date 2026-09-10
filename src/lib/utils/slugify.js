const slugify = (...parts) =>
  parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/['"’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export default slugify;
