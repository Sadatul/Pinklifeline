import { NextRequest, NextResponse } from "next/server";
import { pagePaths } from "./utils/constants";

export function middleware(request) {
    const path = request.nextUrl.pathname;
    const publicPaths = ["/", "/reglogin", "/verifyotp"];
    const tokenName = "access_token";
    if (!publicPaths.find((publicPath) => path.startsWith(publicPath)) && !request.cookies.get(tokenName)) {
        console.log(path, publicPaths.find((publicPath) => path.startsWith(publicPath)))
        console.log(request.cookies.get(tokenName));
        console.log("redirecting to login page");
        // return NextResponse.redirect(new URL('/reglogin', request.nextUrl));
    }
    else if ((path === "/" || path === "/dashboard") && request.cookies.get(tokenName)) {
        console.log(request.cookies.get(tokenName));
        // return NextResponse.redirect(new URL(pagePaths.dashboardPages.userdetailsPage, request.nextUrl));
    }
}

export const config = {
    matcher: [
        '/',
        '/profile/:path*',
        '/reglogin/:path*',
        '/verifyotp/:path*',
        '/dashboard/:path*',
        '/userdetails/:path*',
        '/validatetransaction/:path*',
        '/admin/:path*',
    ]
}