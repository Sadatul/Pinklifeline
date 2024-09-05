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
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);

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
        axiosInstance.post(subscribeNotficationsUrl, {
          "endpoint": subscriptionJson.endpoint,
          "publicKey": subscriptionJson.keys.p256dh,
          "auth": subscriptionJson.keys.auth,
          "permissions": 1
        }).then((response) => {
          console.log(response)
          console.log("Notification data: ")
          localStorage.setItem(notificationData, JSON.stringify(subscriptionJson))
        }).catch((error) => {
          console.log("Error: ")
          console.log(error)
        })

        console.log('User is subscribed:', subscription);
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
        {/* <StreamVideoProvider> */}
        {children}
        {/* </StreamVideoProvider> */}
      </SessionContextProvider>
    </>
  );
};

export default HomeLayout;