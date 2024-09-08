'use client'
import axiosInstance from "@/utils/axiosInstance"
import { pagePaths, refreshTokenExpirationTime, refreshTokenUrlReq, sessionDataItem, sessionExpirationTime } from "@/utils/constants"
import { useRouter } from "next/navigation"
import { createContext, useRef, useContext, useState, useEffect } from "react"
import { toast } from "sonner"

const sessionContext = createContext()

export function SessionContextProvider({ children }) {
    const [sessionData, setSessionData] = useState(null)

    useEffect(() => {
        const sessionData = JSON.parse(localStorage.getItem(sessionDataItem))
        console.log(sessionData)
        if (!sessionData) {
            setSessionData({
                userId: null,
                role: null,
                username: null,
                isVerified: null,
                subscribed: null,
                isRegisterComplete: null,
                time: null
            })
        }//check if session is expired which is 24 hours
        else if (Math.abs(new Date() - new Date(sessionData.time)) > sessionExpirationTime) {
            if (Math.abs(new Date() - new Date(sessionData.refreshTime)) < refreshTokenExpirationTime) {
                axiosInstance.get(refreshTokenUrlReq).then((res) => {
                    setSessionData({
                        ...sessionData,
                    })
                }).catch((err) => {
                    setSessionData({
                        userId: null,
                        role: null,
                        username: null,
                        isVerified: null,
                        subscribed: null,
                        isRegisterComplete: null,
                        time: null
                    })
                    localStorage.removeItem(sessionDataItem)
                    toast.error("Session Expired")
                })
            }
            else {
                setSessionData({
                    userId: null,
                    role: null,
                    username: null,
                    isVerified: null,
                    subscribed: null,
                    isRegisterComplete: null,
                    time: null
                })
                localStorage.removeItem(sessionDataItem)
                toast.error("Session Expired")
            }
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
            setSessionData,
        }}>
            {children}
        </sessionContext.Provider>
    )
}

export function useSessionContext() {
    return useContext(sessionContext)
}