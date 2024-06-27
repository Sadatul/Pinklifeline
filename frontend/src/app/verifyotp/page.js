'use client'
import { Suspense } from "react"
import LoginRegister from "./otp"

export default function VerifyOTP() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginRegister />
        </Suspense>
    )
}