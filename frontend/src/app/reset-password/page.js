'use client'

import { Suspense, useState } from "react"
import Loading from "../components/loading"
import { useRouter, useSearchParams } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import axiosInstance from "@/utils/axiosInstance"
import { forgotPasswordUrlReq, pagePaths, passwordRegex } from "@/utils/constants"

function ResetPassword() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const email = searchParams.get('email')
    const token = searchParams.get('token')
    const [showPassword, setShowPassword] = useState(false)
    const handleResetPassword = () => {
        console.log('Reset Password')
        const password = document.getElementById('password-input').value
        const confirmPassword = document.getElementById('confirm-password-input').value
        if (password === '' || confirmPassword === '') {
            document.getElementById('error-message').innerText = 'Password cannot be empty'
            return
        }
        if (password.length < 6) {
            document.getElementById('error-message').innerText = 'Password must be at least 6 characters long'
            return
        }
        else if (password !== confirmPassword) {
            document.getElementById('error-message').innerText = 'Passwords do not match'
            return
        }
        document.getElementById('error-message').innerText = ''
        axiosInstance.put(forgotPasswordUrlReq(), {
            email: email,
            token: token,
            password: password
        }).then(res => {
            console.log(res)
            router.push(pagePaths.login)
        }).catch(err => {
            console.log(err)
        })
    }

    return (
        <div className="flex flex-col h-screen w-screen items-center p-10 bg-white">
            <div className="w-fit shadow-sm rounded-md flex flex-col p-0">
                <div className="bg-purple-200 p-5 text-center text-lg font-semibold rounded-t-lg">
                    Reset Password
                </div>
                <div className="p-5 gap-4 flex flex-col bg-purple-50 rounded-b-md">
                    <label className="text-sm font-bold flex flex-col gap-2">
                        Password
                        <input id="password-input" type={showPassword ? "text" : "password"} className="w-full p-2 rounded-md border border-gray-300" />
                    </label>
                    <label className="text-sm font-bold flex flex-col gap-2">
                        Confirm Password
                        <input id="confirm-password-input" type="password" className="w-full p-2 rounded-md border border-gray-300" />
                    </label>
                    <span id="error-message" className="text-red-500 text-sm"></span>
                    <div className="flex flex-row items-center justify-center mt-1">
                        <Checkbox defaultChecked={false} id="show_pass" onCheckedChange={(checked) => {
                            setShowPassword(checked)
                        }} />
                        <label htmlFor="show_pass" className="text-sm font-bold ml-2">Show Password</label>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span id="pass-6-char" className="text-sm text-gray-500">Password must be at least 6 characters long</span>
                        <span id="pass-one-number" className="text-sm text-gray-500">Password must contain at least one number</span>
                        <span id="pass-special-char" className="text-sm text-gray-500">Password must contain at least one special character</span>
                    </div>
                    <button className="w-full p-2 bg-blue-500 text-white rounded-md hover:scale-95" onClick={() => { handleResetPassword() }}>Reset Password</button>
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ResetPassword />
        </Suspense>
    )
}