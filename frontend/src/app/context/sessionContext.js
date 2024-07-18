'use client'
import { pagePaths, sessionDataItem } from "@/utils/constants"
import { useRouter } from "next/navigation"
import { createContext, useRef, useContext, useState, useEffect } from "react"
import { toast } from "sonner"

const sessionContext = createContext()

export function SessionContextProvider({ children }) {
    const [sessionData, setSessionData] = useState(null)
    const router = useRouter()

    useEffect(() => {
        const sessionData = JSON.parse(localStorage.getItem(sessionDataItem))
        console.log("sessionData in context", sessionData)
        if (!sessionData) {
            toast.error("Session data not found", {
                description: "You need to login to continue",
            })
            router.push(pagePaths.login)
        }
        setSessionData(sessionData)
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