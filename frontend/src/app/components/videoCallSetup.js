'use client'

import { useEffect } from "react"
import { useVideoCallContext } from "../context/videoCallContext"
import axios from "axios"
import { StreamVideoClient } from "@stream-io/video-react-sdk"

export default function VideoCallSetup() {
    const videoCallContext = useVideoCallContext()

    useEffect(() => {
        if (videoCallContext.client) {
            return
        }
        const apiKey = "mmhfdzb5evj2"
        const userId = localStorage.getItem('userId')
        const callId = "randomCallId"
        const user = {
            id: "Jarael",
            name: "Adil",
            image: "https://sm.ign.com/t/ign_nordic/cover/a/avatar-gen/avatar-generations_prsz.300.jpg"
        }
        videoCallContext.setUser(user)
        const tokenProvider = async () => {
            const { token } = await axios.get(
                "https://pronto.getstream.io/api/auth/create-token?" +
                new URLSearchParams({
                    api_key: apiKey,
                    user_id: userId,
                }))
            console.log("token from website ", token)
            return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiSmFyYWVsIiwiaXNzIjoiaHR0cHM6Ly9wcm9udG8uZ2V0c3RyZWFtLmlvIiwic3ViIjoidXNlci9KYXJhZWwiLCJpYXQiOjE3MjA4ODk1NzAsImV4cCI6MTcyMTQ5NDM3NX0._SOr3ga6rHCLWS7bqcVXV2xio174gQuT0bDMLNWKR08"
        }
        const client = new StreamVideoClient({
            apiKey,
            user: user,
            tokenProvider,
            options: { logLevel: 'error' }
        })
        console.log("Creating client")
        videoCallContext.setClient(client)
    }, [])

    return (
        <></>
    )
}