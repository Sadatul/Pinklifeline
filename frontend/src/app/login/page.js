'use client'
import { motion } from "framer-motion";
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import axiosInstance from "@/utils/axiosInstance"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { loginUrlReq, registerUrlReq, roles, pagePaths, sessionDataItem, forgotPasswordUrlReq } from "@/utils/constants"
import Link from "next/link"
import { ActivityIcon, BotIcon, CircleHelp, EyeIcon, EyeOff, Loader, Loader2Icon, LucideMessageCircleQuestion, Pencil, Plus } from "lucide-react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import loginBg from "../../../public/loginbg.jpeg"
import Image from "next/image";
import { random, repeat } from "lodash";

export default function LoginRegister() {

    const text = "Pink Life Line"; // Your text

    const letterAnimation = {
        hidden: { y: 0 },
        visible: (i) => ({
            y: -10, // Jump upwards
            transition: {
                delay: i * 0.2, // Staggering effect
                duration: 0.5,
                repeat: Infinity, // Infinite jump
                repeatType: "reverse", // Makes the letters go up and then come back down
                repeatDelay: 2.5, // Delay between each letter's jump
            },
        }),
    };

    const reflectionAnimation = {
        hidden: { y: 0 },
        visible: (i) => ({
            y: 10, // Reflection moves downward
            
            transition: {
                delay: i * 0.2, // Sync with the text above
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 2.5,
            },
        }),
    };


    return (
        <div className="flex w-screen flex-col h-screen items-center flex-wrap flex-shrink px-5 bg-white">
            <div className="flex flex-row w-full h-full items-center justify-between flex-wrap flex-shrink relative">
                <div className="flex flex-col justify-center items-center h-full py-2 rounded-l-md">
                    <SideComponent />
                </div>
                {/* <div className="w-20 absolute right-[36%] h-full bg-gradient-to-r from-transparent to-green-100"></div> */}
                <div className="flex flex-col justify-start items-center h-full pt-20 flex-1 gap-5">
                    <div className="flex flex-col items-center w-fit h-fit text-4xl font-extrabold relative mb-6">
                        {/* Original text */}
                        <div className="flex">
                            {text.split("").map((char, index) => (
                                <motion.span
                                    key={index}
                                    custom={index}
                                    initial="hidden"
                                    animate="visible"
                                    variants={letterAnimation}
                                    className="text-pink-500"
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </div>

                        {/* Reflection text */}
                        <div className="flex absolute top-full -mt-2">
                            {text.split("").map((char, index) => (
                                <motion.span
                                    key={index}
                                    custom={index}
                                    initial={{rotateX : 180}}
                                    animate="visible"
                                    variants={reflectionAnimation}
                                    className="text-pink-200 text-reflection"
                                >
                                    <span className="rotate-90">
                                    {char}
                                    </span>
                                </motion.span>
                            ))}
                        </div>
                    </div>
                    <InputComponent />
                </div>
            </div>
        </div>
    )
}

function SideComponent() {
    const cards_one = Array(2).fill(0);
    const [duration, setDuration] = useState(1);

    const card_width = 304
    const card_height = 188;
    const left_offset = 128;
    const upper_offset = 68;
    const card_positions = [
        { x: left_offset, y: upper_offset },
        { x: left_offset, y: upper_offset + card_height },
        { x: left_offset, y: upper_offset + 2 * card_height },
        { x: left_offset + card_width, y: upper_offset + 2 * card_height },
        { x: left_offset + card_width, y: upper_offset + card_height },
        { x: left_offset + card_width, y: upper_offset },
    ]

    // Define the positions for the animation in a clockwise manner
    const positions = [
        { x: -250, y: 0 },   // Move left
        { x: 0, y: -150 },   // Move up
        { x: 250, y: 0 },    // Move right
        { x: 0, y: 150 }     // Move down
    ];
    const cards_one_positions = [
        card_positions[0],
        card_positions[1],
        card_positions[2],
        card_positions[3],
        card_positions[4],
        card_positions[5],
        card_positions[0],
    ];
    const cards_two_positions = [
        card_positions[1],
        card_positions[2],
        card_positions[3],
        card_positions[4],
        card_positions[5],
        card_positions[0],
        card_positions[1],
    ]
    const card_three_positions = [
        card_positions[3],
        card_positions[4],
        card_positions[5],
        card_positions[0],
        card_positions[1],
        card_positions[2],
        card_positions[3],
    ]
    const card_four_positions = [
        card_positions[4],
        card_positions[5],
        card_positions[0],
        card_positions[1],
        card_positions[2],
        card_positions[3],
        card_positions[4],
    ]

    // Manage the current position index
    const [positionIndex, setPositionIndex] = useState(0);

    useEffect(() => {
        // Update positionIndex every 2 seconds to animate the cards
        const interval = setInterval(() => {
            setPositionIndex((prevIndex) => (prevIndex + 1) % cards_one_positions.length);
            if (random(0, 1) === 1) {
                setDuration(1.5)
            }
            else {
                setDuration(1)
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);
    return (
        <div className="relative flex flex-col w-full h-full gap-y-3 overflow-hidden">
            <div className="flex flex-row items-center w-full h-fit gap-x-4 overflow-hidden ">
                <div className="w-28 rounded-r-xl h-14 bg-opacity-40 flex items-center justify-center rounded-t-none"
                    style={{
                        // backdropFilter: "blur(3px)", // Creates blur on the background where cards pass
                        backgroundImage: `url(loginbg/1.jpg)`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center"
                    }}></div>
                {cards_one.map((_, index) => (
                    <div key={index} className="w-72 rounded-xl h-14 bg-opacity-40 flex items-center justify-center rounded-t-none"
                        style={{
                            // backdropFilter: "blur(3px)", // Creates blur on the background where cards pass
                            backgroundImage: `url(loginbg/2.jpg)`,
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center"
                        }}></div>
                ))}
                <div className="w-48 rounded-l-xl h-14 bg-opacity-40 flex items-center justify-center rounded-t-none relative"
                    style={{
                        // backdropFilter: "blur(3px)", // Creates blur on the background where cards pass
                        backgroundImage: `url(loginbg/3.jpg)`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center"
                    }}>
                    <div className="absolute w-full h-full bg-gradient-to-r from-transparent from-25% to-white"></div>
                </div>
            </div>

            {/* Adding the rotating cards */}
            <motion.div
                className="absolute w-72 h-44 bg-white-400 rounded-xl z-30 shadow-md bg-white"
                initial={{ x: cards_one_positions[positionIndex].x, y: cards_one_positions[positionIndex].y }}
                animate={{ x: cards_one_positions[positionIndex].x, y: cards_one_positions[positionIndex].y }}
                transition={{ duration: duration, ease: "easeInOut" }}
            >
                <div className="flex flex-col items-start justify-between w-full h-full gap-4 p-5 py-8">
                    <div className="flex flex-row items-center gap-2 flex-wrap w-full">
                        {Array(36).fill(0).map((_, index) => (
                            <ActivityIcon key={index} size={12} strokeWidth={1.5} className="text-gray-700" />
                        ))}
                    </div>
                    <span className="text-lg font-semibold">
                        Routine Self-Test
                    </span>
                </div>
            </motion.div>
            <motion.div
                className="absolute w-72 h-44 bg-purple-400 rounded-xl z-30"
                initial={{ x: cards_two_positions[positionIndex].x, y: cards_two_positions[positionIndex].y }}
                animate={{ x: cards_two_positions[positionIndex].x, y: cards_two_positions[positionIndex].y }}
                transition={{ duration: duration, ease: "easeInOut" }}
            >
                <div className="flex flex-col items-start justify-between w-full h-full gap-1 p-5 py-8">
                    <div className="flex flex-row items-center gap-2 flex-wrap w-full">
                        {Array(11).fill(0).map((_, index) => (
                            <LucideMessageCircleQuestion key={index} size={12} strokeWidth={1.5} className="text-gray-700" />
                        ))}
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-lg font-extrabold break-normal text-wrap">
                            Support, moderation,
                        </span>
                        <span className="text-lg font-extrabold break-normal text-wrap">
                            and diagnostic assistance.
                        </span>
                    </div>
                </div>
            </motion.div>
            <motion.div
                className="absolute w-72 h-44 bg-orange-400 rounded-xl z-30"
                initial={{ x: card_three_positions[positionIndex].x, y: card_three_positions[positionIndex].y }}
                animate={{ x: card_three_positions[positionIndex].x, y: card_three_positions[positionIndex].y }}
                transition={{ duration: duration, ease: "easeInOut" }}
            >
                <div className="flex flex-col items-start justify-between w-full h-full gap-4 p-6">
                    <div className="flex flex-row items-center justify-between gap-2 flex-wrap w-full">
                        {Array(11).fill(0).map((_, index) => (
                            <Plus key={index} size={12} strokeWidth={1.5} className="text-gray-700" />
                        ))}
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xl font-extrabold text-gray-900">
                            Hospital reviews
                        </span>
                        <span className="text-xl font-extrabold text-gray-900">
                            and cost comparison.
                        </span>
                    </div>
                </div>
            </motion.div>
            <motion.div
                className="absolute w-72 h-44 bg-amber-400 rounded-xl z-30 shadow-md"
                initial={{ x: card_four_positions[positionIndex].x, y: card_four_positions[positionIndex].y }}
                animate={{ x: card_four_positions[positionIndex].x, y: card_four_positions[positionIndex].y }}
                transition={{ duration: duration, ease: "easeInOut" }}
            >
                <div className="flex flex-col items-start justify-between w-full h-full gap-4 p-5">
                    <div className="flex flex-row items-center gap-2 flex-wrap w-full">
                        {Array(11).fill(0).map((_, index) => (
                            <BotIcon key={index} size={14} strokeWidth={1} className="text-gray-700" />
                        ))}
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-lg font-extrabold text-gray-900">
                            Smart report
                        </span>
                        <span className="text-lg font-extrabold text-gray-900">
                            handling
                        </span>
                        <span className="text-xl font-extrabold text-gray-900">
                            with AI.
                        </span>
                    </div>
                </div>
            </motion.div>

            <div className="flex flex-row items-center w-full h-fit gap-4 overflow-hidden">
                <div className="w-28 rounded-r-xl h-44 bg-opacity-40 flex items-center justify-center"
                    style={{
                        // backdropFilter: "blur(3px)", // Creates blur on the background where cards pass
                        backgroundImage: `url(loginbg/4.jpg)`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center"
                    }}></div>
                {cards_one.map((_, index) => (
                    <div key={index} className="w-72 rounded-xl h-44 bg-opacity-40 flex items-center justify-center"
                        style={{
                            // backdropFilter: "blur(3px)", // Creates blur on the background where cards pass
                            backgroundImage: `url(loginbg/5.jpg)`,
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center"
                        }}></div>
                ))}
                <div className="w-48 rounded-l-xl h-44 bg-opacity-40 flex items-center justify-center relative"
                    style={{
                        // backdropFilter: "blur(3px)", // Creates blur on the background where cards pass
                        backgroundImage: `url(loginbg/6.jpg)`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center"
                    }}>
                    <div className="absolute w-full h-full bg-gradient-to-r from-transparent from-25% to-white"></div>
                </div>
            </div>
            <div className="flex flex-row items-center w-full h-fit gap-4 overflow-hidden">
                <div className="w-28 rounded-r-xl h-44 bg-opacity-40 flex items-center justify-center"
                    style={{
                        // backdropFilter: "blur(3px)", // Creates blur on the background where cards pass
                        backgroundImage: `url(loginbg/7.jpg)`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center"
                    }}></div>
                {cards_one.map((_, index) => (
                    <div key={index} className="w-72 rounded-xl h-44 bg-opacity-40 flex items-center justify-center"
                        style={{
                            // backdropFilter: "blur(3px)", // Creates blur on the background where cards pass
                            backgroundImage: `url(loginbg/8.jpg)`,
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center"
                        }}></div>
                ))}
                <div className="w-48 rounded-l-xl h-44 bg-opacity-40 flex items-center justify-center relative"
                    style={{
                        // backdropFilter: "blur(3px)", // Creates blur on the background where cards pass
                        backgroundImage: `url(loginbg/9.jpg)`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center"
                    }}>
                    <div className="absolute w-full h-full bg-gradient-to-r from-transparent from-25% to-white"></div>
                </div>
            </div>
            <div className="flex flex-row items-center w-full h-fit gap-4 overflow-hidden">
                <div className="w-28 rounded-r-xl h-44 bg-opacity-40 flex items-center justify-center"
                    style={{
                        // backdropFilter: "blur(3px)", // Creates blur on the background where cards pass
                        backgroundImage: `url(loginbg/10.jpg)`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center"
                    }}></div>
                {cards_one.map((_, index) => (
                    <div key={index} className="w-72 rounded-xl h-44 bg-opacity-40 flex items-center justify-center"
                        style={{
                            // backdropFilter: "blur(3px)", // Creates blur on the background where cards pass
                            backgroundImage: `url(loginbg/11.jpg)`,
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center"
                        }}></div>
                ))}
                <div className="w-48 rounded-l-xl h-44 bg-opacity-40 flex items-center justify-center relative"
                    style={{
                        // backdropFilter: "blur(3px)", // Creates blur on the background where cards pass
                        backgroundImage: `url(loginbg/12.jpg)`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center"
                    }}>
                    <div className="absolute w-full h-full bg-gradient-to-r from-transparent from-25% to-white"></div>
                </div>
            </div>
            <div className="flex flex-row items-center w-full h-fit gap-4 overflow-hidden">
                <div className="w-28 rounded-r-xl h-20 bg-opacity-40 flex items-center justify-center rounded-b-none"
                    style={{
                        // backdropFilter: "blur(3px)", // Creates blur on the background where cards pass
                        backgroundImage: `url(loginbg/1.jpg)`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center"
                    }}>

                </div>
                {cards_one.map((_, index) => (
                    <div key={index} className="w-72 rounded-xl h-20 bg-opacity-40 flex items-center justify-center rounded-b-none"
                        style={{
                            // backdropFilter: "blur(3px)", // Creates blur on the background where cards pass
                            backgroundImage: `url(loginbg/2.jpg)`,
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center"
                        }}>
                    </div>
                ))}
                <div className="w-48 rounded-l-xl h-20 bg-opacity-40 flex items-center justify-center rounded-b-none relative"
                    style={{
                        // backdropFilter: "blur(3px)", // Creates blur on the background where cards pass
                        backgroundImage: `url(loginbg/3.jpg)`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center"
                    }}>
                    <div className="absolute w-full h-full bg-gradient-to-r from-transparent from-25% to-white"></div>
                </div>
            </div>
        </div>
    )
}

function InputComponent() {
    const router = useRouter()
    const { register, handleSubmit, formState: { errors }, getValues } = useForm()
    const [currentSection, setCurrentSection] = useState("Login")
    const [showPassword, setShowPassword] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)
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
        setSubmitLoading(true)
        if (currentSection === "Login") {
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
                // document.getElementById("submit-button-loading-state").hidden = true
            }).finally(() => {
                setSubmitLoading(false)
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
                        // document.getElementById("submit-button-loading-state").hidden = true
                    }
                }).catch((err) => {
                    console.log(err)
                    toast.error("An error occured. Registration failed", {
                        description: "A user with this email already exists. Please login or use another email"
                    })
                    document.getElementById("submit-button-text").hidden = false
                    // document.getElementById("submit-button-loading-state").hidden = true
                }).finally(() => {
                    setSubmitLoading(false)
                })
            }
        }
    }

    return (
        <div className="flex w-fit flex-col items-center justify-center flex-wrap flex-shrink shadow-xl rounded-xl">

            <div className="flex flex-row justify-center items-center">
                <button disabled={currentSection === "Login"} onClick={() => { setCurrentSection("Login") }} id="loginsection" className="text-2xl font-bold text-center m-2">Login</button>
                <Separator className=" w-[2px] bg-purple-400" orientation="vertical" />
                <button disabled={currentSection === "Register"} onClick={() => { setCurrentSection("Register") }} id="registersection" className="text-2xl font-bold text-center m-2">Register</button>
            </div>
            <Separator className="bg-purple-400 m-2 w-80" />
            <form className="flex w-96 p-5 rounded-2xl flex-col items-center justify-between flex-wrap flex-shrink m-2 gap-3 " onSubmit={(e) => {
                e.preventDefault()
                handleSubmit(submitForm)()
            }}>
                <div className="flex flex-col gap-px w-fit items-center">
                    <input id="email-input" type="text" placeholder="Email" className="border border-gray-300 w-64 rounded-md p-2 focus:outline-gray-500"
                        {...register("email", {
                            required: "Email is required", maxLength: { value: 64, message: "Maximum length allowed is 64" }
                        })} />
                    {errors.email && <span className="text-red-500">{errors.email?.message}</span>}
                </div>
                {currentSection === "Register" && (
                    <div className="flex flex-col gap-px w-fit items-center">
                        <select className="w-64 h-9 rounded p-2 border border-gray-400" {...register("role", { validate: value => value !== "default" })}>
                            <option className="w-full m-3" value={"default"}>Select Role</option>
                            <option className="w-full m-3" value={roles.basicUser}>Basic User</option>
                            <option className="w-full m-3" value={roles.patient}>Patient</option>
                            <option className="w-full m-3" value={roles.doctor}>Health Care Provider</option>
                        </select>
                        {errors.role && <span className="text-red-500">Role is required</span>}
                    </div>
                )
                }
                <div className="text-base flex items-end relative">
                    <div className="flex flex-col gap-px w-fit items-center">
                        <input id="password" type={showPassword ? "text" : "password"} placeholder="Password" className="border border-gray-300 rounded-md py-2 pl-2 pr-8 w-64 focus:outline-gray-500" {...register("password", { required: "Password is required", maxLength: { value: 64, message: "Maximum length 64 characters" } })} />
                        {errors.password?.type === "required" && <span className="text-red-500">{errors.password?.message}</span>}
                    </div>
                    <button type='button' className=" size-fit bg-gray-50 bg-opacity-40 absolute right-1 top-3" onClick={() => {
                        setShowPassword(prev => !prev)
                    }}>
                        {showPassword ? <EyeOff size={22} strokeWidth={1.5} className="text-gray-700 ml-2 cursor-pointer " /> : <EyeIcon strokeWidth={1.5} size={22} className="text-gray-700 ml-2 cursor-pointer" />}
                    </button>
                    {currentSection === "Register" &&
                        <HoverCard closeDelay={50}>
                            <HoverCardTrigger asChild>
                                <CircleHelp size={16} className="text-gray-700 ml-2 cursor-default absolute -right-8 bottom-2 " />
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
                {currentSection === "Register" && (
                    <div className="flex flex-col gap-px w-fit items-center">
                        <input id="confirm_password" type="password" placeholder="Confirm password" className="border border-gray-300 rounded-md p-2 w-64 focus:outline-gray-500" {...register("confirm_password", { required: true, maxLength: 64 })} />
                        <span id="password_mismatch_label" hidden className="text-red-500">Passwords should match</span>
                    </div>
                )

                }

                <button id="submit-button-text" type="submit" className="bg-pink-500 text-white p-2 m-4 w-32 rounded-2xl hover:scale-95 flex items-center justify-center">
                    <span >
                        {submitLoading ? <Loader size={28} strokeWidth={2.5} className="text-white animate-spin" /> : currentSection}
                    </span>
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
    )

}