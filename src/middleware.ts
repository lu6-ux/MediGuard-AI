import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.AUTH_SECRET || "default_secret_for_local_dev_only";
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  const protectedPaths = ["/dashboard", "/documents", "/timeline", "/safety", "/labs", "/summary", "/settings", "/profile"];
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isProtectedPath) {
    if (!session) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    try {
      await jwtVerify(session, key, { algorithms: ["HS256"] });
    } catch (err) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }
  
  if (session && (request.nextUrl.pathname.startsWith("/signin") || request.nextUrl.pathname.startsWith("/signup"))) {
      return NextResponse.redirect(new URL("/documents", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

