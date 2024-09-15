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
            setNotificationInfo(response.data)

        }).catch((error) => {
            console.log(error)
            toast.error("Error fetching notifications")
        })
    }, [])

    return (
        <div className="flex flex-col w-full flex-1 p-6 gap-5">
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
                                }).catch((error) => {
                                    console.log(error)
                                    toast.error("Error updating notification permission")
                                })
                            }} />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}