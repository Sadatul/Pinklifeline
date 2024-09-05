'use client'

import { Switch } from "@/components/ui/switch"
import axiosInstance from "@/utils/axiosInstance"
import { notificationData, subscribeNotficationByIdUrl, subscribeNotficationsUrl } from "@/utils/constants"
import { useEffect, useState } from "react"

export default function NotificationPage() {
    const [notificationInfo, setNotificationInfo] = useState(null)
    const [permissionChecked, setPermissionChecked] = useState(false)

    useEffect(() => {
        const subscriptionJson = JSON.parse(localStorage.getItem(notificationData))
        axiosInstance.get(subscribeNotficationsUrl, {
            params: {
                endpoint: encodeURIComponent(subscriptionJson?.endpoint)
            }
        }).then((response) => {
            setNotificationInfo(response.data)
        }).catch((error) => {
            console.log(error)
        })
    }, [])

    return (
        <div className="flex flex-col w-full flex-1 p-6 gap-5">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <div className="flex flex-col gap-4">
                <div className="flex flex-row items-center gap-2">
                    <span className="text-sm w-40">
                        <strong>Notification Title:</strong>
                    </span>
                    <Switch checked={permissionChecked} onCheckedChange={(checked) => {
                        const newPermissions = null
                        axiosInstance.put(subscribeNotficationByIdUrl(notificationInfo.id), {
                            permissions: newPermissions
                        }).then((response) => {
                            setPermissionChecked(checked)
                        }).catch((error) => {
                            console.log(error)
                        })
                    }} />
                </div>
            </div>
        </div>
    )
}