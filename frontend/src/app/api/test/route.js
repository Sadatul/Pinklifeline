import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
    try {
        const cookieStore = cookies()
        console.log("Coockie currently,", cookieStore.getAll())
        const response =  NextResponse.json({
            message: "Successful",
            success: true
        }, { status: 200 })
        response.cookies.set("test", `test at ${new Date().toISOString()}`,{
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
        })
        return response
    } catch (e) {
        console.log(e)
        return NextResponse.json({
            message: error.message,
            success: false
        }, { status: 200 })
    }
}