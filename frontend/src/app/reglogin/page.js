'use client'
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import axiosInstance from "@/utils/axiosInstance"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { loginUrlReq, registerUrlReq, roles, pagePaths, sessionDataItem, forgotPasswordUrlReq } from "@/utils/constants"
import Link from "next/link"
import { CircleHelp } from "lucide-react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

export default function LoginRegister() {
    const router = useRouter()
    const { register, handleSubmit, formState: { errors }, getValues } = useForm()
    const [currentSection, setCurrentSection] = useState("Login")
    const [showPassword, setShowPassword] = useState(false)
    useEffect(() => {
        if (currentSection === "Login") {
            document.getElementById("loginsection").classList.add("text-purple-500")
            document.getElementById("registersection").classList.remove("text-purple-500")
        }
        else if (currentSection === "Register") {
            document.getElementById("registersection").classList.add("text-purple-500")
            document.getElementById("loginsection").classList.remove("text-purple-500")
        }
    }, [currentSection])

    const submitForm = async (data) => {
        console.log(data)
        if (currentSection === "Login") {
            document.getElementById("submit-button-text").hidden = true
            document.getElementById("submit-button-loading-state").hidden = false
            const sentData = { username: data.email, password: data.password }
            axiosInstance.post(loginUrlReq, sentData).then((res) => {
                if (res.status === 200) {
                    toast.success("Login successful")
                    console.log("Response")
                    console.log(res.data)
                    const sessionData = {
                        userId: res.data?.userId,
                        role: res.data?.roles[0],
                        username: res.data?.username,
                        isVerified: res.data?.isVerified || res.data?.roles[0] === roles.basicUser || res.data?.roles[0] === roles.patient,
                        subscribed: res.data?.subscribed,
                        isRegisterComplete: res.data?.isRegistered,
                        time: new Date(),
                        refreshTime: new Date()
                    }
                    localStorage.clear();
                    localStorage.setItem(sessionDataItem, JSON.stringify(sessionData))
                    if (res.data?.roles[0] === roles.admin) {
                        window.location.href = pagePaths.unverifiedDoctorsPageForAdmin
                    }
                    else if (res.data?.isRegistered === false) {
                        window.location.href = pagePaths.userdetails
                    }
                    else {
                        window.location.href = pagePaths.dashboardPages.userdetailsPage
                    }
                }
            }).catch((err) => {
                console.log(err)
                toast.error("An error occured.", {
                    description: err?.response?.data?.message
                })
                document.getElementById("submit-button-text").hidden = false
                document.getElementById("submit-button-loading-state").hidden = true
            })
        }
        else if (currentSection === "Register") {
            if (data.password !== data.confirm_password) {
                toast.error("Passwords must match")
                document.getElementById("confirm_password").focus()
                document.getElementById("confirm_password").classList.add("border-red-500")
                document.getElementById("confirm_password").classList.add("border-2")
                document.getElementById("password_mismatch_label").hidden = false
                return
            }
            else {
                const sentData = { username: data.email, password: data.password, role: data.role }
                document.getElementById("confirm_password").classList.remove("border-red-500")
                document.getElementById("confirm_password").classList.add("border-black")
                document.getElementById("confirm_password").classList.add("border-2")
                document.getElementById("password_mismatch_label").hidden = true
                document.getElementById("submit-button-text").hidden = true
                document.getElementById("submit-button-loading-state").hidden = false
                console.log("Sent data")
                console.log(sentData)
                axiosInstance.post(registerUrlReq, sentData).then((res) => {
                    console.log("Response")
                    console.log(res)
                    if (res.status === 200) {
                        toast.success("Registration successful going to OTP verification")
                        router.push(pagePaths.verifyotp(data?.email))
                    }
                    else {
                        toast.error("Registration failed", {
                            description: "An error occured. Please try again later"
                        })
                        document.getElementById("submit-button-text").hidden = false
                        document.getElementById("submit-button-loading-state").hidden = true
                    }
                }).catch((err) => {
                    console.log(err)
                    toast.error("An error occured. Registration failed", {
                        description: "A user with this email already exists. Please login or use another email"
                    })
                    document.getElementById("submit-button-text").hidden = false
                    document.getElementById("submit-button-loading-state").hidden = true
                })
            }
        }
    }


    return (
        <div className="flex w-screen flex-col h-screen items-center flex-wrap flex-shrink p-10">
            <div className="flex w-full flex-col  p-10 items-center justify-center flex-wrap flex-shrink ">
                <div className="flex flex-row justify-center items-center">
                    <button onClick={() => { setCurrentSection("Login") }} id="loginsection" className="text-2xl font-bold text-center m-2">Login</button>
                    <Separator className=" w-[2px] bg-purple-400" orientation="vertical" />
                    <button onClick={() => { setCurrentSection("Register") }} id="registersection" className="text-2xl font-bold text-center m-2">Register</button>
                </div>
                <Separator className="bg-purple-400 m-2 w-80" />
                <form className="flex w-96 p-5 rounded-2xl flex-col items-center justify-between flex-wrap flex-shrink bg-purple-100 m-5 " onSubmit={handleSubmit(submitForm)}>
                    <label className="text-xl font-bold m-2">Email</label>
                    <input id="email-input" type="text" placeholder="Email" className="border-2 border-pink-700 rounded-md p-2"
                        {...register("email", {
                            required: "Email is required", maxLength: { value: 64, message: "Maximum length allowed is 64" }
                        })} />
                    {errors.email && <span className="text-red-500">{errors.email?.message}</span>}
                    {currentSection === "Register" && (
                        <select className="w-64 mt-5 h-9 rounded p-2 border border-gray-400" defaultValue={roles.basicUser} {...register("role")}>
                            <option className="w-full m-3" value={roles.basicUser}>Basic User</option>
                            <option className="w-full m-3" value={roles.patient}>Patient</option>
                            <option className="w-full m-3" value={roles.doctor}>Health Care Provider</option>
                        </select>

                    )
                    }
                    <div className="text-xl font-bold mt-5 flex items-center">
                        Password
                        {currentSection === "Register" &&
                            <HoverCard closeDelay={50}>
                                <HoverCardTrigger asChild>
                                    <CircleHelp size={16} className="text-gray-700 ml-2 cursor-default" />
                                </HoverCardTrigger>
                                <HoverCardContent asChild side="right" >
                                    <div className="flex flex-col gap-2 text-xs bg-opacity-50">
                                        <span>
                                            Minimum 6 characters
                                        </span>
                                        <span>
                                            Must contain a number
                                        </span>
                                        <span>
                                            Must contain a special character
                                        </span>
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                        }
                    </div>
                    <input id="password" type={showPassword ? "text" : "password"} placeholder="Password" className="border-2 border-pink-700 rounded-md p-2 mt-2" {...register("password", { required: "Password is required", maxLength: { value: 64, message: "Maximum length 64 characters" } })} />
                    {errors.password?.type === "required" && <span className="text-red-500">{errors.password?.message}</span>}
                    {currentSection === "Register" && (
                        <>
                            <label className="text-xl font-bold mt-5">Confirm Password</label>
                            <input id="confirm_password" type="password" placeholder="Password" className="border-2 border-pink-700 rounded-md p-2 mt-2" {...register("confirm_password", { required: true, maxLength: 64 })} />
                            <span id="password_mismatch_label" hidden className="text-red-500">Passwords should match</span>
                        </>
                    )

                    }
                    <div className="flex flex-row items-center justify-center mt-1">
                        <Checkbox defaultChecked={false} id="show_pass" onCheckedChange={(checked) => {
                            setShowPassword(checked)
                        }} />
                        <label htmlFor="show_pass" className="text-sm font-bold ml-2">Show Password</label>
                    </div>

                    <div hidden={true} id="submit-button-loading-state" className="px-2 p-1 m-4 w-1/2 border shadow-md rounded-md text-center">
                        <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg>
                    </div>
                    <button id="submit-button-text" type="submit" className="bg-pink-500 text-white p-2 m-4 w-1/2 rounded-md hover:scale-105 hover:bg-pink-100 hover:text-pink-950 hover:border-double hover:border-pink-900 hover:border-2 transition ease-out duration-300">
                        <span >{currentSection}</span>
                    </button>
                    {currentSection === "Login" &&
                        <div className="text-base hover:underline text-blue-500 cursor-pointer" onClick={() => {
                            if (!document.getElementById("email-input")?.value || document.getElementById("email-input")?.value === "") {
                                document.getElementById("error-email-empty").innerText = "Email is missing enter email please"
                                return
                            }
                            else {
                                document.getElementById("error-email-empty").innerText = ""
                            }
                            toast.loading("requesting password reset link")
                            axiosInstance.get(forgotPasswordUrlReq(document.getElementById("email-input").value)).then((res) => {
                                toast.success("Password reset link sent to email", {
                                    duration: 5000,
                                    position: 'top-right',
                                    description: "Password reset link has been sent to your email. Please check your email to reset your password"
                                })
                            }).catch((err) => {
                                toast.error("An error occured", {
                                    description: "An error occured. Please try again later"
                                })
                            }).finally(() => {
                                toast.dismiss()
                            })
                        }}>
                            Forgot Password?
                        </div>
                    }
                    <span id="error-email-empty" className="text-red-500 text-sm"></span>
                </form>
            </div>
        </div>
    )
}