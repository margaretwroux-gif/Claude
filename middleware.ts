import { NextResponse, type NextRequest } from "next/server";

/**
 * Optional HTTP Basic Auth. When DASHBOARD_PASSWORD is set, every request must supply it
 * (the username is ignored). Leave it unset to run the dashboard without a password.
 */
export function middleware(req: NextRequest) {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return NextResponse.next();

  const header = req.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    let decoded = "";
    try {
      decoded = atob(encoded);
    } catch {
      // Malformed header; fall through to the 401.
    }
    const supplied = decoded.slice(decoded.indexOf(":") + 1);
    if (decoded && timingSafeEqual(supplied, password)) return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Dashboard", charset="UTF-8"' },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
