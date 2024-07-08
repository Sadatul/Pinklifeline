'use client'
import { useStompContext } from "@/app/context/stompContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Client } from '@stomp/stompjs';
import { stompBrokerUrl, subscribeErrorUrl, subscribeMessageUrl } from "@/utils/constants";

export function SocketInitializer() {
    const stompContext = useStompContext();
    useEffect(() => {
        const token = localStorage.getItem('token')
        const id = localStorage.getItem('userId')
        if (!token || !id) {
            console.error('Token not found')
            toast.error('Token not found', {
                description: 'You need to login to continue'
            })
            useRouter().push('/login')
        }
        const headers = { 'Authorization': `Bearer ${token}` }
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
                console.log(JSON.parse(response.body))
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

        return ()=>{
            stompContext.stompClientRef.current.deactivate()
            console.log('Disconnected')
        }
    }, [])
    return (
        <>
        </>
    )
}