import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import { PATHS } from "./utils/constants";

const PRIVATE_ROUTES = [PATHS.ATTEMPTS.slice(0, -1), PATHS.USERS.slice(0, -1)];
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_ADDRESS,
  process.env.NEXTAUTH_URL,
  "https://examapp-topaz.vercel.app",
].filter(Boolean) as string[];

const isPrivateRoute = (pathname: string) =>
  PRIVATE_ROUTES.some((route) => pathname.includes(route));

const applyCorsHeaders = (request: NextRequest, response: NextResponse) => {
  const origin = request.headers.get("origin");
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0] ?? "*";

  response.headers.set("Access-Control-Allow-Origin", allowOrigin);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Vary", "Origin");

  return response;
};

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname } = url;
  const isApiRoute = pathname.startsWith("/api/");

  if (isApiRoute) {
    if (req.method === "OPTIONS") {
      const response = applyCorsHeaders(
        req,
        new NextResponse(null, { status: 204 })
      );
      return response;
    }

    const response = applyCorsHeaders(req, NextResponse.next());

    if (pathname.startsWith("/api/auth/")) {
      return response;
    }

    /**
     * Server Requests
     */
    const token = req.headers.get("Authorization");
    if (token) {
      return response;
    }

    const isNotFromSite = !req.headers
      .get("referer")
      ?.includes(process.env.NEXTAUTH_URL as string);

    if (
      pathname.startsWith(`/api/`) &&
      isPrivateRoute(pathname) &&
      isNotFromSite
    ) {
      return applyCorsHeaders(
        req,
        NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      );
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|fonts|examples|svg|[\\w-]+\\.\\w+).*)"],
};
