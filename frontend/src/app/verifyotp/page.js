'use client'
import { Suspense } from "react"
import OTPVerify from "./otp"
import Loading from "../components/loading"

export default function VerifyOTP() {
    return (
        <Suspense fallback={<Loading />}>
            <OTPVerify />
        </Suspense>
    )
}