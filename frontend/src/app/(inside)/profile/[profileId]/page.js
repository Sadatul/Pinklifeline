'use client'
import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner";
import { useStompContext } from "@/app/context/stompContext";
import { messageSendUrl } from "@/utils/constants";

export default function Profile() {
    const params = useParams()
    const stompContext = useStompContext();
    const [userId, setUserId] = useState('')
    useEffect(() => {
        setUserId(localStorage.getItem('userId'))
    }, [])

    const sendMessage = () => {
        const messageInput = document.getElementById('message')?.value
        if (messageInput !== '' && params.profileId) {
            const messageObject = {
                receiverId: params.profileId,
                message: messageInput,
                timestamp: new Date().toISOString(),
                type: "TEXT"
            }
            console.log('Sending message')
            console.log(messageObject)
            stompContext.stompClientRef.current.publish(
                {
                    destination: messageSendUrl,
                    body: JSON.stringify(messageObject),
                }
            );
        }
    }
    return (
        <div>
            <h1>Profile:{params.profileId}</h1>
            <h1>Current user id:{userId}</h1>
            <h1>Send message to user:{params.profileId}</h1>
            <input id="message" type="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" placeholder="Enter message" className="border-2 p-3" />
            <button onClick={sendMessage} className="border-2 p-3">Click</button>
        </div>
    )
}