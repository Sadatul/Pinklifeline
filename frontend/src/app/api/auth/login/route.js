import { NextResponse, NextRequest } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json()
        console.log("Log in api",body)
        return NextResponse.json({
            message: "Log in Successful",
            success: true
        }, { status: 200 })

    } catch (e) {
        console.log(e)
        return NextResponse.json({
            message: error.message,
            success: false
        }, { status: 200 })
    }
}