import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  html: "text/html; charset=utf-8",
  json: "application/json; charset=utf-8",
  js:   "application/javascript; charset=utf-8",
  css:  "text/css; charset=utf-8",
  png:  "image/png",
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  svg:  "image/svg+xml",
  ico:  "image/x-icon",
  txt:  "text/plain; charset=utf-8",
};

function getContentType(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = path.join("/");

  try {
    const { env } = await getCloudflareContext();
    const bucket = (env as any).MEDIA as R2Bucket | undefined;

    if (!bucket) {
      return NextResponse.json({ error: "R2 bucket not bound" }, { status: 503 });
    }

    const object = await bucket.get(key);

    if (!object) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await object.arrayBuffer();
    const contentType = object.httpMetadata?.contentType ?? getContentType(key);

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "X-R2-Key": key,
      },
    });
  } catch (err) {
    console.error("[r2-proxy] error fetching", key, err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
