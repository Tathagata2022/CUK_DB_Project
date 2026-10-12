import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // RBAC Logic
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.rewrite(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/authority") && token?.role !== "COMPETENT_AUTHORITY" && token?.role !== "ADMIN") {
      return NextResponse.rewrite(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/hod") && token?.role !== "HOD" && token?.role !== "ADMIN") {
      return NextResponse.rewrite(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/dashboard") && !token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/",
    }
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/authority/:path*", "/hod/:path*"]
};
