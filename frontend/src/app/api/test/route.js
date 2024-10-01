import { NextResponse, NextRequest } from "next/server";
// import { cookies } from "next/headers";

export async function GET(request) {
    try {
        // const cookieStore = cookies()
        // console.log("Coockie currently,", cookieStore.getAll())
        const response =  NextResponse.json({
            message: "Successful",
            success: true
        }, { status: 202 })
        return response
    } catch (e) {
        console.log(e)
        return NextResponse.json({
            message: error.message,
            success: false
        }, { status: 200 })
    }
}