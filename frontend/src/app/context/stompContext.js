'use client'
import { createContext, useRef, useContext, useState, useEffect } from 'react'
import { Client } from '@stomp/stompjs';
import { stompBrokerUrl, headers, subscribeMessageUrl, subscribeErrorUrl } from '@/utils/constants';

const stompContext = createContext()

export function StompContextProvider({ children }) {
    const [stompClient, setStompClient] = useState()
    const [messages, setMessages] = useState([])
    const stompClientRef = useRef(null)

    return (
        <stompContext.Provider value={{
            stompClient,
            setStompClient,
            messages,
            setMessages,
            stompClientRef
        }}>
            {children}
        </stompContext.Provider>
    )
}

export function useStompContext() {
    return useContext(stompContext)
}
