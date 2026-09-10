import { guard } from "@/lib/api/admin/guard";
import { signParams } from "@/lib/api/cloudinary-sign";
import { cloudName, isCloudinaryConfigured, uploadUrl } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const FOLDER = "general-store/products";

export const POST = async (request) => {
  const { response } = await guard(request, { mutation: true });

  if (response) return response;

  if (!isCloudinaryConfigured())
    return Response.json(
      {
        error:
          "Image hosting is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
      },
      { status: 503 }
    );

  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder: FOLDER, timestamp };

  return Response.json({
    ...params,
    signature: signParams(params, process.env.CLOUDINARY_API_SECRET.trim()),
    apiKey: process.env.CLOUDINARY_API_KEY.trim(),
    cloudName: cloudName(),
    endpoint: uploadUrl(),
  });
};
