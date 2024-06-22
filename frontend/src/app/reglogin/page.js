'use client'
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { useContext } from "react"
import { AuthContext, AuthContextDispatch } from "../components/authContexts"

export default function LoginRegister() {
    const authInfo = useContext(AuthContext)
    const router = useRouter()
    if (authInfo?.isAuth || authInfo?.token) {
        router.push("/dashboard")
    }
    const setAuthInfo = useContext(AuthContextDispatch)
    const { register, handleSubmit, formState: { errors } } = useForm()
    const [currentSection, setCurrentSection] = useState("Login")
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
            const sentData = { username: data.email, password: data.password }
            // axios.post("http://localhost:8080/v1/auth", sentData).then((res) => {
            //     if(res.status === 200){
            //         toast.success("Login successful")
            //         console.log(res.data)
            //     }
            // }).catch((err) => {
            //     toast.error("An error occured")
            // })
            setAuthInfo({ isAuth: true, token: "sample jwt token" })
            router.push("/dashboard")

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
                const sentData = { username: data.email, password: data.password, role: data.Type }
                document.getElementById("confirm_password").classList.remove("border-red-500")
                document.getElementById("confirm_password").classList.add("border-black")
                document.getElementById("confirm_password").classList.add("border-2")
                document.getElementById("password_mismatch_label").hidden = true
                router.push(`/verifyotp?email=${data.email}`)
                // axios.post("http://localhost:8080/v1/auth/register", sentData).then((res) => {
                //     console.log("Response")
                //     console.log(res)
                //     if (res.status === 200) {
                //         toast.success("Registration successful going to OTP verification")
                //         router.push(`/verifyotp?email=${data.email}`)
                //     }
                //     else {
                //         toast.error("Registration failed")
                //     }
                // }).catch((err) => {
                //     console.log(err)
                //     toast.error("An error occured. Registration failed",{
                //         description: "A user with this email already exists. Please login or use another email"
                //     })
                // })
            }
        }
    }


    return (
        <div className="flex w-screen flex-col h-screen items-center justify-center flex-wrap flex-shrink">
            <div className="flex w-full flex-col  p-10 items-center justify-center flex-wrap flex-shrink ">
                <div className="flex flex-row justify-center items-center">
                    <button onClick={() => { setCurrentSection("Login") }} id="loginsection" className="text-2xl font-bold text-center m-2">Login</button>
                    <Separator className=" w-[2px] bg-purple-400" orientation="vertical" />
                    <button onClick={() => { setCurrentSection("Register") }} id="registersection" className="text-2xl font-bold text-center m-2">Register</button>
                </div>
                <Separator className="bg-purple-400 m-2 w-80" />
                <form className="flex w-96 p-5 rounded-2xl flex-col items-center justify-between flex-wrap flex-shrink bg-purple-100 m-5" onSubmit={handleSubmit(submitForm)}>
                    <label className="text-xl font-bold m-2">Email</label>
                    <input type="email" placeholder="Email" className="border-2 border-pink-700 rounded-md p-2" {...register("email", { required: true, maxLength: 32 })} />
                    {errors.email?.type === "required" && <span className="text-red-500">This field is required</span>}
                    {errors.email?.type === "maxLength" && <span className="text-red-500">Max length is 32</span>}
                    <label className="text-xl font-bold mt-5">Password</label>
                    <input id="password" type="password" placeholder="Password" className="border-2 border-pink-700 rounded-md p-2 mt-2" {...register("password", { required: true, maxLength: 64 })} />
                    {errors.password?.type === "required" && <span className="text-red-500">This field is required</span>}
                    {errors.password?.type === "maxLength" && <span className="text-red-500">Max length is 64</span>}
                    <div className="flex flex-row items-center justify-center mt-1">
                        <Checkbox defaultChecked={false} id="show_pass" onCheckedChange={(checked) => {
                            if (checked) {
                                document.getElementById("password").type = "text"
                            }
                            else {
                                document.getElementById("password").type = "password"
                            }
                        }} />
                        <label htmlFor="show_pass" className="text-sm font-bold ml-2">Show Password</label>
                    </div>
                    {currentSection === "Register" && (
                        <>
                            <label className="text-xl font-bold mt-5">Confirm Password</label>
                            <input id="confirm_password" type="password" placeholder="Password" className="border-2 border-pink-700 rounded-md p-2 mt-2" {...register("confirm_password", { required: true, maxLength: 64 })} />
                            <span id="password_mismatch_label" hidden className="text-red-500">Passwords should match</span>
                            <select className="w-32 mt-5 h-9 rounded p-2" {...register("Type", { required: true })}>
                                <option className="w-full m-3" value="ROLE_PATIENT">PATIENT</option>
                                <option className="w-full m-3" value="ROLE_DOCTOR">DOCTOR</option>
                                <option className="w-full m-3" value="ROLE_NURSE">NURSE</option>
                                <option className="w-full m-3" value="ROLE_ADMIN">ADMIN</option>
                            </select>
                        </>
                    )
                    }
                    <button type="submit" className="bg-pink-500 text-white p-2 m-4 w-1/2 rounded-md hover:scale-105 hover:bg-pink-100 hover:text-pink-950 hover:border-double hover:border-pink-900 hover:border-2 transition ease-out duration-300">{currentSection}</button>
                </form>
            </div>
        </div>
    )
}