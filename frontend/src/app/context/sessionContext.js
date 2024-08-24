'use client'
import { pagePaths, sessionDataItem, sessionExpirationTime } from "@/utils/constants"
import { useRouter } from "next/navigation"
import { createContext, useRef, useContext, useState, useEffect } from "react"
import { toast } from "sonner"

const sessionContext = createContext()

export function SessionContextProvider({ children }) {
    const [sessionData, setSessionData] = useState(null)

    useEffect(() => {
        const sessionData = JSON.parse(localStorage.getItem(sessionDataItem))
        if (!sessionData) {
            setSessionData({
                userId: null,
                role: null,
                username: null,
                time: new Date(),
            })
        }//check if session is expired which is 24 hours
        else if (new Date() - new Date(sessionData.time) > sessionExpirationTime) {
            setSessionData({
                userId: null,
                role: null,
                username: null,
                time: new Date(),
            })
            localStorage.removeItem(sessionDataItem)
            toast.error("Session Expired")
        }
        else {
            setSessionData({
                ...sessionData,
            })
        }
    }, [])

    return (
        <sessionContext.Provider value={{
            sessionData,
        }}>
            {children}
        </sessionContext.Provider>
    )
}

export function useSessionContext() {
    return useContext(sessionContext)
}