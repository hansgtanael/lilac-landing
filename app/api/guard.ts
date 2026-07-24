/** Shared request guards for the public API routes. */

/** CSRF defense for public state-changing routes (e.g. the booking inquiry):
 *  a cross-origin browser POST always carries an Origin header, so if Origin is
 *  present and its host does not match the request's own Host, reject. Works in
 *  any deploy environment (localhost or the live domain) because it compares
 *  against the request's own host rather than a static allowlist. Same-origin
 *  requests that omit Origin are allowed — they carry no cross-site risk. */
export function requireSameOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const host = request.headers.get("host");
  let originHost: string | null = null;
  try {
    originHost = new URL(origin).host;
  } catch {
    /* malformed -> rejected below */
  }
  if (!originHost || originHost !== host) {
    return Response.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
  }
  return null;
}

/** Rejects bodies whose declared size exceeds `maxBytes` (null to proceed).
 *  Content-Length is set by the browser for fetch bodies; a missing header
 *  falls through to the JSON/form parser, which fails safely on garbage. */
export function guardBodySize(request: Request, maxBytes: number): Response | null {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > maxBytes) {
    return Response.json(
      { error: `Request body exceeds the ${Math.round(maxBytes / 1_000_000)} MB limit.` },
      { status: 413 },
    );
  }
  return null;
}
