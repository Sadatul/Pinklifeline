import { NextResponse } from "next/server";


export async function POST(request) {
    // save the upcoming request in file log.txt
    const body = await request.formData()
    console.log(body)
    return NextResponse.json({
        message: "Registration Successful",
        success: true
    }, { status: 200 })
}