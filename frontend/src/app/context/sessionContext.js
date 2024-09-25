'use client'
import axiosInstance from "@/utils/axiosInstance"
import { pagePaths, refreshTokenExpirationTime, refreshTokenUrlReq, sessionDataItem, sessionExpirationTime } from "@/utils/constants"
import { useRouter } from "next/navigation"
import { createContext, useRef, useContext, useState, useEffect, useDebugValue } from "react"
import { toast } from "sonner"

const sessionContext = createContext()

export function SessionContextProvider({ children }) {
    const [sessionData, setSessionData] = useState(null)
    const [profilePic, setProfilePic] = useState(null)

    useEffect(() => {
        const sessionData = JSON.parse(localStorage.getItem(sessionDataItem))
        console.log("session data from local storage", localStorage.getItem(sessionDataItem))
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
                        time: new Date(),
                    })
                    localStorage.setItem(sessionDataItem, JSON.stringify({
                        ...sessionData,
                        time: new Date()
                    }))
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
                userId: Number(sessionData.userId),
                subscribed: Number(sessionData.subscribed),
            })
        }
    }, [])

    return (
        <sessionContext.Provider value={{
            sessionData,
            setSessionData,
            profilePic,
            setProfilePic
        }}>
            {children}
        </sessionContext.Provider>
    )
}

export function useSessionContext() {
    return useContext(sessionContext)
}