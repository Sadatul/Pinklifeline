'use client'

import Loading from "@/app/components/loading"
import axiosInstance from "@/utils/axiosInstance"
import { pagePaths, selfTestReminderUrl } from "@/utils/constants"
import { useSearchParams } from "next/navigation"
import { Suspense, useDebugValue, useEffect } from "react"


function ReactReminder() {
    const searchParams = useSearchParams()
    const reminderAnswer = searchParams.get('reminderAnswer')
    useEffect(() => {
        if (reminderAnswer.toLowerCase() === 'yes') {
            alert('Reminder set')
        } else if (reminderAnswer.toLowerCase() === 'no') {
            axiosInstance.put(selfTestReminderUrl, {
                days : -1,
            }).then((response) => {
                window.location.href = pagePaths.dashboardPages.userdetailsPage
            }).catch((error) => {
                console.log(error)
            })
        }
    }, [])
}

export default function ReactReminderPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ReactReminder />
        </Suspense>
    )
}