'use client'

import ScrollableContainer from "@/app/components/StyledScrollbar"
import { useSessionContext } from "@/app/context/sessionContext"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { DashBoardPageLinks, DashboardPagesInfos, pagePaths, radicalGradient, roles, sessionDataItem, userInfoRegUrlReq } from "@/utils/constants"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { BotMessageSquare, EllipsisIcon, Send, SendHorizonal, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
// import { AnimatePresence, motion } from "framer-motion"

export default function Layout({ children }) {
    const [sessionData, setSessionData] = useState(null)
    const pathname = usePathname()
    useEffect(() => {
        if (!localStorage.getItem(sessionDataItem)) {
            window.location.href = pagePaths.login
        }
        setSessionData(JSON.parse(localStorage.getItem(sessionDataItem)))
    }, [])
    if (!sessionData) return null
    return (
        <div className="flex flex-1 overflow-hidden text-black break-all bg-gray-100">
            {/* Sidebar */}
            <SideBar />
            {/* Main Content */}

            <ScrollableContainer className="flex flex-col flex-1 overflow-y-auto ml-[2px] rounded-l-lg overflow-x-hidden bg-white">
                {children}
            </ScrollableContainer>
        </div>
    )
}

function SideBar() {
    const pathname = usePathname()
    const sessionContext = useSessionContext()
    const [openChatBot, setOpenChatBot] = useState(false)

    return (
        <div className={cn("w-64 h-full items-center flex flex-col p-4 mr-[2px] bg-gray-100")}>
            <div className="flex flex-col gap-2 flex-1 justify-center mb-10 drop-shadow-xl px-1">
                {DashBoardPageLinks[sessionContext?.sessionData.role].map((page, index) => (
                    <Link key={index} href={page.link} className={cn("flex items-center w-full drop-shadow-md py-1 px-4 rounded-xl", pathname === page.link ? "bg-purple-900 bg-opacity-70 text-gray-50 text-xl pointer-events-none shadow-xl" : "text-opacity-75 text-gray-600 text-lg hover:bg-white hover:text-gray-800 hover:translate-x-4 transition-all ease-linear ")} onClick={() => {
                        if (sessionContext?.sessionData?.subscribed === 0) {
                            toast.message("Please subscribe to access this feature", {
                                duration: 5000,
                            })
                            return
                        }
                    }} >
                        <span className="flex flex-row items-center gap-3">
                            {/* {React.createElement(page.icon, { size: 24, className: "" })} */}
                            {page.icon}
                            {page.name}
                        </span>
                    </Link>
                ))}
            </div>
            {(sessionContext?.sessionData.role !== roles.doctor && sessionContext?.sessionData.subscribed !== 0 && !openChatBot) && (
                <button className="flex flex-row items-center justify-center w-14 h-14 rounded-full bg-pink-500 text-white drop-shadow-xl fixed right-5 bottom-5 hover:scale-95" onClick={() => {
                    setOpenChatBot(true)
                }}>
                    <BotMessageSquare size={32} />
                </button>
            )}
            <ChatBox openChatBot={openChatBot} setOpenChatBot={setOpenChatBot} />
        </div>
    )
}

function ChatBox({ openChatBot, setOpenChatBot }) {
    const sessionContext = useSessionContext()
    const getAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
    const [model, setModel] = useState(getAI.getGenerativeModel({ model: "gemini-1.5-flash" }))
    const [chat, setChat] = useState(null)
    const [messages, setMessages] = useState([{
        role: "model",
        parts: [{
            text: "Hi I'm PinkBot! How can I help you today?"
        }]
    }])
    const [responseLoading, setResponseLoading] = useState(false)
    const scrollAreaRef = useRef(null)

    useEffect(() => {
        const setUpChat = async () => {
            if (sessionContext?.sessionData.role !== roles.doctor) {
                const userInfoAll = (await axiosInstance.get(userInfoRegUrlReq(sessionContext?.sessionData?.userId, sessionContext?.sessionData?.role))).data
                const userInfoRefined = Object.keys(userInfoAll).reduce((obj, key) => {
                    if (key !== "location" && key !== "locationShare") {
                        obj[key] = userInfoAll[key];
                    }
                    return obj;
                }, {});
                const userInfoForBot = JSON.stringify(userInfoRefined)
                const history = [
                    {
                        "role": "user",
                        "parts": [
                            {
                                "text": `You are interacting with a user from Pinklifeline, a platform designed to support breast cancer patients or general user. Depending on the type of user, this conversation may involve medical discussions or general inquiries. This is the information we have about the user: ${userInfoForBot}. This information was JSON stringified. Try to keep the conversation simple, short, and concise. Feel free to call patient by their name.`
                            }
                        ]
                    }
                ]
                setChat(model.startChat({ history: history }))
            }
        }
        setUpChat()
    }, [])

    useEffect(() => {
        if (messages.length > 0 && messages[messages.length - 1].role === "user") {
            setResponseLoading(true)
            chat.sendMessage(messages[messages.length - 1].parts[0].text).then((response) => {
                console.log("Response: ", response)
                setMessages(prev => [...prev,
                {
                    role: "model",
                    parts: [
                        {
                            text: response.response.candidates[0].content.parts.find(part => part.hasOwnProperty('text')).text
                        }
                    ]
                }])
                setResponseLoading(false)
            }).catch((e) => {
                console.error(e)
                setResponseLoading(false)
            })
        }
    }, [messages])

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
    }, [messages, openChatBot])

    return (
        <AnimatePresence>
            {openChatBot && (
                <motion.div className="w-96 h-[500px] fixed rounded-md bg-white border border-gray-600 right-5 bottom-5 z-50 flex flex-col justify-between"
                    initial={{ opacity: 0, y: '100%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '100%' }}
                    transition={{ duration: 0.3 }}>
                    <div className="w-full flex flex-row justify-between bg-pink-500 text-white px-5 py-1">
                        <div className="flex flex-row items-center gap-2">
                            <BotMessageSquare size={32} />
                            <span>PinkBot</span>
                        </div>
                        <button onClick={() => {
                            setOpenChatBot(false)
                        }}>
                            <X size={32} />
                        </button>
                    </div>
                    <ScrollableContainer ref={scrollAreaRef} className="flex flex-col flex-1 w-full overflow-x-hidden">
                        {messages.map((message, index) => {
                            return (
                                <div key={index} className="flex flex-col w-full">
                                    {message.role === "user" ? (
                                        <div className="flex flex-col w-full items-end">
                                            {message.parts.map((part, index) => (
                                                <div key={index} className="flex flex-col w-fit px-2 py-1 text-sm text-gray-800 bg-gray-200 max-w-80 break-normal text-wrap m-2 rounded-lg">
                                                    {part.text}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-start">
                                            {message.parts.map((part, index) => (
                                                <div key={index} className="flex flex-col w-fit px-2 py-1 text-sm text-gray-800 bg-gray-200 max-w-80 break-normal text-wrap m-2 rounded-lg">
                                                    {part.text}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        {responseLoading &&
                            <div className="flex flex-col w-full items-start">
                                <div className="flex flex-col w-fit px-2 py-1 text-sm bg-gray-200 m-2 rounded-lg">
                                    <EllipsisIcon size={28} className="text-gray-800" />
                                </div>
                            </div>
                        }
                    </ScrollableContainer>
                    <div className="w-full max-h-[100px] flex flex-row justify-between bg-purple-200 bg-opacity-90 text-white p-1 relative">
                        <textarea disabled={chat === null} type="text" className="flex-1 bg-transparent outline-none max-h-[90px] text-gray-800 bg-white shadow-inner rounded-md p-1 text-sm pr-9" id="chatbot-input" onChange={(e) => {
                            if (e.target.scrollHeight < 90) {
                                document.getElementById("chatbot-input").style.height = "auto";
                                document.getElementById("chatbot-input").style.height = (e.target.scrollHeight + 2) + "px";
                            }
                        }} />
                        <button className="absolute right-3 bottom-3" onClick={() => {
                            if (document.getElementById("chatbot-input")?.value?.trim() === "") return
                            const text = document.getElementById("chatbot-input").value
                            setResponseLoading(true)
                            setMessages(prev => [...prev, {
                                role: "user",
                                parts: [
                                    {
                                        text: text
                                    }
                                ]
                            }])
                            document.getElementById("chatbot-input").value = ""
                        }}>
                            <SendHorizonal size={24} className="text-black -rotate-90" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}


