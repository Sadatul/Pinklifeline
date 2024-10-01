import { NextResponse, NextRequest } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json()
        console.log("Register api",body)
        return NextResponse.json({
            message: "Registration Successful",
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