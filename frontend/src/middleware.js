import { NextRequest, NextResponse } from "next/server";

export function middleware(request) {
    const path = request.nextUrl.pathname;
    const publicPaths = ["/", "/reglogin", "/verifyotp"];
    const tokenName = "access_token";
    if (!publicPaths.find((publicPath) => path === publicPath) && !request.cookies.get(tokenName)) {
        console.log('middleware.js: redirecting to /reglogin');
        // return NextResponse.redirect(new URL('/reglogin', request.nextUrl));
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
    ]
}