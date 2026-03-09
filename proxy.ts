import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkSession } from "@/lib/api/serverApi";

const PRIVATE_ROUTES = ["/profile", "/notes"];
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export default async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const { pathname } = request.nextUrl;

  const isPrivate = PRIVATE_ROUTES.some((route) => pathname.startsWith(route));
  const isAuth = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (!accessToken && !refreshToken && isPrivate) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (!accessToken && refreshToken) {
    try {
      const res = await checkSession();

      const nextResponse = NextResponse.next();

      const setCookies = res.headers["set-cookie"];
      if (setCookies) {
        if (typeof setCookies === "string") {
          nextResponse.headers.append("Set-Cookie", setCookies);
        } else {
          setCookies.forEach((cookie) => {
            nextResponse.headers.append("Set-Cookie", cookie);
          });
        }
      }

      if (isAuth) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      return nextResponse;
    } catch (err) {
      if (isPrivate) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
      return NextResponse.next();
    }
  }

  if (accessToken && isAuth) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};