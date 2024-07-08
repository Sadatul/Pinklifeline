'use client'
import { createContext, useRef, useContext, useState, useEffect } from 'react'
import { Client } from '@stomp/stompjs';
import { stompBrokerUrl, headers, subscribeMessageUrl, subscribeErrorUrl } from '@/utils/constants';

const stompContext = createContext()

export function StompContextProvider({ children }) {
    const [messages, setMessages] = useState([])
    const [chats , setChats] = useState([])
    const stompClientRef = useRef(null)

    return (
        <stompContext.Provider value={{
            messages,
            setMessages,
            chats,
            setChats,
            stompClientRef
        }}>
            {children}
        </stompContext.Provider>
    )
}

export function useStompContext() {
    return useContext(stompContext)
}
