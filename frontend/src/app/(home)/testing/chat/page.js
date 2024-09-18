'use client'

import { GoogleGenerativeAI } from "@google/generative-ai";
import { useEffect, useRef, useState } from "react";

const getAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)

export default function ChatPage() {
    const [messages, setMessages] = useState([{
        role: "model",
        message: "Welcome to the chat!"
    }]);
    const inputRef = useRef(null)
    const chatRef = useRef(null)

    useEffect(() => {
        try {
            const model = getAI.getGenerativeModel({ model: "gemini-1.5-flash" })
            chatRef.current = model.startChat({
                history: [],
            })
            chatRef.current.getHistory().then((history) => {
                console.log("History: ", history)
            })
        } catch (e) {
            console.error(e)
        }
    }, [])
    const sendMessage = async (message) => {
        try {
            console.log("Sending message: ", message)
            const response = await chatRef.current.sendMessage(message)
            console.log("Response: ", response)
            setMessages(prev => [...prev,
            {
                role: "user",
                message: message
            }, {
                role: "model",
                message: response.response.candidates[0].content.parts.find(part => part.hasOwnProperty('text')).text
            }])
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="flex flex-col justify-center items-center flex-grow">
            <div className="flex flex-col flex-grow">
                {messages.map((message, index) => {
                    return (
                        <div key={index} className="flex flex-col">
                            {message.role === "system" ? (
                                <div className="flex flex-col">
                                    {message.message}
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {message.message}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
            <div className="flex flex-row gap-3">
                <input ref={inputRef} type="text" className="border rounded p-2 border-gray-500" placeholder="Type a message..." />
                <button onClick={() => {
                    sendMessage(inputRef.current.value)
                    inputRef.current.value = ""
                }}>Send</button>
                <button onClick={() => {
                    chatRef.current.getHistory().then((history) => {
                        console.log("History: ", history)
                    })
                }}>See History</button>
            </div>
        </div>
    )
}