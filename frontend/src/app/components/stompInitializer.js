'use client'
import { useStompContext } from "@/app/context/stompContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Client } from '@stomp/stompjs';
import { usePathname } from "next/navigation";
import { getChatsUrl, stompBrokerUrl, subscribeErrorUrl, subscribeMessageUrl } from "@/utils/constants";
import { useParams } from "next/navigation";
import axios from "axios";

export function SocketInitializer() {
    const stompContext = useStompContext();
    const params = useParams()
    const strompInitializedRef = useRef(false)
    const pathname = usePathname()
    const router = useRouter()
    useEffect(() => {
        console.log('path', pathname)
        console.log('params', params)
        const token = localStorage.getItem('token')
        const id = localStorage.getItem('userId')
        if (!token || !id) {
            console.error('Token not found')
            toast.error('Token not found', {
                description: 'You need to login to continue'
            })
            router.push('/login')
        }
        const headers = { 'Authorization': `Bearer ${token}` }
        if (!strompInitializedRef.current) {
            stompContext.stompClientRef.current = new Client({
                brokerURL: stompBrokerUrl,
                connectHeaders: headers,
                debug: function (str) {
                    console.log(str)
                },
                reconnectDelay: 500,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000
            })
            stompContext.stompClientRef.current.onConnect = (frame) => {
                stompContext.stompClientRef.current.subscribe(subscribeMessageUrl(id), (response) => {
                    console.log(response)
                    const message = JSON.parse(response.body)
                    const senderId = message.message.split('?FROM=')[1];
                    if (!pathname.startsWith('/inbox')) {
                        if (message.type === 'TEXT') {
                            toast.message("New message from" + senderId)
                        }
                    }
                    else if (pathname.startsWith('/inbox')) {
                        console.log("in stompInitializer pathname matched")
                        const openedChat = JSON.parse(params.chatId)
                        if (openedChat.userId === senderId){
                            console.log("in stompInitializer/subscriber/ifroute")
                            stompContext.setMessages([...stompContext.messages, message])
                            stompContext.chatManager.current.moveToHead(senderId)
                            stompContext.setChats([...stompContext.chatManager.current.getChatsInOrder()])
                        }
                        else if(stompContext.chatManager.current.exists(senderId)){
                            console.log("in stompInitializer/subscriber/elseifroute")
                            stompContext.chatManager.current.moveToHead(senderId)
                            stompContext.setChats([...stompContext.chatManager.current.getChatsInOrder()])
                        }
                        else{
                            stompContext.chatManager.current.removeAllChats()
                            axios.get(getChatsUrl(id), {
                                headers: headers
                            }).then((response) => {
                                console.log("in stompInitializer/subscriber/elseroute")
                                console.log(response)
                                stompContext.chatManager.current.addChats(response.data)
                                stompContext.chatManager.current.moveToHead(senderId)
                                stompContext.setChats([...stompContext.chatManager.current.getChatsInOrder()])

                            }).catch((error) => {
                                console.error(error)
                            })
                        }
                    }
                })
                stompContext.stompClientRef.current.subscribe(subscribeErrorUrl(id), (error) => {
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
        console.log(pathname)
    }, [pathname])
    return (
        <>
        </>
    )
}