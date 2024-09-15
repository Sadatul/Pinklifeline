'use client'

import StreamVideoProvider from '@/app/providers/StreamVideoProvider';
import { SessionContextProvider } from "@/app/context/sessionContext"
import axiosInstance from "@/utils/axiosInstance";
import { notificationData, subscribeNotficationsUrl } from "@/utils/constants";
import { useEffect, useState } from "react";

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
  useEffect(() => {
    subscribeUser()
  }, [])

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