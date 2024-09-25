'use client'

import { Switch } from "@/components/ui/switch"
import axiosInstance from "@/utils/axiosInstance"
import { notificationData, subscribeNotficationByIdUrl, subscribeNotficationsUrl } from "@/utils/constants"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function NotificationPage() {
    const [notificationInfo, setNotificationInfo] = useState(null)
    const [permissionChecked, setPermissionChecked] = useState(false)
    const [notifications, setNotifications] = useState([{
        name: 'Self Test Notification',
        allow: false
    }, {
        name: "Period Notification",
        allow: false
    }])

    useEffect(() => {
        const subscriptionJson = JSON.parse(localStorage.getItem(notificationData))
        console.log("Retriving Subscription JSON: ", subscriptionJson)
        if (!subscriptionJson?.endpoint) return
        axiosInstance.get(subscribeNotficationsUrl, {
            params: {
                endpoint: encodeURIComponent(subscriptionJson?.endpoint)
            }
        }).then((response) => {
            const bitValue = [response.data.permissions & 1, (response.data.permissions >> 1) & 1]
            setNotifications(prev => prev.map((notification, index) => {
                return {
                    ...notification,
                    allow: bitValue[index] === 1
                }
            }))
            console.log("Notification response: ", response.data)
            setNotificationInfo(response.data)

        }).catch((error) => {
            console.log(error)
            toast.error("Error fetching notifications")
        })
    }, [])

    return (
        <div className="flex flex-col w-full flex-1 p-6 gap-8">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <div className="flex flex-col gap-4">
                {notifications.map((notification, index) => {
                    return (
                        <div key={index} className="flex items-center justify-between w-96">
                            <p>{notification.name}</p>
                            <Switch checked={notification.allow} onCheckedChange={(checked) => {
                                axiosInstance.put(subscribeNotficationByIdUrl(notificationInfo?.id), {
                                    permissions: checked ? notificationInfo?.permissions | (1 << index) : notificationInfo?.permissions & ~(1 << index)
                                }).then((response) => {
                                    setNotifications(prev => prev.map((prevNotification, i) => {
                                        if (i === index) {
                                            return {
                                                ...prevNotification,
                                                allow: checked
                                            }
                                        }
                                        return prevNotification
                                    }))
                                    toast.success("Notification permission updated")
                                }).catch((error) => {
                                    console.log(error)
                                    toast.error("Error updating notification permission")
                                })
                            }} />
                        </div>
                    )
                })}
            </div>
            < div className="flex flex-col gap-2 w-full">
                {/* Disclaimer about what this notification settings will do */}
                <p className="text-lg font-semibold">By enabling these notifications, you agree to receive notifications for the selected options</p>
                <p className="text-lg font-semibold">These notifications are for reminder purposes only</p>
                {/* This notifications help user for self test of breast cancer */}
                <p className="text-lg font-semibold">Self Test Notification: This notification will remind you to take the self test for breast cancer</p>
                {/* This notifications help user for period tracking */}
                <p className="text-lg font-semibold">Period Notification: This notification will remind you to track your period</p>
                <p className="text-lg font-semibold">Period Notification will help up to set an appropriate self test notifications</p>

            </div>
        </div>
    )
}