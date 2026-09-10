import { getImage } from "@/lib/api/review-images";

export const dynamic = "force-dynamic";

export const GET = async (_request, { params }) => {
  const { id } = await params;
  const image = await getImage(id);

  if (!image) return new Response("Not found", { status: 404 });

  return new Response(image.buffer, {
    headers: {
      "content-type": image.type,
      "cache-control": "public, max-age=31536000, immutable",
      "content-disposition": "inline",
      "x-content-type-options": "nosniff",
    },
  });
};
