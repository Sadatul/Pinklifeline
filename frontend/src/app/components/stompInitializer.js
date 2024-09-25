'use client'
import { useStompContext } from "@/app/context/stompContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Client } from '@stomp/stompjs';
import { usePathname } from "next/navigation";
import { appointmentStartMsg, appointmentStartMsgPattern, extractLink, getChatsUrl, pagePaths, sessionDataItem, stompBrokerUrl, subscribeErrorUrl, subscribeMessageUrl } from "@/utils/constants";
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
        if (sessionContext?.sessionData?.userId) {
            stompContext.setUserId(sessionContext?.sessionData?.userId)
            if (!sessionContext?.sessionData?.userId) {
                return
            }
            if (!strompInitializedRef.current) {
                stompContext.stompClientRef.current = new Client({
                    brokerURL: stompBrokerUrl,
                    debug: function (str) {
                        console.log(str)
                    },
                    reconnectDelay: 5000,
                    heartbeatIncoming: 10000,
                    heartbeatOutgoing: 10000
                })
                stompContext.stompClientRef.current.onConnect = (frame) => {
                    stompContext.stompClientRef.current.subscribe(subscribeMessageUrl(sessionContext?.sessionData?.userId), (response) => {
                        console.log(response)
                        const message = JSON.parse(response.body)
                        console.log('Received message')
                        console.log(message)
                        const text = message?.message
                        if (appointmentStartMsgPattern.test(text)) {
                            toast.message("You have an online appointment", {
                                duration: Infinity,
                                closeButton: true,
                                position: "bottom-right",
                                action: {
                                    label: "Join",
                                    onClick: () => {
                                        window.open(extractLink(text), "_blank")
                                        window.location.href = pagePaths.dashboardPages.patientLivePrescription
                                    }
                                },
                            })
                        }
                        setMessageQueue(messages => [...messages, message])

                    })
                    stompContext.stompClientRef.current.subscribe(subscribeErrorUrl(sessionContext?.sessionData?.userId), (error) => {
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
        }

        return () => {
            // stompContext.stompClientRef.current?.deactivate()
            // strompInitializedRef.current = false
            // console.log('Disconnected')
        }
    }, [stompContext.stompClientRef, router, sessionContext?.sessionData])

    useEffect(() => {
        stompContext.setMessages([])
    }, [pathname])

    useEffect(() => {
        if (messageQueue.length > 0 && sessionContext?.sessionData) {
            for (const message of messageQueue) {
                if (pathname.startsWith('/inbox')) {
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
                        axiosInstance.get(getChatsUrl(sessionContext?.sessionData.userId)).then((response) => {
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
    }, [messageQueue, sessionContext?.sessionData])


    return (
        <>
        </>
    )
}