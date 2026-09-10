export const CLOUDINARY_HOST = "https://api.cloudinary.com";
export const CLOUDINARY_DELIVERY = "https://res.cloudinary.com";

export const cloudName = () => process.env.CLOUDINARY_CLOUD_NAME?.trim() || "";

export const isCloudinaryConfigured = () =>
  Boolean(
    cloudName() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim()
  );

export const uploadUrl = (name = cloudName()) =>
  `${CLOUDINARY_HOST}/v1_1/${name}/image/upload`;

export const isCloudinaryUrl = (value) =>
  typeof value === "string" && value.startsWith(`${CLOUDINARY_DELIVERY}/`);

export const isStoredImage = (value) =>
  typeof value === "string" &&
  (value.startsWith("/assets/") || isCloudinaryUrl(value));
