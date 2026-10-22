import { isTextureHash } from "@/lib/minecraft";

// textures.minecraft.net sends no CORS headers, and the head reads the skin's
// pixels from a canvas, so the texture is served from here. A hash never
// changes its picture, so it is cached for good
export async function GET(_: Request, { params }: RouteContext<"/api/skin/[hash]">) {
  const { hash } = await params;
  if (!isTextureHash(hash)) return new Response(null, { status: 404 });
  const res = await fetch(`https://textures.minecraft.net/texture/${hash}`, {
    signal: AbortSignal.timeout(5000),
  }).catch(() => null);
  if (!res?.ok) return new Response(null, { status: 502 });
  return new Response(await res.arrayBuffer(), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
