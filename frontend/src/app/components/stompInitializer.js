'use client'
import { useStompContext } from "@/app/context/stompContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Client } from '@stomp/stompjs';
import { usePathname } from "next/navigation";
import { stompBrokerUrl, subscribeErrorUrl, subscribeMessageUrl } from "@/utils/constants";
import { useParams } from "next/navigation";

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
                    if (!pathname.startsWith('/inbox')) {
                        const senderId = message.message.split('?FROM=')[1];
                        if (message.type === 'TEXT') {
                            toast.message("New message from" + senderId)
                        }
                    }
                    else if (pathname.startsWith('/inbox')){
                        stompContext.setMessages([...stompContext.messages, message])
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