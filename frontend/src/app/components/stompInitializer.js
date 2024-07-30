'use client'
import { useStompContext } from "@/app/context/stompContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Client } from '@stomp/stompjs';
import { usePathname } from "next/navigation";
import { getChatsUrl, sessionDataItem, stompBrokerUrl, subscribeErrorUrl, subscribeMessageUrl } from "@/utils/constants";
import { useParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance"
import { useSessionContext } from "@/app/context/sessionContext";

export function SocketInitializer() {
    const stompContext = useStompContext();
    const strompInitializedRef = useRef(false)
    const pathname = usePathname()
    const router = useRouter()
    const [messageQueue, setMessageQueue] = useState([])
    const sessionContext = useSessionContext()

    useEffect(() => {
        const sessionData = JSON.parse(localStorage.getItem(sessionDataItem))
        stompContext.setUserId(sessionData.userId)
        if (!sessionData.token || !sessionData.userId) {
            console.error('Token not found')
            toast.error('Token not found', {
                description: 'You need to login to continue'
            })
            router.push('/login')
        }
        const headers = { 'Authorization': `Bearer ${sessionData.token}` }
        if (!strompInitializedRef.current) {
            stompContext.stompClientRef.current = new Client({
                brokerURL: stompBrokerUrl,
                connectHeaders: headers,
                debug: function (str) {
                    console.log(str)
                },
                reconnectDelay: 0,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000
            })
            stompContext.stompClientRef.current.onConnect = (frame) => {
                stompContext.stompClientRef.current.subscribe(subscribeMessageUrl(sessionData.userId), (response) => {
                    console.log(response)
                    const message = JSON.parse(response.body)
                    console.log('Received message')
                    console.log(message)
                    setMessageQueue([...messageQueue, message])

                })
                stompContext.stompClientRef.current.subscribe(subscribeErrorUrl(sessionData.userId), (error) => {
                    console.log(error)
                    console.log(JSON.parse(error.body))
                })
            }
            stompContext.stompClientRef.current.onStompError = (frame) => {
                console.log('Broker reported error: ' + frame.headers['message'])
                console.log('Additional details: ' + frame.body)
            }

            stompContext.stompClientRef.current.activate()
            strompInitializedRef.current = true
        }

        return () => {
            stompContext.stompClientRef.current.deactivate()
            strompInitializedRef.current = false
            console.log('Disconnected')
        }
    }, [stompContext.stompClientRef, router])

    useEffect(() => {
        stompContext.setMessages([])
    }, [pathname])

    useEffect(() => {
        if (messageQueue.length > 0 && sessionContext.sessionData) {
            for (const message of messageQueue) {
                if (!pathname.startsWith('/inbox')) {
                    if (message.type === 'TEXT') {
                        toast.message("New message from: " + message.sender, {
                            description: message.message
                        })
                    }
                }
                else if (pathname.startsWith('/inbox')) {
                    if (stompContext.openedChat?.userId === message.sender) {
                        console.log("in stompInitializer/subscriber/ifroute")
                        stompContext.setMessages([...stompContext.messages, message])
                        stompContext.chatManager.current.moveToHead(message.sender)
                        stompContext.setChats([...stompContext.chatManager.current.getChatsInOrder()])
                    }
                    else if (stompContext.chatManager.current.exists(message.sender)) {
                        console.log("in stompInitializer/subscriber/elseifroute")
                        stompContext.chatManager.current.moveToHead(message.sender)
                        stompContext.setChats([...stompContext.chatManager.current.getChatsInOrder()])
                    }
                    else {
                        stompContext.chatManager.current.removeAllChats()
                        axiosInstance.get(getChatsUrl(sessionContext.sessionData.userId)).then((response) => {
                            console.log("in stompInitializer/subscriber/elseroute")
                            console.log(response)
                            stompContext.chatManager.current.addChats(response.data)
                            stompContext.chatManager.current.moveToHead(message.sender)
                            stompContext.setChats([...stompContext.chatManager.current.getChatsInOrder()])

                        }).catch((error) => {
                            console.error(error)
                        })
                    }
                }
            }
            setMessageQueue([])
        }
    }, [messageQueue, sessionContext.sessionData])

    const seeContext = () => {
        console.log(stompContext.messages)
        console.log("chats from context")
        console.log(stompContext.chats)
        console.log("Chat manager from context")
        console.log(stompContext.chatManager.current)
        console.log("Chat manager list from context")
        console.log(stompContext.chatManager.current.getChatsInOrder())
        console.log("Opened chat from context")
        console.log(stompContext.openedChat)
        console.log("User id from context")
        console.log(stompContext.userId)
    }

    return (
        <>
            {/* <button onClick={seeContext} className="border-2 p-3">See contexts values</button> */}
        </>
    )
}