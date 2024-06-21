'use client'
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import axios from "axios"


export default function LoginRegister() {
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
            const sentData = { email: data.email, password: data.password }
            axios.post("/api/auth/login", sentData).then((res) => {
                if (res.data.success) {
                    toast.success(res.data.message)
                }
                else {
                    toast.error(res.data.message)
                }
            }).catch((err) => {
                toast.error("An error occured")
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
                const sentData = { email: data.email, password: data.password, type: data.Type }
                document.getElementById("confirm_password").classList.remove("border-red-500")
                document.getElementById("confirm_password").classList.add("border-black")
                document.getElementById("confirm_password").classList.add("border-2")
                document.getElementById("password_mismatch_label").hidden = true
                axios.post("/api/auth/register", sentData).then((res) => {
                    if (res.data.success) {
                        toast.success(res.data.message)
                    }
                    else {
                        toast.error(res.data.message)
                    }
                }).catch((err) => {
                    toast.error("An error occured")
                })
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
                    <input type="email" placeholder="Email" className="border-2 border-black rounded-md p-2" {...register("email", { required: true, maxLength: 32 })} />
                    {errors.email?.type === "required" && <span className="text-red-500">This field is required</span>}
                    {errors.email?.type === "maxLength" && <span className="text-red-500">Max length is 32</span>}
                    <label className="text-xl font-bold mt-5">Password</label>
                    <input type="password" placeholder="Password" className="border-2 border-black rounded-md p-2 mt-2" {...register("password", { required: true, maxLength: 64 })} />
                    {errors.password?.type === "required" && <span className="text-red-500">This field is required</span>}
                    {errors.password?.type === "maxLength" && <span className="text-red-500">Max length is 64</span>}
                    {currentSection === "Register" && (
                        <>
                            <label className="text-xl font-bold mt-5">Confirm Password</label>
                            <input id="confirm_password" type="password" placeholder="Password" className="border-2 border-black rounded-md p-2 mt-2" {...register("confirm_password", { required: true, maxLength: 64 })} />
                            <span id="password_mismatch_label" hidden className="text-red-500">Passwords should match</span>
                            <select className="w-32 mt-5 h-9 rounded p-2" {...register("Type", { required: true })}>
                                <option className="w-full m-3" value="General">General</option>
                                <option className="w-full m-3" value=" Doctor"> Doctor</option>
                                <option className="w-full m-3" value=" Nurse"> Nurse</option>
                                <option className="w-full m-3" value=" Hospital"> Hospital</option>
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