'use client'

import StreamVideoProvider from '@/app/providers/StreamVideoProvider';
import { SessionContextProvider } from "@/app/context/sessionContext"
import axiosInstance from "@/utils/axiosInstance";
import { getProfilePicUrl, notificationData, pagePaths, roles, sessionDataItem, subscribeNotficationsUrl } from "@/utils/constants";
import { useEffect, useState } from "react";
import { usePathname } from 'next/navigation';

const subscribeUser = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        // Register the service worker
        const registration = await navigator.serviceWorker.register('/worker.js');
        console.log('Service Worker registered successfully:', registration);

        // Subscribe the user to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY // Replace with your actual VAPID public key
        });

        console.log('User is subscribed:', subscription);
        const subscriptionJson = subscription.toJSON();
        if (!subscriptionJson.endpoint) return;
        localStorage.setItem(notificationData, JSON.stringify(subscriptionJson))
        console.log("Saved subscription data: ", subscriptionJson)
        axiosInstance.get(subscribeNotficationsUrl, {
          params: {
            "endpoint": encodeURIComponent(subscriptionJson.endpoint),
          }
        }).then((response) => {
        }).catch(async (error) => {
          console.log("Error: ", error)
          if (error?.response?.status === 404) {
            try {
              const responseNotificationPost = await axiosInstance.post(subscribeNotficationsUrl, {
                "endpoint": subscriptionJson.endpoint,
                "publicKey": subscriptionJson.keys.p256dh,
                "auth": subscriptionJson.keys.auth,
                "permissions": 1
              })
              console.log(responseNotificationPost)
              console.log("Notification data: ")
              localStorage.setItem(notificationData, JSON.stringify(subscriptionJson))
            }
            catch (error) {
              console.log("Error: ", error)
            }
          }
        })
      } else {
        console.warn('Notification permission denied');
      }
    } catch (error) {
      console.error('Service Worker registration or subscription failed:', error);
    }
  } else {
    console.warn('Push messaging is not supported in this browser');
  }
};

const HomeLayout = ({ children }) => {
  const [sessionData, setSessionData] = useState(undefined)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname.startsWith("/blogs") && !pathname.startsWith("/forum") && !pathname.startsWith("/hospitals") && !pathname.startsWith("/search")) {
      axiosInstance.get(getProfilePicUrl).then((response) => {
      }).catch((error) => {
        console.log("error getting profilepic for checking authorization", error)
        if (error?.response?.status === 401) {
          localStorage.removeItem(sessionDataItem)
          // window.location.href = pagePaths.login
        }
      }).finally(() => {
        setIsMounted(true)
      })
    }
    else {
      setIsMounted(true)
    }
  }, [])

  useEffect(() => {
    setSessionData(JSON.parse(localStorage.getItem(sessionDataItem)))
  }, [])

  useEffect(() => {
    if (sessionData?.role === roles.patient || sessionData?.role === roles.basicUser) {
      subscribeUser()
    }
  }, [sessionData])

  if (!isMounted) return null

  if (!sessionData) {
    return (
      <SessionContextProvider>
        {children}
      </SessionContextProvider>
    )
  }

  return (
    <>
      <SessionContextProvider>
        <StreamVideoProvider>
          {children}
        </StreamVideoProvider>
      </SessionContextProvider>
    </>
  );
};

export default HomeLayout;