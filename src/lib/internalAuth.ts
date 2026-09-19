import { timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";

export function isAuthorizedInternalRequest(request: NextRequest): boolean {
  const secret = process.env.N8N_SHARED_SECRET;
  if (!secret) return false;

  const provided = request.headers.get("x-internal-token");
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
