'use client'

import axiosInstance from "@/utils/axiosInstance"
import { getRole, pagePaths, roles } from "@/utils/constants"
import { useParams } from "next/navigation"
import { useEffect } from "react"

export default function RedirectProfile() {
    const params = useParams()
    useEffect(() => {
        axiosInstance.get(getRole(params.profileid)).then((res) => {
            if (res.data.roles[0] === roles.doctor) {
                window.location.href = pagePaths.doctorProfile(params.profileid)
            }
            else if (res.data.roles[0] === roles.patient) {
                window.location.href = pagePaths.userProfile(params.profileid)
            }
        })
    }, [])
    return null
}