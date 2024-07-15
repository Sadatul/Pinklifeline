import { NextResponse } from "next/server";
import { StreamClient } from '@stream-io/node-sdk';


export async function GET(request) {
    try {
        const apiKey = process.env.STREAM_API_KEY
        const apiSecret = process.env.STREAM_API_SECRET
        if (!apiKey || !apiSecret) {
            return NextResponse.json({
                message: "Stream API key or secret is missing",
                success: false
            }, { status: 500 })
        }
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.search);
        const userId = searchParams.get("userId");
        const streamClient = new StreamClient(apiKey, apiSecret);
        console.log("Generating token for user: ", userId);

        const expirationTime = Math.floor(Date.now() / 1000) + 5 * 3600;
        const issuedAt = Math.floor(Date.now() / 1000) - 60;

        const token = streamClient.createToken(userId, expirationTime, issuedAt);
        return NextResponse.json({
            message: "Token Generated",
            token: token,
            success: true
        }, { status: 200 })
    } catch (err) {
        return NextResponse.json({
            message: "Internal Server Error",
            success: false
        }, { status: 500 })
    }
}