import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import { PATHS } from "./utils/constants";

const PRIVATE_ROUTES = [PATHS.ATTEMPTS.slice(0, -1), PATHS.USERS.slice(0, -1)];

const isPrivateRoute = (pathname: string) =>
  PRIVATE_ROUTES.some((route) => pathname.includes(route));

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname } = url;
  if (pathname.startsWith("/api/auth/")) {
    // Allow auth related routes
    return NextResponse.next();
  }

  /**
   * Server Requests
   */
  const token = req.headers.get("Authorization");
  if (token) {
    return NextResponse.next();
  }

  const isNotFromSite = !req.headers
    .get("referer")
    ?.includes(process.env.NEXTAUTH_URL as string);

  if (
    pathname.startsWith(`/api/`) &&
    isPrivateRoute(pathname) &&
    isNotFromSite
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|fonts|examples|svg|[\\w-]+\\.\\w+).*)"],
};
